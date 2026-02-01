

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."analyze_project_pattern"("p_project_name" "text", "p_sample_limit" integer DEFAULT 50) RETURNS TABLE("pattern_type" character varying, "pattern_regex" "text", "confidence_score" numeric, "match_count" integer)
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    total_samples INTEGER := 0;
    pattern_record RECORD;
    county_code CHAR(1);
    tbl_name TEXT;
    temp_count INTEGER;
BEGIN
    CREATE TEMP TABLE IF NOT EXISTS temp_pattern_analysis (
        pattern_type VARCHAR(50),
        pattern_regex TEXT,
        match_count INTEGER DEFAULT 0
    ) ON COMMIT DROP;
    
    TRUNCATE temp_pattern_analysis;
    
    -- 插入要測試的模式
    INSERT INTO temp_pattern_analysis (pattern_type, pattern_regex) VALUES
        ('棟-號', '^([A-Z]+)棟([0-9]+)號?$'),
        ('A-1', '^([A-Z]+)-([0-9]+)$'),
        ('A1戶', '^([A-Z]+[0-9]+)戶?$'),
        ('A1', '^([A-Z]+)([0-9]+)$'),
        ('1A', '^([0-9]+)([A-Z]+)$');
    
    -- 找到包含此專案的表格並計算樣本數
    FOR county_code IN SELECT DISTINCT code FROM county_codes LOOP
        tbl_name := format('%s_lvr_land_b', lower(county_code));
        
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = tbl_name
        ) THEN
            EXECUTE format('
                SELECT COUNT(*) FROM (
                    SELECT DISTINCT 戶別
                    FROM %I
                    WHERE 建案名稱 = $1
                      AND 戶別 IS NOT NULL
                      AND trim(戶別) != ''''
                    LIMIT $2
                ) t
            ', tbl_name) INTO temp_count USING p_project_name, p_sample_limit;
            
            total_samples := total_samples + temp_count;
            
            -- 如果找到足夠樣本，分析模式
            IF temp_count >= 5 THEN
                FOR pattern_record IN SELECT * FROM temp_pattern_analysis LOOP
                    EXECUTE format('
                        UPDATE temp_pattern_analysis
                        SET match_count = match_count + (
                            SELECT COUNT(*)
                            FROM (
                                SELECT DISTINCT 戶別
                                FROM %I
                                WHERE 建案名稱 = $1
                                  AND 戶別 IS NOT NULL
                                  AND trim(戶別) != ''''
                                LIMIT $2
                            ) t
                            WHERE UPPER(translate(戶別, 
                                ''ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９－'',
                                ''ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'')) ~ $3
                        )
                        WHERE pattern_type = $4
                    ', tbl_name) 
                    USING p_project_name, p_sample_limit, pattern_record.pattern_regex, pattern_record.pattern_type;
                END LOOP;
            END IF;
        END IF;
    END LOOP;
    
    -- 如果樣本太少，返回空結果
    IF total_samples < 5 THEN
        RETURN;
    END IF;
    
    -- 返回最佳匹配模式
    RETURN QUERY
    SELECT 
        t.pattern_type,
        t.pattern_regex,
        ROUND((t.match_count::DECIMAL / total_samples * 100), 2) as confidence_score,
        t.match_count
    FROM temp_pattern_analysis t
    WHERE t.match_count >= 3  -- 至少3個匹配
      AND (t.match_count::DECIMAL / total_samples) > 0.3  -- 至少30%匹配率
    ORDER BY confidence_score DESC
    LIMIT 1;
END;
$_$;


ALTER FUNCTION "public"."analyze_project_pattern"("p_project_name" "text", "p_sample_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_calculate_main_tables_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    M2_TO_PING CONSTANT DECIMAL := 0.3025;
    v_car_count INTEGER;
    v_start_date DATE;
    v_end_date DATE;
    v_house_price_full DECIMAL;
    v_house_area_full DECIMAL;
BEGIN
    v_car_count := substring(NEW."交易筆棟數" from '車位(\d+)')::INTEGER;
    NEW."車位數" := COALESCE(v_car_count, 0);

    IF TG_TABLE_NAME LIKE '%_lvr_land_a' THEN
        NEW."車位面積(坪)" := ROUND(GREATEST(COALESCE(NEW."車位總面積", 0) * M2_TO_PING, 0), 2);
        NEW."主建物面積(坪)" := ROUND(GREATEST(COALESCE(NEW."主建物面積", 0) * M2_TO_PING, 0), 2);
        NEW."附屬建物面積(坪)" := ROUND(GREATEST(COALESCE(NEW."附屬建物面積", 0) * M2_TO_PING, 0), 2);
        NEW."陽台面積(坪)" := ROUND(GREATEST(COALESCE(NEW."陽台面積", 0) * M2_TO_PING, 0), 2);
        NEW."雨遮、花台、其他(坪)" := ROUND(GREATEST((COALESCE(NEW."附屬建物面積", 0) - COALESCE(NEW."陽台面積", 0)) * M2_TO_PING, 0), 2);
        
        v_house_area_full := GREATEST((COALESCE(NEW."產權面積_房車", 0) - COALESCE(NEW."車位總面積", 0)) * M2_TO_PING, 0);
        NEW."房屋面積(坪)" := ROUND(v_house_area_full, 2);
        
        v_house_price_full := GREATEST(COALESCE(NEW."交易總價", 0) - COALESCE(NEW."車位總價", 0), 0);
        
        NEW."交易總價(萬)" := ROUND(COALESCE(NEW."交易總價", 0) / 10000.0);
        NEW."房屋總價(萬)" := ROUND(v_house_price_full / 10000.0);
        NEW."車位總價(萬)" := ROUND(GREATEST(COALESCE(NEW."車位總價", 0), 0) / 10000.0);
        
        IF (v_house_area_full > 0 AND (v_house_area_full - NEW."雨遮、花台、其他(坪)") > 0) THEN
            NEW."房屋單價(萬)" := ROUND((v_house_price_full / 10000.0) / (v_house_area_full - NEW."雨遮、花台、其他(坪)"), 2);
        ELSE
            NEW."房屋單價(萬)" := 0;
        END IF;

    ELSIF TG_TABLE_NAME LIKE '%_lvr_land_b' THEN
        NEW."樓層" := fn_parse_floor_to_int(NEW."樓層")::TEXT;
        NEW."總樓層" := fn_parse_floor_to_int(NEW."總樓層")::TEXT;
        
        NEW."車位面積(坪)" := ROUND(GREATEST(COALESCE(NEW."車位總面積", 0) * M2_TO_PING, 0), 2);
        
        v_house_area_full := GREATEST((COALESCE(NEW."產權面積_房車", 0) - COALESCE(NEW."車位總面積", 0)) * M2_TO_PING, 0);
        NEW."房屋面積(坪)" := ROUND(v_house_area_full, 2);
        
        v_house_price_full := GREATEST(COALESCE(NEW."交易總價", 0) - COALESCE(NEW."車位總價", 0), 0);
        
        NEW."交易總價(萬)" := ROUND(COALESCE(NEW."交易總價", 0) / 10000.0);
        NEW."房屋總價(萬)" := ROUND(v_house_price_full / 10000.0);
        NEW."車位總價(萬)" := ROUND(GREATEST(COALESCE(NEW."車位總價", 0), 0) / 10000.0);
        
        IF v_house_area_full > 0 THEN
            NEW."房屋單價(萬)" := ROUND((v_house_price_full / 10000.0) / v_house_area_full, 2);
        ELSE
            NEW."房屋單價(萬)" := 0;
        END IF;

    ELSIF TG_TABLE_NAME LIKE '%_lvr_land_c' THEN
        NEW."樓層" := fn_parse_floor_to_int(NEW."樓層")::TEXT;
        NEW."租賃房屋面積(坪)" := ROUND(GREATEST((COALESCE(NEW."租賃面積", 0) - COALESCE(NEW."車位總面積", 0)) * M2_TO_PING, 0), 2);
        
        IF NEW."租賃期間" IS NOT NULL AND NEW."租賃期間" LIKE '%~%' THEN
            v_start_date := fn_parse_roc_to_date(split_part(NEW."租賃期間", '~', 1));
            v_end_date := fn_parse_roc_to_date(split_part(NEW."租賃期間", '~', 2));
            NEW."起租日" := v_start_date;
            IF v_start_date IS NOT NULL AND v_end_date IS NOT NULL AND v_end_date >= v_start_date THEN
                NEW."租賃期(月)" := (EXTRACT(YEAR FROM v_end_date) - EXTRACT(YEAR FROM v_start_date)) * 12 +
                                   (EXTRACT(MONTH FROM v_end_date) - EXTRACT(MONTH FROM v_start_date));
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_calculate_main_tables_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_calculate_sub_tables_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    M2_TO_PING CONSTANT DECIMAL := 0.3025;
BEGIN
    IF TG_TABLE_NAME LIKE '%_park' THEN
        NEW."車位價格(萬)" := ROUND(GREATEST(COALESCE(NEW."車位價格", 0) / 10000.0, 0));
        NEW."車位面積(坪)" := ROUND(GREATEST(COALESCE(NEW."車位面積", 0) * M2_TO_PING, 0), 2);

    ELSIF TG_TABLE_NAME LIKE '%_a_land' THEN
        NEW."土地持分面積(坪)" := ROUND(GREATEST(COALESCE(NEW."土地持分面積", 0) * M2_TO_PING, 0), 2);

    ELSIF TG_TABLE_NAME LIKE '%_b_land' THEN
        NEW."土地持分面積(坪)" := ROUND(GREATEST(COALESCE(NEW."土地持分面積", 0) * M2_TO_PING, 0), 2);
        
    ELSIF TG_TABLE_NAME LIKE '%_c_land' THEN
        NEW."土地租賃面積(坪)" := ROUND(GREATEST(COALESCE(NEW."土地租賃面積", 0) * M2_TO_PING, 0), 2);

    ELSIF TG_TABLE_NAME LIKE '%_c_build' THEN
        NEW."總樓層" := fn_parse_floor_to_int(NEW."總樓層")::TEXT;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."fn_calculate_sub_tables_fields"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_parse_floor_to_int"("floor_text" "text") RETURNS integer
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    num_part TEXT;
BEGIN
    IF floor_text IS NULL OR floor_text = '' THEN
        RETURN NULL;
    END IF;
    
    -- 提取文字中的所有數字部分
    num_part := regexp_replace(floor_text, '[^0-9]', '', 'g');
    IF num_part != '' THEN
        RETURN num_part::INTEGER;
    END IF;

    -- 如果沒有數字，才進行中文比對
    RETURN CASE
        WHEN floor_text LIKE '%一層' OR floor_text = '一' THEN 1
        WHEN floor_text LIKE '%二層' OR floor_text = '二' THEN 2
        WHEN floor_text LIKE '%三層' OR floor_text = '三' THEN 3
        WHEN floor_text LIKE '%四層' OR floor_text = '四' THEN 4
        WHEN floor_text LIKE '%五層' OR floor_text = '五' THEN 5
        WHEN floor_text LIKE '%六層' OR floor_text = '六' THEN 6
        WHEN floor_text LIKE '%七層' OR floor_text = '七' THEN 7
        WHEN floor_text LIKE '%八層' OR floor_text = '八' THEN 8
        WHEN floor_text LIKE '%九層' OR floor_text = '九' THEN 9
        WHEN floor_text LIKE '%十層' OR floor_text = '十' THEN 10
        WHEN floor_text LIKE '%十一層' THEN 11 WHEN floor_text LIKE '%十二層' THEN 12
        WHEN floor_text LIKE '%十三層' THEN 13 WHEN floor_text LIKE '%十四層' THEN 14
        WHEN floor_text LIKE '%十五層' THEN 15 WHEN floor_text LIKE '%十六層' THEN 16
        WHEN floor_text LIKE '%十七層' THEN 17 WHEN floor_text LIKE '%十八層' THEN 18
        WHEN floor_text LIKE '%十九層' THEN 19 WHEN floor_text LIKE '%二十層' THEN 20
        WHEN floor_text LIKE '%二十一層' THEN 21 WHEN floor_text LIKE '%二十二層' THEN 22
        WHEN floor_text LIKE '%二十三層' THEN 23 WHEN floor_text LIKE '%二十四層' THEN 24
        WHEN floor_text LIKE '%二十五層' THEN 25 WHEN floor_text LIKE '%二十六層' THEN 26
        WHEN floor_text LIKE '%二十七層' THEN 27 WHEN floor_text LIKE '%二十八層' THEN 28
        WHEN floor_text LIKE '%二十九層' THEN 29 WHEN floor_text LIKE '%三十層' OR floor_text = '三十' THEN 30
        WHEN floor_text LIKE '%三十一層' THEN 31 WHEN floor_text LIKE '%三十二層' THEN 32
        WHEN floor_text LIKE '%三十三層' THEN 33 WHEN floor_text LIKE '%三十四層' THEN 34
        WHEN floor_text LIKE '%三十五層' THEN 35 WHEN floor_text LIKE '%三十六層' THEN 36
        WHEN floor_text LIKE '%三十七層' THEN 37 WHEN floor_text LIKE '%三十八層' THEN 38
        WHEN floor_text LIKE '%三十九層' THEN 39 WHEN floor_text LIKE '%四十層' THEN 40
        WHEN floor_text LIKE '%四十一層' THEN 41 WHEN floor_text LIKE '%四十二層' THEN 42
        WHEN floor_text LIKE '%四十三層' THEN 43 WHEN floor_text LIKE '%四十四層' THEN 44
        WHEN floor_text LIKE '%四十五層' THEN 45 WHEN floor_text LIKE '%四十六層' THEN 46
        WHEN floor_text LIKE '%四十七層' THEN 47 WHEN floor_text LIKE '%四十八層' THEN 48
        WHEN floor_text LIKE '%四十九層' THEN 49 WHEN floor_text LIKE '%五十層' THEN 50
        WHEN floor_text LIKE '%五十一層' THEN 51 WHEN floor_text LIKE '%五十二層' THEN 52
        WHEN floor_text LIKE '%五十三層' THEN 53 WHEN floor_text LIKE '%五十四層' THEN 54
        WHEN floor_text LIKE '%五十五層' THEN 55 WHEN floor_text LIKE '%五十六層' THEN 56
        WHEN floor_text LIKE '%五十七層' THEN 57 WHEN floor_text LIKE '%五十八層' THEN 58
        WHEN floor_text LIKE '%五十九層' THEN 59 WHEN floor_text LIKE '%六十層' THEN 60
        ELSE NULL
    END;
END;
$$;


ALTER FUNCTION "public"."fn_parse_floor_to_int"("floor_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_parse_roc_to_date"("roc_date_text" "text") RETURNS "date"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
    match_arr TEXT[];
    roc_year INTEGER;
    month INTEGER;
    day INTEGER;
    ad_year INTEGER;
BEGIN
    IF roc_date_text IS NULL OR roc_date_text = '' THEN
        RETURN NULL;
    END IF;
    match_arr := regexp_match(roc_date_text, '(\d{2,3})[^\d]*(\d{1,2})[^\d]*(\d{1,2})');
    IF match_arr IS NULL OR array_length(match_arr, 1) < 3 THEN
        RETURN NULL;
    END IF;
    roc_year := to_number(match_arr[1], '999');
    month := to_number(match_arr[2], '99');
    day := to_number(match_arr[3], '99');
    ad_year := roc_year + 1911;
    RETURN make_date(ad_year, month, day);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."fn_parse_roc_to_date"("roc_date_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transaction_by_serial"("serial_number_param" character varying) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    trans_id BIGINT;
BEGIN
    SELECT id INTO trans_id FROM public.real_estate_transactions WHERE serial_number = serial_number_param;
    
    IF trans_id IS NULL THEN
        RETURN json_build_object('error', '找不到指定的交易記錄');
    END IF;
    
    RETURN public.get_transaction_details(trans_id);
END;
$$;


ALTER FUNCTION "public"."get_transaction_by_serial"("serial_number_param" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transaction_details"("transaction_id_param" bigint) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN (
        SELECT json_build_object(
            'main_data', row_to_json(main.*),
            'sale_details', (SELECT row_to_json(s.*) FROM public.sale_details s WHERE s.transaction_id = transaction_id_param),
            'presale_details', (SELECT row_to_json(p.*) FROM public.presale_details p WHERE p.transaction_id = transaction_id_param),
            'rental_details', (SELECT row_to_json(r.*) FROM public.rental_details r WHERE r.transaction_id = transaction_id_param),
            'building_details', (SELECT json_agg(row_to_json(b.*)) FROM public.building_details b WHERE b.transaction_id = transaction_id_param),
            'land_details', (SELECT json_agg(row_to_json(l.*)) FROM public.land_details l WHERE l.transaction_id = transaction_id_param),
            'parking_details', (SELECT json_agg(row_to_json(pk.*)) FROM public.parking_details pk WHERE pk.transaction_id = transaction_id_param)
        )
        FROM public.real_estate_transactions main
        WHERE main.id = transaction_id_param
    );
END;
$$;


ALTER FUNCTION "public"."get_transaction_details"("transaction_id_param" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."learn_all_project_patterns"() RETURNS TABLE("project_name" "text", "pattern_learned" "text", "confidence" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    project_record RECORD;
    pattern_result RECORD;
    learned_count INTEGER := 0;
    county_code CHAR(1);
    tbl_name TEXT;
    project_count INTEGER := 0;
BEGIN
    RAISE NOTICE '📚 開始學習所有專案的戶別命名模式...';
    
    -- 清空現有規則
    TRUNCATE project_parsing_rules;
    
    -- 從所有縣市表格收集專案
    FOR county_code IN SELECT DISTINCT code FROM county_codes ORDER BY code LOOP
        tbl_name := format('%s_lvr_land_b', lower(county_code));
        
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = tbl_name
        ) THEN
            FOR project_record IN 
                EXECUTE format('
                    SELECT DISTINCT 建案名稱
                    FROM %I
                    WHERE 建案名稱 IS NOT NULL
                      AND EXISTS (
                          SELECT 1 FROM %I b2
                          WHERE b2.建案名稱 = %I.建案名稱
                            AND b2.戶別 IS NOT NULL
                            AND trim(b2.戶別) != ''''
                      )
                ', tbl_name, tbl_name, tbl_name)
            LOOP
                project_count := project_count + 1;
                
                -- 分析該專案的模式
                SELECT * INTO pattern_result
                FROM analyze_project_pattern(project_record.建案名稱, 50)
                LIMIT 1;
                
                IF pattern_result.pattern_type IS NOT NULL THEN
                    -- 插入學習到的規則
                    INSERT INTO project_parsing_rules (
                        project_name, pattern_type, pattern_regex, 
                        confidence_score, sample_count
                    ) VALUES (
                        project_record.建案名稱,
                        pattern_result.pattern_type,
                        pattern_result.pattern_regex,
                        pattern_result.confidence_score,
                        pattern_result.match_count
                    ) ON CONFLICT (project_name) DO NOTHING;
                    
                    learned_count := learned_count + 1;
                    
                    -- 每學習50個專案顯示進度
                    IF learned_count % 50 = 0 THEN
                        RAISE NOTICE '  進度: 已學習 % 個專案模式...', learned_count;
                    END IF;
                    
                    RETURN QUERY
                    SELECT 
                        project_record.建案名稱,
                        pattern_result.pattern_type,
                        pattern_result.confidence_score;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ 完成！共分析 % 個專案，學習了 % 個命名模式', project_count, learned_count;
END;
$$;


ALTER FUNCTION "public"."learn_all_project_patterns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."learn_all_project_patterns_v2"() RETURNS TABLE("p_project_name" "text", "p_rule_type" "text", "p_confidence" numeric, "p_details" "text")
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    v_county_record RECORD;
    v_table_prefix CHAR(1);
    v_project_record RECORD;
    v_project_count INTEGER := 0;
    v_learned_count INTEGER := 0;
    
    -- 用於上下文分析的變數
    v_context_sample RECORD;
    v_confirmation_count INTEGER;
    v_contradiction_count INTEGER;
    v_total_samples INTEGER;
    v_confidence DECIMAL(5,2);
    v_floor_num_in_str TEXT;
BEGIN
    RAISE NOTICE '📚 V9.1 開始學習所有專案的戶別命名模式 (上下文關聯分析)...';
    
    -- 清空現有規則
    TRUNCATE project_parsing_rules_v2;

    -- 遍歷所有縣市的資料表
    FOR v_county_record IN SELECT code, name_zh FROM county_codes ORDER BY code LOOP
        v_table_prefix := lower(v_county_record.code);
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = format('%s_lvr_land_b', v_table_prefix) AND table_schema = 'public') THEN
            CONTINUE;
        END IF;

        -- 在每個表中，遍歷所有建案
        FOR v_project_record IN EXECUTE format('SELECT DISTINCT "建案名稱" FROM %I_lvr_land_b WHERE "建案名稱" IS NOT NULL', v_table_prefix) LOOP
            v_project_count := v_project_count + 1;
            
            -- 初始化計數器
            v_confirmation_count := 0;
            v_contradiction_count := 0;
            v_total_samples := 0;

            -- Phase 1: 進行「F標記」的上下文關聯分析 (Hypothesis Testing)
            -- 提取所有包含 '數字+F' 格式的戶別，以及其對應的樓層欄位
            FOR v_context_sample IN EXECUTE format(
                'SELECT "戶別", "樓層" FROM %I_lvr_land_b WHERE "建案名稱" = $1 AND "戶別" ~ ''[0-9]F'' AND "樓層" IS NOT NULL LIMIT 100',
                v_table_prefix
            ) USING v_project_record."建案名稱" LOOP
                
                v_total_samples := v_total_samples + 1;
                
                -- 從戶別中提取F旁邊的數字
                v_floor_num_in_str := (regexp_match(v_context_sample."戶別", '([0-9]+)F'))[1];
                
                -- 驗證：戶別中的數字是否等於樓層欄位的數字？
                IF v_floor_num_in_str = regexp_replace(v_context_sample."樓層", '[^0-9]', '', 'g') THEN
                    v_confirmation_count := v_confirmation_count + 1; -- 假設被證實
                ELSE
                    v_contradiction_count := v_contradiction_count + 1; -- 假設被推翻
                END IF;
            END LOOP;
            
            -- Phase 2: 根據驗證結果生成規則
            IF v_total_samples >= 5 THEN -- 只有當有足夠樣本時才進行判斷
                -- 情況 A: 高度證實 "F旁的數字" 就是樓層
                v_confidence := (v_confirmation_count::decimal / v_total_samples) * 100;
                IF v_confidence >= 80.0 THEN
                    INSERT INTO project_parsing_rules_v2 (project_name, rule_type, extraction_regex, confidence_score, sample_count)
                    VALUES (v_project_record."建案名稱", 'FLOOR_IS_NOISE', '[0-9]+F(樓|號)?\b?', v_confidence, v_total_samples)
                    ON CONFLICT(project_name) DO NOTHING;
                    
                    v_learned_count := v_learned_count + 1;
                    RETURN QUERY SELECT v_project_record."建案名稱"::TEXT, 'FLOOR_IS_NOISE'::TEXT, v_confidence, format('%s/%s 符合', v_confirmation_count, v_total_samples)::TEXT;
                    CONTINUE; -- 處理下一個建案
                END IF;

                -- 情況 B: 高度證實 "F旁的數字" 不是樓層, 而是戶別一部分
                v_confidence := (v_contradiction_count::decimal / v_total_samples) * 100;
                IF v_confidence >= 80.0 THEN
                    -- 這裡我們建立一個專門解析 A-3F號 -> A3 的規則
                    INSERT INTO project_parsing_rules_v2 (project_name, rule_type, extraction_regex, parser_logic, confidence_score, sample_count)
                    VALUES (v_project_record."建案名稱", 'CAPTURE_COMBINE', '^([A-Z])-([0-9]+)F.*', '\1\2', v_confidence, v_total_samples)
                    ON CONFLICT(project_name) DO NOTHING;

                    v_learned_count := v_learned_count + 1;
                    RETURN QUERY SELECT v_project_record."建案名稱"::TEXT, 'CAPTURE_COMBINE'::TEXT, v_confidence, format('%s/%s 不符合', v_contradiction_count, v_total_samples)::TEXT;
                    CONTINUE; -- 處理下一個建案
                END IF;
            END IF;
            
            -- Phase 3: (若無特殊關聯) fallback 到舊版的簡單Regex學習模式 (此處為簡化版)
            -- 可以在此處加入 V8 的 analyze_project_pattern 邏輯來學習簡單規則
            -- INSERT INTO project_parsing_rules_v2 (..., rule_type, ...) VALUES (..., 'REGEX_SIMPLE', ...);

        END LOOP;
    END LOOP;
    RAISE NOTICE '✅ V9.1 學習完成！共分析 % 個專案，學習了 % 個特殊關聯規則', v_project_count, v_learned_count;
END;
$_$;


ALTER FUNCTION "public"."learn_all_project_patterns_v2"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."perform_analysis"("p_county_code" "text", "p_group_by_column" "text", "p_metric_column" "text", "p_building_type" "text" DEFAULT NULL::"text", "p_project_names" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("group_key" "text", "metric_value" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  target_table TEXT;
  where_clause TEXT;
BEGIN
  -- 此函式目前專為預售屋 (_lvr_land_b) 設計
  target_table := LOWER(p_county_code) || '_lvr_land_b';

  -- 建立 WHERE 條件，並過濾掉指標欄位或分組欄位為 NULL 的資料
  where_clause := format(' WHERE %I IS NOT NULL AND %I IS NOT NULL AND %I > 0', 
                          p_metric_column, p_group_by_column, p_metric_column);

  -- 動態地組合篩選條件
  IF p_building_type IS NOT NULL AND p_building_type != '' THEN
    where_clause := where_clause || format(' AND "建物型態" = %L', p_building_type);
  END IF;

  IF p_project_names IS NOT NULL AND array_length(p_project_names, 1) > 0 THEN
    where_clause := where_clause || format(' AND "建案名稱" = ANY(%L)', p_project_names);
  END IF;

  -- 動態建立並執行最終的查詢
  -- %I 用於安全地插入欄位名稱
  RETURN QUERY EXECUTE format(
    'SELECT
      %I::TEXT AS "group_key",
      CAST(ROUND(AVG(%I), 2) AS NUMERIC) AS "metric_value"
    FROM public.%I
    %s
    GROUP BY %I
    ORDER BY "metric_value" DESC',
    p_group_by_column, -- SELECT
    p_metric_column,   -- AVG
    target_table,      -- FROM
    where_clause,      -- WHERE
    p_group_by_column  -- GROUP BY
  );
END;
$$;


ALTER FUNCTION "public"."perform_analysis"("p_county_code" "text", "p_group_by_column" "text", "p_metric_column" "text", "p_building_type" "text", "p_project_names" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_all_transactions_view"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    view_sql TEXT;
    county_record RECORD;
    table_prefix CHAR(1);
BEGIN
    view_sql := '';

    -- 遍歷所有縣市代碼
    FOR county_record IN SELECT code FROM county_codes ORDER BY code LOOP
        table_prefix := lower(county_record.code);

        -- 為每個縣市的三種交易類型建立 UNION ALL 子查詢
        view_sql := view_sql || format('
            SELECT 
                %L as 縣市代碼,
                ''中古交易'' as 交易類型,
                編號, 行政區, 交易標的, 地址, 交易日 as 交易日期,
                建物型態, 主要用途, 產權面積_房車 as 建物面積,
                房數, 廳數, 衛浴數,
                交易總價 as 總價, 車位類別, 車位總價 as 車位總價
            FROM %I_lvr_land_a
            UNION ALL
            SELECT 
                %L as 縣市代碼,
                ''預售交易'' as 交易類型,
                編號, 行政區, 交易標的, 地址, 交易日 as 交易日期,
                建物型態, 主要用途, 產權面積_房車 as 建物面積,
                房數, 廳數, 衛浴數,
                交易總價 as 總價, 車位類別, 車位總價 as 車位總價
            FROM %I_lvr_land_b
            UNION ALL
            SELECT 
                %L as 縣市代碼,
                ''租賃交易'' as 交易類型,
                編號, 行政區, 交易標的, 地址, 交易日 as 交易日期,
                建物型態, 主要用途, 租賃面積 as 建物面積,
                房數, 廳數, 衛浴數,
                交易總價 as 總價, 車位類別, 車位總價 as 車位總價
            FROM %I_lvr_land_c
        ', county_record.code, table_prefix, 
           county_record.code, table_prefix, 
           county_record.code, table_prefix
        );

        -- 如果不是最後一個縣市，則在結尾加上 UNION ALL
        IF EXISTS (SELECT 1 FROM county_codes WHERE code > county_record.code) THEN
            view_sql := view_sql || ' UNION ALL ';
        END IF;
    END LOOP;

    -- 組合完整的 CREATE VIEW 語句並執行
    IF length(view_sql) > 0 THEN
        EXECUTE 'CREATE OR REPLACE VIEW all_transactions_view AS ' || view_sql;
        RAISE NOTICE '視圖 all_transactions_view 已成功建立或更新。';
    ELSE
        RAISE NOTICE '沒有找到任何縣市表格，無法建立視圖。';
    END IF;
END;
$$;


ALTER FUNCTION "public"."refresh_all_transactions_view"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_project_names"("county_code" "text", "search_query" "text") RETURNS TABLE("建案名稱" "text", "similarity_score" real)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- 【最終修正】調整 format 函式中參數的順序，使其與查詢字串中的 %L 和 %I 佔位符一一對應
  RETURN QUERY EXECUTE format(
    'SELECT DISTINCT "建案名稱", similarity("建案名稱", %L) AS similarity_score
     FROM %I
     WHERE similarity("建案名稱", %L) > 0.1 -- 設定一個相似度門檻
     ORDER BY similarity_score DESC -- 現在可以根據別名來排序
     LIMIT 50',
    search_query,                      -- 對應第一個 %L
    LOWER(county_code) || '_lvr_land_b', -- 對應 %I
    search_query                       -- 對應第二個 %L
  );
END;
$$;


ALTER FUNCTION "public"."search_project_names"("county_code" "text", "search_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2),
    "戶別." "text"
);


ALTER TABLE "public"."a_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."a_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_a_build_id_seq" OWNED BY "public"."a_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."a_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_a_land_id_seq" OWNED BY "public"."a_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."a_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_a_park_id_seq" OWNED BY "public"."a_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."a_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."a_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_b_land_id_seq" OWNED BY "public"."a_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."a_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_b_park_id_seq" OWNED BY "public"."a_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."a_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."a_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_c_build_id_seq" OWNED BY "public"."a_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."a_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_c_land_id_seq" OWNED BY "public"."a_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."a_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."a_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."a_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."a_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."a_lvr_land_c_park_id_seq" OWNED BY "public"."a_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."b_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."b_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."b_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."c_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."c_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."c_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."d_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."d_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."d_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."e_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."e_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."e_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."f_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."f_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."f_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."g_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."g_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."g_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."h_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."h_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."h_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."i_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."i_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."i_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."j_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."j_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."j_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."k_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."k_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."k_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."m_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."m_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."m_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."n_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."n_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."n_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."o_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."o_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."o_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."p_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."p_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."p_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."q_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."q_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."q_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."t_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."t_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."t_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."u_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."u_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."u_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."v_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."v_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."v_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."w_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."w_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."w_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."x_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."x_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."x_lvr_land_c" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_a" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "主建物面積" numeric(10,2),
    "附屬建物面積" numeric(10,2),
    "陽台面積" numeric(10,2),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "主建物面積(坪)" numeric(10,2),
    "附屬建物面積(坪)" numeric(10,2),
    "陽台面積(坪)" numeric(10,2),
    "雨遮、花台、其他(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."z_lvr_land_a" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_b" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "建案名稱" "text",
    "戶別" "text",
    "解約情形" "text",
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


ALTER TABLE "public"."z_lvr_land_b" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_c" (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" "text",
    "地址" "text",
    "交易日" "date",
    "交易筆棟數" "text",
    "樓層" "text",
    "建物型態" "text",
    "主要用途" "text",
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" "text",
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" "text",
    "出租型態" "text",
    "租賃期間" "text",
    "附屬設備" "text",
    "租賃住宅服務" "text",
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" "date",
    "租賃期(月)" integer
);


ALTER TABLE "public"."z_lvr_land_c" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."all_transactions_view" AS
 SELECT 'A'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "a_lvr_land_a"."編號",
    "a_lvr_land_a"."行政區",
    "a_lvr_land_a"."交易標的",
    "a_lvr_land_a"."地址",
    "a_lvr_land_a"."交易日" AS "交易日期",
    "a_lvr_land_a"."建物型態",
    "a_lvr_land_a"."主要用途",
    "a_lvr_land_a"."產權面積_房車" AS "建物面積",
    "a_lvr_land_a"."房數",
    "a_lvr_land_a"."廳數",
    "a_lvr_land_a"."衛浴數",
    "a_lvr_land_a"."交易總價" AS "總價",
    "a_lvr_land_a"."車位類別",
    "a_lvr_land_a"."車位總價"
   FROM "public"."a_lvr_land_a"
UNION ALL
 SELECT 'A'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "a_lvr_land_b"."編號",
    "a_lvr_land_b"."行政區",
    "a_lvr_land_b"."交易標的",
    "a_lvr_land_b"."地址",
    "a_lvr_land_b"."交易日" AS "交易日期",
    "a_lvr_land_b"."建物型態",
    "a_lvr_land_b"."主要用途",
    "a_lvr_land_b"."產權面積_房車" AS "建物面積",
    "a_lvr_land_b"."房數",
    "a_lvr_land_b"."廳數",
    "a_lvr_land_b"."衛浴數",
    "a_lvr_land_b"."交易總價" AS "總價",
    "a_lvr_land_b"."車位類別",
    "a_lvr_land_b"."車位總價"
   FROM "public"."a_lvr_land_b"
UNION ALL
 SELECT 'A'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "a_lvr_land_c"."編號",
    "a_lvr_land_c"."行政區",
    "a_lvr_land_c"."交易標的",
    "a_lvr_land_c"."地址",
    "a_lvr_land_c"."交易日" AS "交易日期",
    "a_lvr_land_c"."建物型態",
    "a_lvr_land_c"."主要用途",
    "a_lvr_land_c"."租賃面積" AS "建物面積",
    "a_lvr_land_c"."房數",
    "a_lvr_land_c"."廳數",
    "a_lvr_land_c"."衛浴數",
    "a_lvr_land_c"."交易總價" AS "總價",
    "a_lvr_land_c"."車位類別",
    "a_lvr_land_c"."車位總價"
   FROM "public"."a_lvr_land_c"
UNION ALL
 SELECT 'B'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "b_lvr_land_a"."編號",
    "b_lvr_land_a"."行政區",
    "b_lvr_land_a"."交易標的",
    "b_lvr_land_a"."地址",
    "b_lvr_land_a"."交易日" AS "交易日期",
    "b_lvr_land_a"."建物型態",
    "b_lvr_land_a"."主要用途",
    "b_lvr_land_a"."產權面積_房車" AS "建物面積",
    "b_lvr_land_a"."房數",
    "b_lvr_land_a"."廳數",
    "b_lvr_land_a"."衛浴數",
    "b_lvr_land_a"."交易總價" AS "總價",
    "b_lvr_land_a"."車位類別",
    "b_lvr_land_a"."車位總價"
   FROM "public"."b_lvr_land_a"
UNION ALL
 SELECT 'B'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "b_lvr_land_b"."編號",
    "b_lvr_land_b"."行政區",
    "b_lvr_land_b"."交易標的",
    "b_lvr_land_b"."地址",
    "b_lvr_land_b"."交易日" AS "交易日期",
    "b_lvr_land_b"."建物型態",
    "b_lvr_land_b"."主要用途",
    "b_lvr_land_b"."產權面積_房車" AS "建物面積",
    "b_lvr_land_b"."房數",
    "b_lvr_land_b"."廳數",
    "b_lvr_land_b"."衛浴數",
    "b_lvr_land_b"."交易總價" AS "總價",
    "b_lvr_land_b"."車位類別",
    "b_lvr_land_b"."車位總價"
   FROM "public"."b_lvr_land_b"
UNION ALL
 SELECT 'B'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "b_lvr_land_c"."編號",
    "b_lvr_land_c"."行政區",
    "b_lvr_land_c"."交易標的",
    "b_lvr_land_c"."地址",
    "b_lvr_land_c"."交易日" AS "交易日期",
    "b_lvr_land_c"."建物型態",
    "b_lvr_land_c"."主要用途",
    "b_lvr_land_c"."租賃面積" AS "建物面積",
    "b_lvr_land_c"."房數",
    "b_lvr_land_c"."廳數",
    "b_lvr_land_c"."衛浴數",
    "b_lvr_land_c"."交易總價" AS "總價",
    "b_lvr_land_c"."車位類別",
    "b_lvr_land_c"."車位總價"
   FROM "public"."b_lvr_land_c"
UNION ALL
 SELECT 'C'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "c_lvr_land_a"."編號",
    "c_lvr_land_a"."行政區",
    "c_lvr_land_a"."交易標的",
    "c_lvr_land_a"."地址",
    "c_lvr_land_a"."交易日" AS "交易日期",
    "c_lvr_land_a"."建物型態",
    "c_lvr_land_a"."主要用途",
    "c_lvr_land_a"."產權面積_房車" AS "建物面積",
    "c_lvr_land_a"."房數",
    "c_lvr_land_a"."廳數",
    "c_lvr_land_a"."衛浴數",
    "c_lvr_land_a"."交易總價" AS "總價",
    "c_lvr_land_a"."車位類別",
    "c_lvr_land_a"."車位總價"
   FROM "public"."c_lvr_land_a"
UNION ALL
 SELECT 'C'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "c_lvr_land_b"."編號",
    "c_lvr_land_b"."行政區",
    "c_lvr_land_b"."交易標的",
    "c_lvr_land_b"."地址",
    "c_lvr_land_b"."交易日" AS "交易日期",
    "c_lvr_land_b"."建物型態",
    "c_lvr_land_b"."主要用途",
    "c_lvr_land_b"."產權面積_房車" AS "建物面積",
    "c_lvr_land_b"."房數",
    "c_lvr_land_b"."廳數",
    "c_lvr_land_b"."衛浴數",
    "c_lvr_land_b"."交易總價" AS "總價",
    "c_lvr_land_b"."車位類別",
    "c_lvr_land_b"."車位總價"
   FROM "public"."c_lvr_land_b"
UNION ALL
 SELECT 'C'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "c_lvr_land_c"."編號",
    "c_lvr_land_c"."行政區",
    "c_lvr_land_c"."交易標的",
    "c_lvr_land_c"."地址",
    "c_lvr_land_c"."交易日" AS "交易日期",
    "c_lvr_land_c"."建物型態",
    "c_lvr_land_c"."主要用途",
    "c_lvr_land_c"."租賃面積" AS "建物面積",
    "c_lvr_land_c"."房數",
    "c_lvr_land_c"."廳數",
    "c_lvr_land_c"."衛浴數",
    "c_lvr_land_c"."交易總價" AS "總價",
    "c_lvr_land_c"."車位類別",
    "c_lvr_land_c"."車位總價"
   FROM "public"."c_lvr_land_c"
UNION ALL
 SELECT 'D'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "d_lvr_land_a"."編號",
    "d_lvr_land_a"."行政區",
    "d_lvr_land_a"."交易標的",
    "d_lvr_land_a"."地址",
    "d_lvr_land_a"."交易日" AS "交易日期",
    "d_lvr_land_a"."建物型態",
    "d_lvr_land_a"."主要用途",
    "d_lvr_land_a"."產權面積_房車" AS "建物面積",
    "d_lvr_land_a"."房數",
    "d_lvr_land_a"."廳數",
    "d_lvr_land_a"."衛浴數",
    "d_lvr_land_a"."交易總價" AS "總價",
    "d_lvr_land_a"."車位類別",
    "d_lvr_land_a"."車位總價"
   FROM "public"."d_lvr_land_a"
UNION ALL
 SELECT 'D'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "d_lvr_land_b"."編號",
    "d_lvr_land_b"."行政區",
    "d_lvr_land_b"."交易標的",
    "d_lvr_land_b"."地址",
    "d_lvr_land_b"."交易日" AS "交易日期",
    "d_lvr_land_b"."建物型態",
    "d_lvr_land_b"."主要用途",
    "d_lvr_land_b"."產權面積_房車" AS "建物面積",
    "d_lvr_land_b"."房數",
    "d_lvr_land_b"."廳數",
    "d_lvr_land_b"."衛浴數",
    "d_lvr_land_b"."交易總價" AS "總價",
    "d_lvr_land_b"."車位類別",
    "d_lvr_land_b"."車位總價"
   FROM "public"."d_lvr_land_b"
UNION ALL
 SELECT 'D'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "d_lvr_land_c"."編號",
    "d_lvr_land_c"."行政區",
    "d_lvr_land_c"."交易標的",
    "d_lvr_land_c"."地址",
    "d_lvr_land_c"."交易日" AS "交易日期",
    "d_lvr_land_c"."建物型態",
    "d_lvr_land_c"."主要用途",
    "d_lvr_land_c"."租賃面積" AS "建物面積",
    "d_lvr_land_c"."房數",
    "d_lvr_land_c"."廳數",
    "d_lvr_land_c"."衛浴數",
    "d_lvr_land_c"."交易總價" AS "總價",
    "d_lvr_land_c"."車位類別",
    "d_lvr_land_c"."車位總價"
   FROM "public"."d_lvr_land_c"
UNION ALL
 SELECT 'E'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "e_lvr_land_a"."編號",
    "e_lvr_land_a"."行政區",
    "e_lvr_land_a"."交易標的",
    "e_lvr_land_a"."地址",
    "e_lvr_land_a"."交易日" AS "交易日期",
    "e_lvr_land_a"."建物型態",
    "e_lvr_land_a"."主要用途",
    "e_lvr_land_a"."產權面積_房車" AS "建物面積",
    "e_lvr_land_a"."房數",
    "e_lvr_land_a"."廳數",
    "e_lvr_land_a"."衛浴數",
    "e_lvr_land_a"."交易總價" AS "總價",
    "e_lvr_land_a"."車位類別",
    "e_lvr_land_a"."車位總價"
   FROM "public"."e_lvr_land_a"
UNION ALL
 SELECT 'E'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "e_lvr_land_b"."編號",
    "e_lvr_land_b"."行政區",
    "e_lvr_land_b"."交易標的",
    "e_lvr_land_b"."地址",
    "e_lvr_land_b"."交易日" AS "交易日期",
    "e_lvr_land_b"."建物型態",
    "e_lvr_land_b"."主要用途",
    "e_lvr_land_b"."產權面積_房車" AS "建物面積",
    "e_lvr_land_b"."房數",
    "e_lvr_land_b"."廳數",
    "e_lvr_land_b"."衛浴數",
    "e_lvr_land_b"."交易總價" AS "總價",
    "e_lvr_land_b"."車位類別",
    "e_lvr_land_b"."車位總價"
   FROM "public"."e_lvr_land_b"
UNION ALL
 SELECT 'E'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "e_lvr_land_c"."編號",
    "e_lvr_land_c"."行政區",
    "e_lvr_land_c"."交易標的",
    "e_lvr_land_c"."地址",
    "e_lvr_land_c"."交易日" AS "交易日期",
    "e_lvr_land_c"."建物型態",
    "e_lvr_land_c"."主要用途",
    "e_lvr_land_c"."租賃面積" AS "建物面積",
    "e_lvr_land_c"."房數",
    "e_lvr_land_c"."廳數",
    "e_lvr_land_c"."衛浴數",
    "e_lvr_land_c"."交易總價" AS "總價",
    "e_lvr_land_c"."車位類別",
    "e_lvr_land_c"."車位總價"
   FROM "public"."e_lvr_land_c"
UNION ALL
 SELECT 'F'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "f_lvr_land_a"."編號",
    "f_lvr_land_a"."行政區",
    "f_lvr_land_a"."交易標的",
    "f_lvr_land_a"."地址",
    "f_lvr_land_a"."交易日" AS "交易日期",
    "f_lvr_land_a"."建物型態",
    "f_lvr_land_a"."主要用途",
    "f_lvr_land_a"."產權面積_房車" AS "建物面積",
    "f_lvr_land_a"."房數",
    "f_lvr_land_a"."廳數",
    "f_lvr_land_a"."衛浴數",
    "f_lvr_land_a"."交易總價" AS "總價",
    "f_lvr_land_a"."車位類別",
    "f_lvr_land_a"."車位總價"
   FROM "public"."f_lvr_land_a"
UNION ALL
 SELECT 'F'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "f_lvr_land_b"."編號",
    "f_lvr_land_b"."行政區",
    "f_lvr_land_b"."交易標的",
    "f_lvr_land_b"."地址",
    "f_lvr_land_b"."交易日" AS "交易日期",
    "f_lvr_land_b"."建物型態",
    "f_lvr_land_b"."主要用途",
    "f_lvr_land_b"."產權面積_房車" AS "建物面積",
    "f_lvr_land_b"."房數",
    "f_lvr_land_b"."廳數",
    "f_lvr_land_b"."衛浴數",
    "f_lvr_land_b"."交易總價" AS "總價",
    "f_lvr_land_b"."車位類別",
    "f_lvr_land_b"."車位總價"
   FROM "public"."f_lvr_land_b"
UNION ALL
 SELECT 'F'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "f_lvr_land_c"."編號",
    "f_lvr_land_c"."行政區",
    "f_lvr_land_c"."交易標的",
    "f_lvr_land_c"."地址",
    "f_lvr_land_c"."交易日" AS "交易日期",
    "f_lvr_land_c"."建物型態",
    "f_lvr_land_c"."主要用途",
    "f_lvr_land_c"."租賃面積" AS "建物面積",
    "f_lvr_land_c"."房數",
    "f_lvr_land_c"."廳數",
    "f_lvr_land_c"."衛浴數",
    "f_lvr_land_c"."交易總價" AS "總價",
    "f_lvr_land_c"."車位類別",
    "f_lvr_land_c"."車位總價"
   FROM "public"."f_lvr_land_c"
UNION ALL
 SELECT 'G'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "g_lvr_land_a"."編號",
    "g_lvr_land_a"."行政區",
    "g_lvr_land_a"."交易標的",
    "g_lvr_land_a"."地址",
    "g_lvr_land_a"."交易日" AS "交易日期",
    "g_lvr_land_a"."建物型態",
    "g_lvr_land_a"."主要用途",
    "g_lvr_land_a"."產權面積_房車" AS "建物面積",
    "g_lvr_land_a"."房數",
    "g_lvr_land_a"."廳數",
    "g_lvr_land_a"."衛浴數",
    "g_lvr_land_a"."交易總價" AS "總價",
    "g_lvr_land_a"."車位類別",
    "g_lvr_land_a"."車位總價"
   FROM "public"."g_lvr_land_a"
UNION ALL
 SELECT 'G'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "g_lvr_land_b"."編號",
    "g_lvr_land_b"."行政區",
    "g_lvr_land_b"."交易標的",
    "g_lvr_land_b"."地址",
    "g_lvr_land_b"."交易日" AS "交易日期",
    "g_lvr_land_b"."建物型態",
    "g_lvr_land_b"."主要用途",
    "g_lvr_land_b"."產權面積_房車" AS "建物面積",
    "g_lvr_land_b"."房數",
    "g_lvr_land_b"."廳數",
    "g_lvr_land_b"."衛浴數",
    "g_lvr_land_b"."交易總價" AS "總價",
    "g_lvr_land_b"."車位類別",
    "g_lvr_land_b"."車位總價"
   FROM "public"."g_lvr_land_b"
UNION ALL
 SELECT 'G'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "g_lvr_land_c"."編號",
    "g_lvr_land_c"."行政區",
    "g_lvr_land_c"."交易標的",
    "g_lvr_land_c"."地址",
    "g_lvr_land_c"."交易日" AS "交易日期",
    "g_lvr_land_c"."建物型態",
    "g_lvr_land_c"."主要用途",
    "g_lvr_land_c"."租賃面積" AS "建物面積",
    "g_lvr_land_c"."房數",
    "g_lvr_land_c"."廳數",
    "g_lvr_land_c"."衛浴數",
    "g_lvr_land_c"."交易總價" AS "總價",
    "g_lvr_land_c"."車位類別",
    "g_lvr_land_c"."車位總價"
   FROM "public"."g_lvr_land_c"
UNION ALL
 SELECT 'H'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "h_lvr_land_a"."編號",
    "h_lvr_land_a"."行政區",
    "h_lvr_land_a"."交易標的",
    "h_lvr_land_a"."地址",
    "h_lvr_land_a"."交易日" AS "交易日期",
    "h_lvr_land_a"."建物型態",
    "h_lvr_land_a"."主要用途",
    "h_lvr_land_a"."產權面積_房車" AS "建物面積",
    "h_lvr_land_a"."房數",
    "h_lvr_land_a"."廳數",
    "h_lvr_land_a"."衛浴數",
    "h_lvr_land_a"."交易總價" AS "總價",
    "h_lvr_land_a"."車位類別",
    "h_lvr_land_a"."車位總價"
   FROM "public"."h_lvr_land_a"
UNION ALL
 SELECT 'H'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "h_lvr_land_b"."編號",
    "h_lvr_land_b"."行政區",
    "h_lvr_land_b"."交易標的",
    "h_lvr_land_b"."地址",
    "h_lvr_land_b"."交易日" AS "交易日期",
    "h_lvr_land_b"."建物型態",
    "h_lvr_land_b"."主要用途",
    "h_lvr_land_b"."產權面積_房車" AS "建物面積",
    "h_lvr_land_b"."房數",
    "h_lvr_land_b"."廳數",
    "h_lvr_land_b"."衛浴數",
    "h_lvr_land_b"."交易總價" AS "總價",
    "h_lvr_land_b"."車位類別",
    "h_lvr_land_b"."車位總價"
   FROM "public"."h_lvr_land_b"
UNION ALL
 SELECT 'H'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "h_lvr_land_c"."編號",
    "h_lvr_land_c"."行政區",
    "h_lvr_land_c"."交易標的",
    "h_lvr_land_c"."地址",
    "h_lvr_land_c"."交易日" AS "交易日期",
    "h_lvr_land_c"."建物型態",
    "h_lvr_land_c"."主要用途",
    "h_lvr_land_c"."租賃面積" AS "建物面積",
    "h_lvr_land_c"."房數",
    "h_lvr_land_c"."廳數",
    "h_lvr_land_c"."衛浴數",
    "h_lvr_land_c"."交易總價" AS "總價",
    "h_lvr_land_c"."車位類別",
    "h_lvr_land_c"."車位總價"
   FROM "public"."h_lvr_land_c"
UNION ALL
 SELECT 'I'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "i_lvr_land_a"."編號",
    "i_lvr_land_a"."行政區",
    "i_lvr_land_a"."交易標的",
    "i_lvr_land_a"."地址",
    "i_lvr_land_a"."交易日" AS "交易日期",
    "i_lvr_land_a"."建物型態",
    "i_lvr_land_a"."主要用途",
    "i_lvr_land_a"."產權面積_房車" AS "建物面積",
    "i_lvr_land_a"."房數",
    "i_lvr_land_a"."廳數",
    "i_lvr_land_a"."衛浴數",
    "i_lvr_land_a"."交易總價" AS "總價",
    "i_lvr_land_a"."車位類別",
    "i_lvr_land_a"."車位總價"
   FROM "public"."i_lvr_land_a"
UNION ALL
 SELECT 'I'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "i_lvr_land_b"."編號",
    "i_lvr_land_b"."行政區",
    "i_lvr_land_b"."交易標的",
    "i_lvr_land_b"."地址",
    "i_lvr_land_b"."交易日" AS "交易日期",
    "i_lvr_land_b"."建物型態",
    "i_lvr_land_b"."主要用途",
    "i_lvr_land_b"."產權面積_房車" AS "建物面積",
    "i_lvr_land_b"."房數",
    "i_lvr_land_b"."廳數",
    "i_lvr_land_b"."衛浴數",
    "i_lvr_land_b"."交易總價" AS "總價",
    "i_lvr_land_b"."車位類別",
    "i_lvr_land_b"."車位總價"
   FROM "public"."i_lvr_land_b"
UNION ALL
 SELECT 'I'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "i_lvr_land_c"."編號",
    "i_lvr_land_c"."行政區",
    "i_lvr_land_c"."交易標的",
    "i_lvr_land_c"."地址",
    "i_lvr_land_c"."交易日" AS "交易日期",
    "i_lvr_land_c"."建物型態",
    "i_lvr_land_c"."主要用途",
    "i_lvr_land_c"."租賃面積" AS "建物面積",
    "i_lvr_land_c"."房數",
    "i_lvr_land_c"."廳數",
    "i_lvr_land_c"."衛浴數",
    "i_lvr_land_c"."交易總價" AS "總價",
    "i_lvr_land_c"."車位類別",
    "i_lvr_land_c"."車位總價"
   FROM "public"."i_lvr_land_c"
UNION ALL
 SELECT 'J'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "j_lvr_land_a"."編號",
    "j_lvr_land_a"."行政區",
    "j_lvr_land_a"."交易標的",
    "j_lvr_land_a"."地址",
    "j_lvr_land_a"."交易日" AS "交易日期",
    "j_lvr_land_a"."建物型態",
    "j_lvr_land_a"."主要用途",
    "j_lvr_land_a"."產權面積_房車" AS "建物面積",
    "j_lvr_land_a"."房數",
    "j_lvr_land_a"."廳數",
    "j_lvr_land_a"."衛浴數",
    "j_lvr_land_a"."交易總價" AS "總價",
    "j_lvr_land_a"."車位類別",
    "j_lvr_land_a"."車位總價"
   FROM "public"."j_lvr_land_a"
UNION ALL
 SELECT 'J'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "j_lvr_land_b"."編號",
    "j_lvr_land_b"."行政區",
    "j_lvr_land_b"."交易標的",
    "j_lvr_land_b"."地址",
    "j_lvr_land_b"."交易日" AS "交易日期",
    "j_lvr_land_b"."建物型態",
    "j_lvr_land_b"."主要用途",
    "j_lvr_land_b"."產權面積_房車" AS "建物面積",
    "j_lvr_land_b"."房數",
    "j_lvr_land_b"."廳數",
    "j_lvr_land_b"."衛浴數",
    "j_lvr_land_b"."交易總價" AS "總價",
    "j_lvr_land_b"."車位類別",
    "j_lvr_land_b"."車位總價"
   FROM "public"."j_lvr_land_b"
UNION ALL
 SELECT 'J'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "j_lvr_land_c"."編號",
    "j_lvr_land_c"."行政區",
    "j_lvr_land_c"."交易標的",
    "j_lvr_land_c"."地址",
    "j_lvr_land_c"."交易日" AS "交易日期",
    "j_lvr_land_c"."建物型態",
    "j_lvr_land_c"."主要用途",
    "j_lvr_land_c"."租賃面積" AS "建物面積",
    "j_lvr_land_c"."房數",
    "j_lvr_land_c"."廳數",
    "j_lvr_land_c"."衛浴數",
    "j_lvr_land_c"."交易總價" AS "總價",
    "j_lvr_land_c"."車位類別",
    "j_lvr_land_c"."車位總價"
   FROM "public"."j_lvr_land_c"
UNION ALL
 SELECT 'K'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "k_lvr_land_a"."編號",
    "k_lvr_land_a"."行政區",
    "k_lvr_land_a"."交易標的",
    "k_lvr_land_a"."地址",
    "k_lvr_land_a"."交易日" AS "交易日期",
    "k_lvr_land_a"."建物型態",
    "k_lvr_land_a"."主要用途",
    "k_lvr_land_a"."產權面積_房車" AS "建物面積",
    "k_lvr_land_a"."房數",
    "k_lvr_land_a"."廳數",
    "k_lvr_land_a"."衛浴數",
    "k_lvr_land_a"."交易總價" AS "總價",
    "k_lvr_land_a"."車位類別",
    "k_lvr_land_a"."車位總價"
   FROM "public"."k_lvr_land_a"
UNION ALL
 SELECT 'K'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "k_lvr_land_b"."編號",
    "k_lvr_land_b"."行政區",
    "k_lvr_land_b"."交易標的",
    "k_lvr_land_b"."地址",
    "k_lvr_land_b"."交易日" AS "交易日期",
    "k_lvr_land_b"."建物型態",
    "k_lvr_land_b"."主要用途",
    "k_lvr_land_b"."產權面積_房車" AS "建物面積",
    "k_lvr_land_b"."房數",
    "k_lvr_land_b"."廳數",
    "k_lvr_land_b"."衛浴數",
    "k_lvr_land_b"."交易總價" AS "總價",
    "k_lvr_land_b"."車位類別",
    "k_lvr_land_b"."車位總價"
   FROM "public"."k_lvr_land_b"
UNION ALL
 SELECT 'K'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "k_lvr_land_c"."編號",
    "k_lvr_land_c"."行政區",
    "k_lvr_land_c"."交易標的",
    "k_lvr_land_c"."地址",
    "k_lvr_land_c"."交易日" AS "交易日期",
    "k_lvr_land_c"."建物型態",
    "k_lvr_land_c"."主要用途",
    "k_lvr_land_c"."租賃面積" AS "建物面積",
    "k_lvr_land_c"."房數",
    "k_lvr_land_c"."廳數",
    "k_lvr_land_c"."衛浴數",
    "k_lvr_land_c"."交易總價" AS "總價",
    "k_lvr_land_c"."車位類別",
    "k_lvr_land_c"."車位總價"
   FROM "public"."k_lvr_land_c"
UNION ALL
 SELECT 'M'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "m_lvr_land_a"."編號",
    "m_lvr_land_a"."行政區",
    "m_lvr_land_a"."交易標的",
    "m_lvr_land_a"."地址",
    "m_lvr_land_a"."交易日" AS "交易日期",
    "m_lvr_land_a"."建物型態",
    "m_lvr_land_a"."主要用途",
    "m_lvr_land_a"."產權面積_房車" AS "建物面積",
    "m_lvr_land_a"."房數",
    "m_lvr_land_a"."廳數",
    "m_lvr_land_a"."衛浴數",
    "m_lvr_land_a"."交易總價" AS "總價",
    "m_lvr_land_a"."車位類別",
    "m_lvr_land_a"."車位總價"
   FROM "public"."m_lvr_land_a"
UNION ALL
 SELECT 'M'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "m_lvr_land_b"."編號",
    "m_lvr_land_b"."行政區",
    "m_lvr_land_b"."交易標的",
    "m_lvr_land_b"."地址",
    "m_lvr_land_b"."交易日" AS "交易日期",
    "m_lvr_land_b"."建物型態",
    "m_lvr_land_b"."主要用途",
    "m_lvr_land_b"."產權面積_房車" AS "建物面積",
    "m_lvr_land_b"."房數",
    "m_lvr_land_b"."廳數",
    "m_lvr_land_b"."衛浴數",
    "m_lvr_land_b"."交易總價" AS "總價",
    "m_lvr_land_b"."車位類別",
    "m_lvr_land_b"."車位總價"
   FROM "public"."m_lvr_land_b"
UNION ALL
 SELECT 'M'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "m_lvr_land_c"."編號",
    "m_lvr_land_c"."行政區",
    "m_lvr_land_c"."交易標的",
    "m_lvr_land_c"."地址",
    "m_lvr_land_c"."交易日" AS "交易日期",
    "m_lvr_land_c"."建物型態",
    "m_lvr_land_c"."主要用途",
    "m_lvr_land_c"."租賃面積" AS "建物面積",
    "m_lvr_land_c"."房數",
    "m_lvr_land_c"."廳數",
    "m_lvr_land_c"."衛浴數",
    "m_lvr_land_c"."交易總價" AS "總價",
    "m_lvr_land_c"."車位類別",
    "m_lvr_land_c"."車位總價"
   FROM "public"."m_lvr_land_c"
UNION ALL
 SELECT 'N'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "n_lvr_land_a"."編號",
    "n_lvr_land_a"."行政區",
    "n_lvr_land_a"."交易標的",
    "n_lvr_land_a"."地址",
    "n_lvr_land_a"."交易日" AS "交易日期",
    "n_lvr_land_a"."建物型態",
    "n_lvr_land_a"."主要用途",
    "n_lvr_land_a"."產權面積_房車" AS "建物面積",
    "n_lvr_land_a"."房數",
    "n_lvr_land_a"."廳數",
    "n_lvr_land_a"."衛浴數",
    "n_lvr_land_a"."交易總價" AS "總價",
    "n_lvr_land_a"."車位類別",
    "n_lvr_land_a"."車位總價"
   FROM "public"."n_lvr_land_a"
UNION ALL
 SELECT 'N'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "n_lvr_land_b"."編號",
    "n_lvr_land_b"."行政區",
    "n_lvr_land_b"."交易標的",
    "n_lvr_land_b"."地址",
    "n_lvr_land_b"."交易日" AS "交易日期",
    "n_lvr_land_b"."建物型態",
    "n_lvr_land_b"."主要用途",
    "n_lvr_land_b"."產權面積_房車" AS "建物面積",
    "n_lvr_land_b"."房數",
    "n_lvr_land_b"."廳數",
    "n_lvr_land_b"."衛浴數",
    "n_lvr_land_b"."交易總價" AS "總價",
    "n_lvr_land_b"."車位類別",
    "n_lvr_land_b"."車位總價"
   FROM "public"."n_lvr_land_b"
UNION ALL
 SELECT 'N'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "n_lvr_land_c"."編號",
    "n_lvr_land_c"."行政區",
    "n_lvr_land_c"."交易標的",
    "n_lvr_land_c"."地址",
    "n_lvr_land_c"."交易日" AS "交易日期",
    "n_lvr_land_c"."建物型態",
    "n_lvr_land_c"."主要用途",
    "n_lvr_land_c"."租賃面積" AS "建物面積",
    "n_lvr_land_c"."房數",
    "n_lvr_land_c"."廳數",
    "n_lvr_land_c"."衛浴數",
    "n_lvr_land_c"."交易總價" AS "總價",
    "n_lvr_land_c"."車位類別",
    "n_lvr_land_c"."車位總價"
   FROM "public"."n_lvr_land_c"
UNION ALL
 SELECT 'O'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "o_lvr_land_a"."編號",
    "o_lvr_land_a"."行政區",
    "o_lvr_land_a"."交易標的",
    "o_lvr_land_a"."地址",
    "o_lvr_land_a"."交易日" AS "交易日期",
    "o_lvr_land_a"."建物型態",
    "o_lvr_land_a"."主要用途",
    "o_lvr_land_a"."產權面積_房車" AS "建物面積",
    "o_lvr_land_a"."房數",
    "o_lvr_land_a"."廳數",
    "o_lvr_land_a"."衛浴數",
    "o_lvr_land_a"."交易總價" AS "總價",
    "o_lvr_land_a"."車位類別",
    "o_lvr_land_a"."車位總價"
   FROM "public"."o_lvr_land_a"
UNION ALL
 SELECT 'O'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "o_lvr_land_b"."編號",
    "o_lvr_land_b"."行政區",
    "o_lvr_land_b"."交易標的",
    "o_lvr_land_b"."地址",
    "o_lvr_land_b"."交易日" AS "交易日期",
    "o_lvr_land_b"."建物型態",
    "o_lvr_land_b"."主要用途",
    "o_lvr_land_b"."產權面積_房車" AS "建物面積",
    "o_lvr_land_b"."房數",
    "o_lvr_land_b"."廳數",
    "o_lvr_land_b"."衛浴數",
    "o_lvr_land_b"."交易總價" AS "總價",
    "o_lvr_land_b"."車位類別",
    "o_lvr_land_b"."車位總價"
   FROM "public"."o_lvr_land_b"
UNION ALL
 SELECT 'O'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "o_lvr_land_c"."編號",
    "o_lvr_land_c"."行政區",
    "o_lvr_land_c"."交易標的",
    "o_lvr_land_c"."地址",
    "o_lvr_land_c"."交易日" AS "交易日期",
    "o_lvr_land_c"."建物型態",
    "o_lvr_land_c"."主要用途",
    "o_lvr_land_c"."租賃面積" AS "建物面積",
    "o_lvr_land_c"."房數",
    "o_lvr_land_c"."廳數",
    "o_lvr_land_c"."衛浴數",
    "o_lvr_land_c"."交易總價" AS "總價",
    "o_lvr_land_c"."車位類別",
    "o_lvr_land_c"."車位總價"
   FROM "public"."o_lvr_land_c"
UNION ALL
 SELECT 'P'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "p_lvr_land_a"."編號",
    "p_lvr_land_a"."行政區",
    "p_lvr_land_a"."交易標的",
    "p_lvr_land_a"."地址",
    "p_lvr_land_a"."交易日" AS "交易日期",
    "p_lvr_land_a"."建物型態",
    "p_lvr_land_a"."主要用途",
    "p_lvr_land_a"."產權面積_房車" AS "建物面積",
    "p_lvr_land_a"."房數",
    "p_lvr_land_a"."廳數",
    "p_lvr_land_a"."衛浴數",
    "p_lvr_land_a"."交易總價" AS "總價",
    "p_lvr_land_a"."車位類別",
    "p_lvr_land_a"."車位總價"
   FROM "public"."p_lvr_land_a"
UNION ALL
 SELECT 'P'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "p_lvr_land_b"."編號",
    "p_lvr_land_b"."行政區",
    "p_lvr_land_b"."交易標的",
    "p_lvr_land_b"."地址",
    "p_lvr_land_b"."交易日" AS "交易日期",
    "p_lvr_land_b"."建物型態",
    "p_lvr_land_b"."主要用途",
    "p_lvr_land_b"."產權面積_房車" AS "建物面積",
    "p_lvr_land_b"."房數",
    "p_lvr_land_b"."廳數",
    "p_lvr_land_b"."衛浴數",
    "p_lvr_land_b"."交易總價" AS "總價",
    "p_lvr_land_b"."車位類別",
    "p_lvr_land_b"."車位總價"
   FROM "public"."p_lvr_land_b"
UNION ALL
 SELECT 'P'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "p_lvr_land_c"."編號",
    "p_lvr_land_c"."行政區",
    "p_lvr_land_c"."交易標的",
    "p_lvr_land_c"."地址",
    "p_lvr_land_c"."交易日" AS "交易日期",
    "p_lvr_land_c"."建物型態",
    "p_lvr_land_c"."主要用途",
    "p_lvr_land_c"."租賃面積" AS "建物面積",
    "p_lvr_land_c"."房數",
    "p_lvr_land_c"."廳數",
    "p_lvr_land_c"."衛浴數",
    "p_lvr_land_c"."交易總價" AS "總價",
    "p_lvr_land_c"."車位類別",
    "p_lvr_land_c"."車位總價"
   FROM "public"."p_lvr_land_c"
UNION ALL
 SELECT 'Q'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "q_lvr_land_a"."編號",
    "q_lvr_land_a"."行政區",
    "q_lvr_land_a"."交易標的",
    "q_lvr_land_a"."地址",
    "q_lvr_land_a"."交易日" AS "交易日期",
    "q_lvr_land_a"."建物型態",
    "q_lvr_land_a"."主要用途",
    "q_lvr_land_a"."產權面積_房車" AS "建物面積",
    "q_lvr_land_a"."房數",
    "q_lvr_land_a"."廳數",
    "q_lvr_land_a"."衛浴數",
    "q_lvr_land_a"."交易總價" AS "總價",
    "q_lvr_land_a"."車位類別",
    "q_lvr_land_a"."車位總價"
   FROM "public"."q_lvr_land_a"
UNION ALL
 SELECT 'Q'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "q_lvr_land_b"."編號",
    "q_lvr_land_b"."行政區",
    "q_lvr_land_b"."交易標的",
    "q_lvr_land_b"."地址",
    "q_lvr_land_b"."交易日" AS "交易日期",
    "q_lvr_land_b"."建物型態",
    "q_lvr_land_b"."主要用途",
    "q_lvr_land_b"."產權面積_房車" AS "建物面積",
    "q_lvr_land_b"."房數",
    "q_lvr_land_b"."廳數",
    "q_lvr_land_b"."衛浴數",
    "q_lvr_land_b"."交易總價" AS "總價",
    "q_lvr_land_b"."車位類別",
    "q_lvr_land_b"."車位總價"
   FROM "public"."q_lvr_land_b"
UNION ALL
 SELECT 'Q'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "q_lvr_land_c"."編號",
    "q_lvr_land_c"."行政區",
    "q_lvr_land_c"."交易標的",
    "q_lvr_land_c"."地址",
    "q_lvr_land_c"."交易日" AS "交易日期",
    "q_lvr_land_c"."建物型態",
    "q_lvr_land_c"."主要用途",
    "q_lvr_land_c"."租賃面積" AS "建物面積",
    "q_lvr_land_c"."房數",
    "q_lvr_land_c"."廳數",
    "q_lvr_land_c"."衛浴數",
    "q_lvr_land_c"."交易總價" AS "總價",
    "q_lvr_land_c"."車位類別",
    "q_lvr_land_c"."車位總價"
   FROM "public"."q_lvr_land_c"
UNION ALL
 SELECT 'T'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "t_lvr_land_a"."編號",
    "t_lvr_land_a"."行政區",
    "t_lvr_land_a"."交易標的",
    "t_lvr_land_a"."地址",
    "t_lvr_land_a"."交易日" AS "交易日期",
    "t_lvr_land_a"."建物型態",
    "t_lvr_land_a"."主要用途",
    "t_lvr_land_a"."產權面積_房車" AS "建物面積",
    "t_lvr_land_a"."房數",
    "t_lvr_land_a"."廳數",
    "t_lvr_land_a"."衛浴數",
    "t_lvr_land_a"."交易總價" AS "總價",
    "t_lvr_land_a"."車位類別",
    "t_lvr_land_a"."車位總價"
   FROM "public"."t_lvr_land_a"
UNION ALL
 SELECT 'T'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "t_lvr_land_b"."編號",
    "t_lvr_land_b"."行政區",
    "t_lvr_land_b"."交易標的",
    "t_lvr_land_b"."地址",
    "t_lvr_land_b"."交易日" AS "交易日期",
    "t_lvr_land_b"."建物型態",
    "t_lvr_land_b"."主要用途",
    "t_lvr_land_b"."產權面積_房車" AS "建物面積",
    "t_lvr_land_b"."房數",
    "t_lvr_land_b"."廳數",
    "t_lvr_land_b"."衛浴數",
    "t_lvr_land_b"."交易總價" AS "總價",
    "t_lvr_land_b"."車位類別",
    "t_lvr_land_b"."車位總價"
   FROM "public"."t_lvr_land_b"
UNION ALL
 SELECT 'T'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "t_lvr_land_c"."編號",
    "t_lvr_land_c"."行政區",
    "t_lvr_land_c"."交易標的",
    "t_lvr_land_c"."地址",
    "t_lvr_land_c"."交易日" AS "交易日期",
    "t_lvr_land_c"."建物型態",
    "t_lvr_land_c"."主要用途",
    "t_lvr_land_c"."租賃面積" AS "建物面積",
    "t_lvr_land_c"."房數",
    "t_lvr_land_c"."廳數",
    "t_lvr_land_c"."衛浴數",
    "t_lvr_land_c"."交易總價" AS "總價",
    "t_lvr_land_c"."車位類別",
    "t_lvr_land_c"."車位總價"
   FROM "public"."t_lvr_land_c"
UNION ALL
 SELECT 'U'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "u_lvr_land_a"."編號",
    "u_lvr_land_a"."行政區",
    "u_lvr_land_a"."交易標的",
    "u_lvr_land_a"."地址",
    "u_lvr_land_a"."交易日" AS "交易日期",
    "u_lvr_land_a"."建物型態",
    "u_lvr_land_a"."主要用途",
    "u_lvr_land_a"."產權面積_房車" AS "建物面積",
    "u_lvr_land_a"."房數",
    "u_lvr_land_a"."廳數",
    "u_lvr_land_a"."衛浴數",
    "u_lvr_land_a"."交易總價" AS "總價",
    "u_lvr_land_a"."車位類別",
    "u_lvr_land_a"."車位總價"
   FROM "public"."u_lvr_land_a"
UNION ALL
 SELECT 'U'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "u_lvr_land_b"."編號",
    "u_lvr_land_b"."行政區",
    "u_lvr_land_b"."交易標的",
    "u_lvr_land_b"."地址",
    "u_lvr_land_b"."交易日" AS "交易日期",
    "u_lvr_land_b"."建物型態",
    "u_lvr_land_b"."主要用途",
    "u_lvr_land_b"."產權面積_房車" AS "建物面積",
    "u_lvr_land_b"."房數",
    "u_lvr_land_b"."廳數",
    "u_lvr_land_b"."衛浴數",
    "u_lvr_land_b"."交易總價" AS "總價",
    "u_lvr_land_b"."車位類別",
    "u_lvr_land_b"."車位總價"
   FROM "public"."u_lvr_land_b"
UNION ALL
 SELECT 'U'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "u_lvr_land_c"."編號",
    "u_lvr_land_c"."行政區",
    "u_lvr_land_c"."交易標的",
    "u_lvr_land_c"."地址",
    "u_lvr_land_c"."交易日" AS "交易日期",
    "u_lvr_land_c"."建物型態",
    "u_lvr_land_c"."主要用途",
    "u_lvr_land_c"."租賃面積" AS "建物面積",
    "u_lvr_land_c"."房數",
    "u_lvr_land_c"."廳數",
    "u_lvr_land_c"."衛浴數",
    "u_lvr_land_c"."交易總價" AS "總價",
    "u_lvr_land_c"."車位類別",
    "u_lvr_land_c"."車位總價"
   FROM "public"."u_lvr_land_c"
UNION ALL
 SELECT 'V'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "v_lvr_land_a"."編號",
    "v_lvr_land_a"."行政區",
    "v_lvr_land_a"."交易標的",
    "v_lvr_land_a"."地址",
    "v_lvr_land_a"."交易日" AS "交易日期",
    "v_lvr_land_a"."建物型態",
    "v_lvr_land_a"."主要用途",
    "v_lvr_land_a"."產權面積_房車" AS "建物面積",
    "v_lvr_land_a"."房數",
    "v_lvr_land_a"."廳數",
    "v_lvr_land_a"."衛浴數",
    "v_lvr_land_a"."交易總價" AS "總價",
    "v_lvr_land_a"."車位類別",
    "v_lvr_land_a"."車位總價"
   FROM "public"."v_lvr_land_a"
UNION ALL
 SELECT 'V'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "v_lvr_land_b"."編號",
    "v_lvr_land_b"."行政區",
    "v_lvr_land_b"."交易標的",
    "v_lvr_land_b"."地址",
    "v_lvr_land_b"."交易日" AS "交易日期",
    "v_lvr_land_b"."建物型態",
    "v_lvr_land_b"."主要用途",
    "v_lvr_land_b"."產權面積_房車" AS "建物面積",
    "v_lvr_land_b"."房數",
    "v_lvr_land_b"."廳數",
    "v_lvr_land_b"."衛浴數",
    "v_lvr_land_b"."交易總價" AS "總價",
    "v_lvr_land_b"."車位類別",
    "v_lvr_land_b"."車位總價"
   FROM "public"."v_lvr_land_b"
UNION ALL
 SELECT 'V'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "v_lvr_land_c"."編號",
    "v_lvr_land_c"."行政區",
    "v_lvr_land_c"."交易標的",
    "v_lvr_land_c"."地址",
    "v_lvr_land_c"."交易日" AS "交易日期",
    "v_lvr_land_c"."建物型態",
    "v_lvr_land_c"."主要用途",
    "v_lvr_land_c"."租賃面積" AS "建物面積",
    "v_lvr_land_c"."房數",
    "v_lvr_land_c"."廳數",
    "v_lvr_land_c"."衛浴數",
    "v_lvr_land_c"."交易總價" AS "總價",
    "v_lvr_land_c"."車位類別",
    "v_lvr_land_c"."車位總價"
   FROM "public"."v_lvr_land_c"
UNION ALL
 SELECT 'W'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "w_lvr_land_a"."編號",
    "w_lvr_land_a"."行政區",
    "w_lvr_land_a"."交易標的",
    "w_lvr_land_a"."地址",
    "w_lvr_land_a"."交易日" AS "交易日期",
    "w_lvr_land_a"."建物型態",
    "w_lvr_land_a"."主要用途",
    "w_lvr_land_a"."產權面積_房車" AS "建物面積",
    "w_lvr_land_a"."房數",
    "w_lvr_land_a"."廳數",
    "w_lvr_land_a"."衛浴數",
    "w_lvr_land_a"."交易總價" AS "總價",
    "w_lvr_land_a"."車位類別",
    "w_lvr_land_a"."車位總價"
   FROM "public"."w_lvr_land_a"
UNION ALL
 SELECT 'W'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "w_lvr_land_b"."編號",
    "w_lvr_land_b"."行政區",
    "w_lvr_land_b"."交易標的",
    "w_lvr_land_b"."地址",
    "w_lvr_land_b"."交易日" AS "交易日期",
    "w_lvr_land_b"."建物型態",
    "w_lvr_land_b"."主要用途",
    "w_lvr_land_b"."產權面積_房車" AS "建物面積",
    "w_lvr_land_b"."房數",
    "w_lvr_land_b"."廳數",
    "w_lvr_land_b"."衛浴數",
    "w_lvr_land_b"."交易總價" AS "總價",
    "w_lvr_land_b"."車位類別",
    "w_lvr_land_b"."車位總價"
   FROM "public"."w_lvr_land_b"
UNION ALL
 SELECT 'W'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "w_lvr_land_c"."編號",
    "w_lvr_land_c"."行政區",
    "w_lvr_land_c"."交易標的",
    "w_lvr_land_c"."地址",
    "w_lvr_land_c"."交易日" AS "交易日期",
    "w_lvr_land_c"."建物型態",
    "w_lvr_land_c"."主要用途",
    "w_lvr_land_c"."租賃面積" AS "建物面積",
    "w_lvr_land_c"."房數",
    "w_lvr_land_c"."廳數",
    "w_lvr_land_c"."衛浴數",
    "w_lvr_land_c"."交易總價" AS "總價",
    "w_lvr_land_c"."車位類別",
    "w_lvr_land_c"."車位總價"
   FROM "public"."w_lvr_land_c"
UNION ALL
 SELECT 'X'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "x_lvr_land_a"."編號",
    "x_lvr_land_a"."行政區",
    "x_lvr_land_a"."交易標的",
    "x_lvr_land_a"."地址",
    "x_lvr_land_a"."交易日" AS "交易日期",
    "x_lvr_land_a"."建物型態",
    "x_lvr_land_a"."主要用途",
    "x_lvr_land_a"."產權面積_房車" AS "建物面積",
    "x_lvr_land_a"."房數",
    "x_lvr_land_a"."廳數",
    "x_lvr_land_a"."衛浴數",
    "x_lvr_land_a"."交易總價" AS "總價",
    "x_lvr_land_a"."車位類別",
    "x_lvr_land_a"."車位總價"
   FROM "public"."x_lvr_land_a"
UNION ALL
 SELECT 'X'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "x_lvr_land_b"."編號",
    "x_lvr_land_b"."行政區",
    "x_lvr_land_b"."交易標的",
    "x_lvr_land_b"."地址",
    "x_lvr_land_b"."交易日" AS "交易日期",
    "x_lvr_land_b"."建物型態",
    "x_lvr_land_b"."主要用途",
    "x_lvr_land_b"."產權面積_房車" AS "建物面積",
    "x_lvr_land_b"."房數",
    "x_lvr_land_b"."廳數",
    "x_lvr_land_b"."衛浴數",
    "x_lvr_land_b"."交易總價" AS "總價",
    "x_lvr_land_b"."車位類別",
    "x_lvr_land_b"."車位總價"
   FROM "public"."x_lvr_land_b"
UNION ALL
 SELECT 'X'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "x_lvr_land_c"."編號",
    "x_lvr_land_c"."行政區",
    "x_lvr_land_c"."交易標的",
    "x_lvr_land_c"."地址",
    "x_lvr_land_c"."交易日" AS "交易日期",
    "x_lvr_land_c"."建物型態",
    "x_lvr_land_c"."主要用途",
    "x_lvr_land_c"."租賃面積" AS "建物面積",
    "x_lvr_land_c"."房數",
    "x_lvr_land_c"."廳數",
    "x_lvr_land_c"."衛浴數",
    "x_lvr_land_c"."交易總價" AS "總價",
    "x_lvr_land_c"."車位類別",
    "x_lvr_land_c"."車位總價"
   FROM "public"."x_lvr_land_c"
UNION ALL
 SELECT 'Z'::"text" AS "縣市代碼",
    '中古交易'::"text" AS "交易類型",
    "z_lvr_land_a"."編號",
    "z_lvr_land_a"."行政區",
    "z_lvr_land_a"."交易標的",
    "z_lvr_land_a"."地址",
    "z_lvr_land_a"."交易日" AS "交易日期",
    "z_lvr_land_a"."建物型態",
    "z_lvr_land_a"."主要用途",
    "z_lvr_land_a"."產權面積_房車" AS "建物面積",
    "z_lvr_land_a"."房數",
    "z_lvr_land_a"."廳數",
    "z_lvr_land_a"."衛浴數",
    "z_lvr_land_a"."交易總價" AS "總價",
    "z_lvr_land_a"."車位類別",
    "z_lvr_land_a"."車位總價"
   FROM "public"."z_lvr_land_a"
UNION ALL
 SELECT 'Z'::"text" AS "縣市代碼",
    '預售交易'::"text" AS "交易類型",
    "z_lvr_land_b"."編號",
    "z_lvr_land_b"."行政區",
    "z_lvr_land_b"."交易標的",
    "z_lvr_land_b"."地址",
    "z_lvr_land_b"."交易日" AS "交易日期",
    "z_lvr_land_b"."建物型態",
    "z_lvr_land_b"."主要用途",
    "z_lvr_land_b"."產權面積_房車" AS "建物面積",
    "z_lvr_land_b"."房數",
    "z_lvr_land_b"."廳數",
    "z_lvr_land_b"."衛浴數",
    "z_lvr_land_b"."交易總價" AS "總價",
    "z_lvr_land_b"."車位類別",
    "z_lvr_land_b"."車位總價"
   FROM "public"."z_lvr_land_b"
UNION ALL
 SELECT 'Z'::"text" AS "縣市代碼",
    '租賃交易'::"text" AS "交易類型",
    "z_lvr_land_c"."編號",
    "z_lvr_land_c"."行政區",
    "z_lvr_land_c"."交易標的",
    "z_lvr_land_c"."地址",
    "z_lvr_land_c"."交易日" AS "交易日期",
    "z_lvr_land_c"."建物型態",
    "z_lvr_land_c"."主要用途",
    "z_lvr_land_c"."租賃面積" AS "建物面積",
    "z_lvr_land_c"."房數",
    "z_lvr_land_c"."廳數",
    "z_lvr_land_c"."衛浴數",
    "z_lvr_land_c"."交易總價" AS "總價",
    "z_lvr_land_c"."車位類別",
    "z_lvr_land_c"."車位總價"
   FROM "public"."z_lvr_land_c";


ALTER VIEW "public"."all_transactions_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."b_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_a_build_id_seq" OWNED BY "public"."b_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."b_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_a_land_id_seq" OWNED BY "public"."b_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."b_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_a_park_id_seq" OWNED BY "public"."b_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."b_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_b_land_id_seq" OWNED BY "public"."b_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."b_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_b_park_id_seq" OWNED BY "public"."b_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."b_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_c_build_id_seq" OWNED BY "public"."b_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."b_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_c_land_id_seq" OWNED BY "public"."b_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."b_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."b_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."b_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."b_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."b_lvr_land_c_park_id_seq" OWNED BY "public"."b_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."c_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_a_build_id_seq" OWNED BY "public"."c_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."c_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_a_land_id_seq" OWNED BY "public"."c_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."c_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_a_park_id_seq" OWNED BY "public"."c_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."c_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_b_land_id_seq" OWNED BY "public"."c_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."c_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_b_park_id_seq" OWNED BY "public"."c_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."c_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_c_build_id_seq" OWNED BY "public"."c_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."c_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_c_land_id_seq" OWNED BY "public"."c_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."c_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."c_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."c_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."c_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."c_lvr_land_c_park_id_seq" OWNED BY "public"."c_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."county_codes" (
    "code" character(1) NOT NULL,
    "name_zh" character varying(20) NOT NULL,
    "name_en" character varying(50) NOT NULL
);


ALTER TABLE "public"."county_codes" OWNER TO "postgres";


COMMENT ON TABLE "public"."county_codes" IS '縣市代碼對照表';



COMMENT ON COLUMN "public"."county_codes"."code" IS '縣市代碼';



COMMENT ON COLUMN "public"."county_codes"."name_zh" IS '中文縣市名稱';



COMMENT ON COLUMN "public"."county_codes"."name_en" IS '英文縣市名稱';



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."d_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_a_build_id_seq" OWNED BY "public"."d_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."d_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_a_land_id_seq" OWNED BY "public"."d_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."d_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_a_park_id_seq" OWNED BY "public"."d_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."d_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_b_land_id_seq" OWNED BY "public"."d_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."d_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_b_park_id_seq" OWNED BY "public"."d_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."d_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_c_build_id_seq" OWNED BY "public"."d_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."d_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_c_land_id_seq" OWNED BY "public"."d_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."d_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."d_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."d_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."d_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."d_lvr_land_c_park_id_seq" OWNED BY "public"."d_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."e_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_a_build_id_seq" OWNED BY "public"."e_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."e_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_a_land_id_seq" OWNED BY "public"."e_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."e_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_a_park_id_seq" OWNED BY "public"."e_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."e_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_b_land_id_seq" OWNED BY "public"."e_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."e_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_b_park_id_seq" OWNED BY "public"."e_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."e_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_c_build_id_seq" OWNED BY "public"."e_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."e_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_c_land_id_seq" OWNED BY "public"."e_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."e_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."e_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."e_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."e_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."e_lvr_land_c_park_id_seq" OWNED BY "public"."e_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."f_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_a_build_id_seq" OWNED BY "public"."f_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."f_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_a_land_id_seq" OWNED BY "public"."f_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."f_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_a_park_id_seq" OWNED BY "public"."f_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."f_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_b_land_id_seq" OWNED BY "public"."f_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."f_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_b_park_id_seq" OWNED BY "public"."f_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."f_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_c_build_id_seq" OWNED BY "public"."f_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."f_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_c_land_id_seq" OWNED BY "public"."f_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."f_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."f_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."f_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."f_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."f_lvr_land_c_park_id_seq" OWNED BY "public"."f_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."g_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_a_build_id_seq" OWNED BY "public"."g_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."g_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_a_land_id_seq" OWNED BY "public"."g_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."g_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_a_park_id_seq" OWNED BY "public"."g_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."g_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_b_land_id_seq" OWNED BY "public"."g_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."g_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_b_park_id_seq" OWNED BY "public"."g_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."g_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_c_build_id_seq" OWNED BY "public"."g_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."g_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_c_land_id_seq" OWNED BY "public"."g_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."g_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."g_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."g_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."g_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."g_lvr_land_c_park_id_seq" OWNED BY "public"."g_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."h_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_a_build_id_seq" OWNED BY "public"."h_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."h_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_a_land_id_seq" OWNED BY "public"."h_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."h_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_a_park_id_seq" OWNED BY "public"."h_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."h_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_b_land_id_seq" OWNED BY "public"."h_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."h_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_b_park_id_seq" OWNED BY "public"."h_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."h_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_c_build_id_seq" OWNED BY "public"."h_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."h_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_c_land_id_seq" OWNED BY "public"."h_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."h_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."h_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."h_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."h_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."h_lvr_land_c_park_id_seq" OWNED BY "public"."h_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."i_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_a_build_id_seq" OWNED BY "public"."i_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."i_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_a_land_id_seq" OWNED BY "public"."i_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."i_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_a_park_id_seq" OWNED BY "public"."i_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."i_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_b_land_id_seq" OWNED BY "public"."i_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."i_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_b_park_id_seq" OWNED BY "public"."i_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."i_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_c_build_id_seq" OWNED BY "public"."i_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."i_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_c_land_id_seq" OWNED BY "public"."i_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."i_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."i_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."i_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."i_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."i_lvr_land_c_park_id_seq" OWNED BY "public"."i_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."j_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_a_build_id_seq" OWNED BY "public"."j_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."j_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_a_land_id_seq" OWNED BY "public"."j_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."j_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_a_park_id_seq" OWNED BY "public"."j_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."j_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_b_land_id_seq" OWNED BY "public"."j_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."j_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_b_park_id_seq" OWNED BY "public"."j_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."j_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_c_build_id_seq" OWNED BY "public"."j_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."j_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_c_land_id_seq" OWNED BY "public"."j_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."j_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."j_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."j_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."j_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."j_lvr_land_c_park_id_seq" OWNED BY "public"."j_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."k_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_a_build_id_seq" OWNED BY "public"."k_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."k_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_a_land_id_seq" OWNED BY "public"."k_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."k_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_a_park_id_seq" OWNED BY "public"."k_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."k_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_b_land_id_seq" OWNED BY "public"."k_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."k_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_b_park_id_seq" OWNED BY "public"."k_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."k_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_c_build_id_seq" OWNED BY "public"."k_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."k_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_c_land_id_seq" OWNED BY "public"."k_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."k_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."k_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."k_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."k_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."k_lvr_land_c_park_id_seq" OWNED BY "public"."k_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."m_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_a_build_id_seq" OWNED BY "public"."m_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."m_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_a_land_id_seq" OWNED BY "public"."m_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."m_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_a_park_id_seq" OWNED BY "public"."m_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."m_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_b_land_id_seq" OWNED BY "public"."m_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."m_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_b_park_id_seq" OWNED BY "public"."m_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."m_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_c_build_id_seq" OWNED BY "public"."m_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."m_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_c_land_id_seq" OWNED BY "public"."m_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."m_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."m_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."m_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."m_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."m_lvr_land_c_park_id_seq" OWNED BY "public"."m_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."n_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_a_build_id_seq" OWNED BY "public"."n_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."n_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_a_land_id_seq" OWNED BY "public"."n_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."n_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_a_park_id_seq" OWNED BY "public"."n_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."n_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_b_land_id_seq" OWNED BY "public"."n_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."n_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_b_park_id_seq" OWNED BY "public"."n_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."n_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_c_build_id_seq" OWNED BY "public"."n_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."n_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_c_land_id_seq" OWNED BY "public"."n_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."n_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."n_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."n_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."n_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."n_lvr_land_c_park_id_seq" OWNED BY "public"."n_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."o_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_a_build_id_seq" OWNED BY "public"."o_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."o_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_a_land_id_seq" OWNED BY "public"."o_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."o_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_a_park_id_seq" OWNED BY "public"."o_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."o_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_b_land_id_seq" OWNED BY "public"."o_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."o_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_b_park_id_seq" OWNED BY "public"."o_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."o_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_c_build_id_seq" OWNED BY "public"."o_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."o_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_c_land_id_seq" OWNED BY "public"."o_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."o_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."o_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."o_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."o_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."o_lvr_land_c_park_id_seq" OWNED BY "public"."o_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."p_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_a_build_id_seq" OWNED BY "public"."p_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."p_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_a_land_id_seq" OWNED BY "public"."p_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."p_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_a_park_id_seq" OWNED BY "public"."p_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."p_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_b_land_id_seq" OWNED BY "public"."p_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."p_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_b_park_id_seq" OWNED BY "public"."p_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."p_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_c_build_id_seq" OWNED BY "public"."p_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."p_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_c_land_id_seq" OWNED BY "public"."p_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."p_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."p_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."p_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."p_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."p_lvr_land_c_park_id_seq" OWNED BY "public"."p_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."parsing_exceptions_v15" (
    "id" integer NOT NULL,
    "description" "text",
    "pattern_to_match" "text" NOT NULL,
    "extraction_regex" "text" NOT NULL,
    "output_format" "text" NOT NULL,
    "priority" integer DEFAULT 100
);


ALTER TABLE "public"."parsing_exceptions_v15" OWNER TO "postgres";


COMMENT ON TABLE "public"."parsing_exceptions_v15" IS 'V15 例外規則庫: 用於處理通用引擎無法完美解決的特殊組合案例';



CREATE SEQUENCE IF NOT EXISTS "public"."parsing_exceptions_v15_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."parsing_exceptions_v15_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."parsing_exceptions_v15_id_seq" OWNED BY "public"."parsing_exceptions_v15"."id";



CREATE TABLE IF NOT EXISTS "public"."project_name_mappings" (
    "id" integer NOT NULL,
    "old_name" "text" NOT NULL,
    "new_name" "text" NOT NULL,
    "county_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "district" "text",
    "city" "text"
);


ALTER TABLE "public"."project_name_mappings" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_name_mappings" IS '建案名稱自動替換對應表';



COMMENT ON COLUMN "public"."project_name_mappings"."old_name" IS '原始名稱（含亂碼或錯字）';



COMMENT ON COLUMN "public"."project_name_mappings"."new_name" IS '修正後的名稱';



COMMENT ON COLUMN "public"."project_name_mappings"."county_code" IS '縣市代碼（可選）';



COMMENT ON COLUMN "public"."project_name_mappings"."district" IS '行政區';



CREATE SEQUENCE IF NOT EXISTS "public"."project_name_mappings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."project_name_mappings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."project_name_mappings_id_seq" OWNED BY "public"."project_name_mappings"."id";



CREATE TABLE IF NOT EXISTS "public"."project_parsing_rules" (
    "project_name" character varying(255) NOT NULL,
    "pattern_type" character varying(50),
    "pattern_regex" "text",
    "parser_rule" "text",
    "confidence_score" numeric(5,2),
    "sample_count" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."project_parsing_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_parsing_rules_v2" (
    "project_name" character varying(255) NOT NULL,
    "rule_type" character varying(50) NOT NULL,
    "extraction_regex" "text",
    "parser_logic" "text",
    "confidence_score" numeric(5,2),
    "sample_count" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."project_parsing_rules_v2" OWNER TO "postgres";


COMMENT ON TABLE "public"."project_parsing_rules_v2" IS 'V9版學習規則表，支援多種解析策略';



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."q_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_a_build_id_seq" OWNED BY "public"."q_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."q_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_a_land_id_seq" OWNED BY "public"."q_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."q_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_a_park_id_seq" OWNED BY "public"."q_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."q_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_b_land_id_seq" OWNED BY "public"."q_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."q_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_b_park_id_seq" OWNED BY "public"."q_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."q_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_c_build_id_seq" OWNED BY "public"."q_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."q_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_c_land_id_seq" OWNED BY "public"."q_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."q_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."q_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."q_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."q_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."q_lvr_land_c_park_id_seq" OWNED BY "public"."q_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."shared_reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "token" "text" NOT NULL,
    "report_type" "text",
    "filters" "jsonb",
    "date_config" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "view_mode" "text",
    "view_options" "jsonb"
);


ALTER TABLE "public"."shared_reports" OWNER TO "postgres";


COMMENT ON TABLE "public"."shared_reports" IS '儲存所有公開分享報告的設定';



COMMENT ON COLUMN "public"."shared_reports"."token" IS '用於公開網址的唯一、隨機分享權杖';



COMMENT ON COLUMN "public"."shared_reports"."report_type" IS '報告類型，例如銷控表或排名';



COMMENT ON COLUMN "public"."shared_reports"."filters" IS '固定的篩選條件，例如專案名稱、行政區等';



COMMENT ON COLUMN "public"."shared_reports"."date_config" IS '日期的規則，分為 "relative" 或 "absolute"';



COMMENT ON COLUMN "public"."shared_reports"."created_by" IS '建立此分享連結的使用者ID';



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."t_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_a_build_id_seq" OWNED BY "public"."t_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."t_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_a_land_id_seq" OWNED BY "public"."t_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."t_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_a_park_id_seq" OWNED BY "public"."t_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."t_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_b_land_id_seq" OWNED BY "public"."t_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."t_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_b_park_id_seq" OWNED BY "public"."t_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."t_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_c_build_id_seq" OWNED BY "public"."t_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."t_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_c_land_id_seq" OWNED BY "public"."t_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."t_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."t_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."t_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."t_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."t_lvr_land_c_park_id_seq" OWNED BY "public"."t_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."u_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_a_build_id_seq" OWNED BY "public"."u_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."u_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_a_land_id_seq" OWNED BY "public"."u_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."u_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_a_park_id_seq" OWNED BY "public"."u_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."u_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_b_land_id_seq" OWNED BY "public"."u_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."u_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_b_park_id_seq" OWNED BY "public"."u_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."u_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_c_build_id_seq" OWNED BY "public"."u_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."u_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_c_land_id_seq" OWNED BY "public"."u_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."u_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."u_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."u_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."u_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."u_lvr_land_c_park_id_seq" OWNED BY "public"."u_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."v_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_a_build_id_seq" OWNED BY "public"."v_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."v_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_a_land_id_seq" OWNED BY "public"."v_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."v_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_a_park_id_seq" OWNED BY "public"."v_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."v_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_b_land_id_seq" OWNED BY "public"."v_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."v_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_b_park_id_seq" OWNED BY "public"."v_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."v_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_c_build_id_seq" OWNED BY "public"."v_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."v_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_c_land_id_seq" OWNED BY "public"."v_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."v_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."v_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."v_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."v_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."v_lvr_land_c_park_id_seq" OWNED BY "public"."v_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."w_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_a_build_id_seq" OWNED BY "public"."w_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."w_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_a_land_id_seq" OWNED BY "public"."w_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."w_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_a_park_id_seq" OWNED BY "public"."w_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."w_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_b_land_id_seq" OWNED BY "public"."w_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."w_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_b_park_id_seq" OWNED BY "public"."w_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."w_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_c_build_id_seq" OWNED BY "public"."w_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."w_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_c_land_id_seq" OWNED BY "public"."w_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."w_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."w_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."w_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."w_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."w_lvr_land_c_park_id_seq" OWNED BY "public"."w_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."x_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_a_build_id_seq" OWNED BY "public"."x_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."x_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_a_land_id_seq" OWNED BY "public"."x_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."x_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_a_park_id_seq" OWNED BY "public"."x_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."x_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_b_land_id_seq" OWNED BY "public"."x_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."x_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_b_park_id_seq" OWNED BY "public"."x_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."x_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_c_build_id_seq" OWNED BY "public"."x_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."x_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_c_land_id_seq" OWNED BY "public"."x_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."x_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."x_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."x_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."x_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."x_lvr_land_c_park_id_seq" OWNED BY "public"."x_lvr_land_c_park"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_a_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."z_lvr_land_a_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_a_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_a_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_a_build_id_seq" OWNED BY "public"."z_lvr_land_a_build"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_a_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."z_lvr_land_a_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_a_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_a_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_a_land_id_seq" OWNED BY "public"."z_lvr_land_a_land"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_a_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."z_lvr_land_a_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_a_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_a_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_a_park_id_seq" OWNED BY "public"."z_lvr_land_a_park"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_b_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" "text",
    "土地持分面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."z_lvr_land_b_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_b_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_b_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_b_land_id_seq" OWNED BY "public"."z_lvr_land_b_land"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_b_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


ALTER TABLE "public"."z_lvr_land_b_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_b_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_b_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_b_park_id_seq" OWNED BY "public"."z_lvr_land_b_park"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_c_build" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" "text",
    "完工日" "date",
    "總樓層" "text",
    "移轉情形" character varying(50)
);


ALTER TABLE "public"."z_lvr_land_c_build" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_c_build_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_c_build_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_c_build_id_seq" OWNED BY "public"."z_lvr_land_c_build"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_c_land" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" "text",
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" "text",
    "土地租賃面積(坪)" numeric(12,2)
);


ALTER TABLE "public"."z_lvr_land_c_land" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_c_land_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_c_land_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_c_land_id_seq" OWNED BY "public"."z_lvr_land_c_land"."id";



CREATE TABLE IF NOT EXISTS "public"."z_lvr_land_c_park" (
    "id" integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" "text",
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


ALTER TABLE "public"."z_lvr_land_c_park" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."z_lvr_land_c_park_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."z_lvr_land_c_park_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."z_lvr_land_c_park_id_seq" OWNED BY "public"."z_lvr_land_c_park"."id";



ALTER TABLE ONLY "public"."a_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."a_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."b_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."b_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."c_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."c_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."d_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."d_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."e_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."e_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."f_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."f_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."g_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."g_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."h_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."h_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."i_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."i_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."j_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."j_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."k_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."k_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."m_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."m_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."n_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."n_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."o_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."o_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."p_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."p_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."parsing_exceptions_v15" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."parsing_exceptions_v15_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."project_name_mappings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."project_name_mappings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."q_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."q_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."t_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."t_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."u_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."u_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."v_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."v_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."w_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."w_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."x_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."x_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_a_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_a_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_a_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_a_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_a_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_a_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_b_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_b_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_b_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_b_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_c_build" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_c_build_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_c_land" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_c_land_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."z_lvr_land_c_park" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."z_lvr_land_c_park_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."a_lvr_land_a_build"
    ADD CONSTRAINT "a_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_a_land"
    ADD CONSTRAINT "a_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_a_park"
    ADD CONSTRAINT "a_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_a"
    ADD CONSTRAINT "a_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."a_lvr_land_b_land"
    ADD CONSTRAINT "a_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_b_park"
    ADD CONSTRAINT "a_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_b"
    ADD CONSTRAINT "a_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."a_lvr_land_c_build"
    ADD CONSTRAINT "a_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_c_land"
    ADD CONSTRAINT "a_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_c_park"
    ADD CONSTRAINT "a_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."a_lvr_land_c"
    ADD CONSTRAINT "a_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."b_lvr_land_a_build"
    ADD CONSTRAINT "b_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_a_land"
    ADD CONSTRAINT "b_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_a_park"
    ADD CONSTRAINT "b_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_a"
    ADD CONSTRAINT "b_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."b_lvr_land_b_land"
    ADD CONSTRAINT "b_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_b_park"
    ADD CONSTRAINT "b_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_b"
    ADD CONSTRAINT "b_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."b_lvr_land_c_build"
    ADD CONSTRAINT "b_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_c_land"
    ADD CONSTRAINT "b_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_c_park"
    ADD CONSTRAINT "b_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."b_lvr_land_c"
    ADD CONSTRAINT "b_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."c_lvr_land_a_build"
    ADD CONSTRAINT "c_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_a_land"
    ADD CONSTRAINT "c_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_a_park"
    ADD CONSTRAINT "c_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_a"
    ADD CONSTRAINT "c_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."c_lvr_land_b_land"
    ADD CONSTRAINT "c_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_b_park"
    ADD CONSTRAINT "c_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_b"
    ADD CONSTRAINT "c_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."c_lvr_land_c_build"
    ADD CONSTRAINT "c_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_c_land"
    ADD CONSTRAINT "c_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_c_park"
    ADD CONSTRAINT "c_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."c_lvr_land_c"
    ADD CONSTRAINT "c_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."county_codes"
    ADD CONSTRAINT "county_codes_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."d_lvr_land_a_build"
    ADD CONSTRAINT "d_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_a_land"
    ADD CONSTRAINT "d_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_a_park"
    ADD CONSTRAINT "d_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_a"
    ADD CONSTRAINT "d_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."d_lvr_land_b_land"
    ADD CONSTRAINT "d_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_b_park"
    ADD CONSTRAINT "d_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_b"
    ADD CONSTRAINT "d_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."d_lvr_land_c_build"
    ADD CONSTRAINT "d_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_c_land"
    ADD CONSTRAINT "d_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_c_park"
    ADD CONSTRAINT "d_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."d_lvr_land_c"
    ADD CONSTRAINT "d_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."e_lvr_land_a_build"
    ADD CONSTRAINT "e_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_a_land"
    ADD CONSTRAINT "e_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_a_park"
    ADD CONSTRAINT "e_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_a"
    ADD CONSTRAINT "e_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."e_lvr_land_b_land"
    ADD CONSTRAINT "e_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_b_park"
    ADD CONSTRAINT "e_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_b"
    ADD CONSTRAINT "e_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."e_lvr_land_c_build"
    ADD CONSTRAINT "e_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_c_land"
    ADD CONSTRAINT "e_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_c_park"
    ADD CONSTRAINT "e_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."e_lvr_land_c"
    ADD CONSTRAINT "e_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."f_lvr_land_a_build"
    ADD CONSTRAINT "f_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_a_land"
    ADD CONSTRAINT "f_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_a_park"
    ADD CONSTRAINT "f_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_a"
    ADD CONSTRAINT "f_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."f_lvr_land_b_land"
    ADD CONSTRAINT "f_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_b_park"
    ADD CONSTRAINT "f_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_b"
    ADD CONSTRAINT "f_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."f_lvr_land_c_build"
    ADD CONSTRAINT "f_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_c_land"
    ADD CONSTRAINT "f_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_c_park"
    ADD CONSTRAINT "f_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."f_lvr_land_c"
    ADD CONSTRAINT "f_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."g_lvr_land_a_build"
    ADD CONSTRAINT "g_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_a_land"
    ADD CONSTRAINT "g_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_a_park"
    ADD CONSTRAINT "g_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_a"
    ADD CONSTRAINT "g_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."g_lvr_land_b_land"
    ADD CONSTRAINT "g_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_b_park"
    ADD CONSTRAINT "g_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_b"
    ADD CONSTRAINT "g_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."g_lvr_land_c_build"
    ADD CONSTRAINT "g_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_c_land"
    ADD CONSTRAINT "g_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_c_park"
    ADD CONSTRAINT "g_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."g_lvr_land_c"
    ADD CONSTRAINT "g_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."h_lvr_land_a_build"
    ADD CONSTRAINT "h_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_a_land"
    ADD CONSTRAINT "h_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_a_park"
    ADD CONSTRAINT "h_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_a"
    ADD CONSTRAINT "h_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."h_lvr_land_b_land"
    ADD CONSTRAINT "h_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_b_park"
    ADD CONSTRAINT "h_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_b"
    ADD CONSTRAINT "h_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."h_lvr_land_c_build"
    ADD CONSTRAINT "h_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_c_land"
    ADD CONSTRAINT "h_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_c_park"
    ADD CONSTRAINT "h_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."h_lvr_land_c"
    ADD CONSTRAINT "h_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."i_lvr_land_a_build"
    ADD CONSTRAINT "i_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_a_land"
    ADD CONSTRAINT "i_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_a_park"
    ADD CONSTRAINT "i_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_a"
    ADD CONSTRAINT "i_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."i_lvr_land_b_land"
    ADD CONSTRAINT "i_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_b_park"
    ADD CONSTRAINT "i_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_b"
    ADD CONSTRAINT "i_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."i_lvr_land_c_build"
    ADD CONSTRAINT "i_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_c_land"
    ADD CONSTRAINT "i_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_c_park"
    ADD CONSTRAINT "i_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."i_lvr_land_c"
    ADD CONSTRAINT "i_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."j_lvr_land_a_build"
    ADD CONSTRAINT "j_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_a_land"
    ADD CONSTRAINT "j_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_a_park"
    ADD CONSTRAINT "j_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_a"
    ADD CONSTRAINT "j_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."j_lvr_land_b_land"
    ADD CONSTRAINT "j_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_b_park"
    ADD CONSTRAINT "j_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_b"
    ADD CONSTRAINT "j_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."j_lvr_land_c_build"
    ADD CONSTRAINT "j_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_c_land"
    ADD CONSTRAINT "j_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_c_park"
    ADD CONSTRAINT "j_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."j_lvr_land_c"
    ADD CONSTRAINT "j_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."k_lvr_land_a_build"
    ADD CONSTRAINT "k_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_a_land"
    ADD CONSTRAINT "k_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_a_park"
    ADD CONSTRAINT "k_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_a"
    ADD CONSTRAINT "k_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."k_lvr_land_b_land"
    ADD CONSTRAINT "k_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_b_park"
    ADD CONSTRAINT "k_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_b"
    ADD CONSTRAINT "k_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."k_lvr_land_c_build"
    ADD CONSTRAINT "k_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_c_land"
    ADD CONSTRAINT "k_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_c_park"
    ADD CONSTRAINT "k_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."k_lvr_land_c"
    ADD CONSTRAINT "k_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."m_lvr_land_a_build"
    ADD CONSTRAINT "m_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_a_land"
    ADD CONSTRAINT "m_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_a_park"
    ADD CONSTRAINT "m_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_a"
    ADD CONSTRAINT "m_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."m_lvr_land_b_land"
    ADD CONSTRAINT "m_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_b_park"
    ADD CONSTRAINT "m_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_b"
    ADD CONSTRAINT "m_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."m_lvr_land_c_build"
    ADD CONSTRAINT "m_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_c_land"
    ADD CONSTRAINT "m_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_c_park"
    ADD CONSTRAINT "m_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."m_lvr_land_c"
    ADD CONSTRAINT "m_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."n_lvr_land_a_build"
    ADD CONSTRAINT "n_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_a_land"
    ADD CONSTRAINT "n_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_a_park"
    ADD CONSTRAINT "n_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_a"
    ADD CONSTRAINT "n_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."n_lvr_land_b_land"
    ADD CONSTRAINT "n_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_b_park"
    ADD CONSTRAINT "n_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_b"
    ADD CONSTRAINT "n_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."n_lvr_land_c_build"
    ADD CONSTRAINT "n_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_c_land"
    ADD CONSTRAINT "n_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_c_park"
    ADD CONSTRAINT "n_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."n_lvr_land_c"
    ADD CONSTRAINT "n_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."o_lvr_land_a_build"
    ADD CONSTRAINT "o_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_a_land"
    ADD CONSTRAINT "o_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_a_park"
    ADD CONSTRAINT "o_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_a"
    ADD CONSTRAINT "o_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."o_lvr_land_b_land"
    ADD CONSTRAINT "o_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_b_park"
    ADD CONSTRAINT "o_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_b"
    ADD CONSTRAINT "o_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."o_lvr_land_c_build"
    ADD CONSTRAINT "o_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_c_land"
    ADD CONSTRAINT "o_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_c_park"
    ADD CONSTRAINT "o_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."o_lvr_land_c"
    ADD CONSTRAINT "o_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."p_lvr_land_a_build"
    ADD CONSTRAINT "p_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_a_land"
    ADD CONSTRAINT "p_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_a_park"
    ADD CONSTRAINT "p_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_a"
    ADD CONSTRAINT "p_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."p_lvr_land_b_land"
    ADD CONSTRAINT "p_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_b_park"
    ADD CONSTRAINT "p_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_b"
    ADD CONSTRAINT "p_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."p_lvr_land_c_build"
    ADD CONSTRAINT "p_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_c_land"
    ADD CONSTRAINT "p_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_c_park"
    ADD CONSTRAINT "p_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."p_lvr_land_c"
    ADD CONSTRAINT "p_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."parsing_exceptions_v15"
    ADD CONSTRAINT "parsing_exceptions_v15_pattern_to_match_key" UNIQUE ("pattern_to_match");



ALTER TABLE ONLY "public"."parsing_exceptions_v15"
    ADD CONSTRAINT "parsing_exceptions_v15_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_name_mappings"
    ADD CONSTRAINT "project_name_mappings_old_name_key" UNIQUE ("old_name");



ALTER TABLE ONLY "public"."project_name_mappings"
    ADD CONSTRAINT "project_name_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_parsing_rules"
    ADD CONSTRAINT "project_parsing_rules_pkey" PRIMARY KEY ("project_name");



ALTER TABLE ONLY "public"."project_parsing_rules_v2"
    ADD CONSTRAINT "project_parsing_rules_v2_pkey" PRIMARY KEY ("project_name");



ALTER TABLE ONLY "public"."q_lvr_land_a_build"
    ADD CONSTRAINT "q_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_a_land"
    ADD CONSTRAINT "q_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_a_park"
    ADD CONSTRAINT "q_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_a"
    ADD CONSTRAINT "q_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."q_lvr_land_b_land"
    ADD CONSTRAINT "q_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_b_park"
    ADD CONSTRAINT "q_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_b"
    ADD CONSTRAINT "q_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."q_lvr_land_c_build"
    ADD CONSTRAINT "q_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_c_land"
    ADD CONSTRAINT "q_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_c_park"
    ADD CONSTRAINT "q_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."q_lvr_land_c"
    ADD CONSTRAINT "q_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."shared_reports"
    ADD CONSTRAINT "shared_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_reports"
    ADD CONSTRAINT "shared_reports_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."t_lvr_land_a_build"
    ADD CONSTRAINT "t_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_a_land"
    ADD CONSTRAINT "t_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_a_park"
    ADD CONSTRAINT "t_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_a"
    ADD CONSTRAINT "t_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."t_lvr_land_b_land"
    ADD CONSTRAINT "t_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_b_park"
    ADD CONSTRAINT "t_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_b"
    ADD CONSTRAINT "t_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."t_lvr_land_c_build"
    ADD CONSTRAINT "t_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_c_land"
    ADD CONSTRAINT "t_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_c_park"
    ADD CONSTRAINT "t_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."t_lvr_land_c"
    ADD CONSTRAINT "t_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."u_lvr_land_a_build"
    ADD CONSTRAINT "u_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_a_land"
    ADD CONSTRAINT "u_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_a_park"
    ADD CONSTRAINT "u_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_a"
    ADD CONSTRAINT "u_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."u_lvr_land_b_land"
    ADD CONSTRAINT "u_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_b_park"
    ADD CONSTRAINT "u_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_b"
    ADD CONSTRAINT "u_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."u_lvr_land_c_build"
    ADD CONSTRAINT "u_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_c_land"
    ADD CONSTRAINT "u_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_c_park"
    ADD CONSTRAINT "u_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."u_lvr_land_c"
    ADD CONSTRAINT "u_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."v_lvr_land_a_build"
    ADD CONSTRAINT "v_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_a_land"
    ADD CONSTRAINT "v_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_a_park"
    ADD CONSTRAINT "v_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_a"
    ADD CONSTRAINT "v_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."v_lvr_land_b_land"
    ADD CONSTRAINT "v_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_b_park"
    ADD CONSTRAINT "v_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_b"
    ADD CONSTRAINT "v_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."v_lvr_land_c_build"
    ADD CONSTRAINT "v_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_c_land"
    ADD CONSTRAINT "v_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_c_park"
    ADD CONSTRAINT "v_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."v_lvr_land_c"
    ADD CONSTRAINT "v_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."w_lvr_land_a_build"
    ADD CONSTRAINT "w_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_a_land"
    ADD CONSTRAINT "w_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_a_park"
    ADD CONSTRAINT "w_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_a"
    ADD CONSTRAINT "w_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."w_lvr_land_b_land"
    ADD CONSTRAINT "w_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_b_park"
    ADD CONSTRAINT "w_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_b"
    ADD CONSTRAINT "w_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."w_lvr_land_c_build"
    ADD CONSTRAINT "w_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_c_land"
    ADD CONSTRAINT "w_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_c_park"
    ADD CONSTRAINT "w_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."w_lvr_land_c"
    ADD CONSTRAINT "w_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."x_lvr_land_a_build"
    ADD CONSTRAINT "x_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_a_land"
    ADD CONSTRAINT "x_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_a_park"
    ADD CONSTRAINT "x_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_a"
    ADD CONSTRAINT "x_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."x_lvr_land_b_land"
    ADD CONSTRAINT "x_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_b_park"
    ADD CONSTRAINT "x_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_b"
    ADD CONSTRAINT "x_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."x_lvr_land_c_build"
    ADD CONSTRAINT "x_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_c_land"
    ADD CONSTRAINT "x_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_c_park"
    ADD CONSTRAINT "x_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."x_lvr_land_c"
    ADD CONSTRAINT "x_lvr_land_c_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."z_lvr_land_a_build"
    ADD CONSTRAINT "z_lvr_land_a_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_a_land"
    ADD CONSTRAINT "z_lvr_land_a_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_a_park"
    ADD CONSTRAINT "z_lvr_land_a_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_a"
    ADD CONSTRAINT "z_lvr_land_a_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."z_lvr_land_b_land"
    ADD CONSTRAINT "z_lvr_land_b_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_b_park"
    ADD CONSTRAINT "z_lvr_land_b_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_b"
    ADD CONSTRAINT "z_lvr_land_b_pkey" PRIMARY KEY ("編號");



ALTER TABLE ONLY "public"."z_lvr_land_c_build"
    ADD CONSTRAINT "z_lvr_land_c_build_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_c_land"
    ADD CONSTRAINT "z_lvr_land_c_land_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_c_park"
    ADD CONSTRAINT "z_lvr_land_c_park_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."z_lvr_land_c"
    ADD CONSTRAINT "z_lvr_land_c_pkey" PRIMARY KEY ("編號");



CREATE INDEX "idx_a_lvr_land_a_build_編號" ON "public"."a_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_a_land_編號" ON "public"."a_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_a_park_編號" ON "public"."a_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_a_交易日" ON "public"."a_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_a_lvr_land_a_交易總價" ON "public"."a_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_a_lvr_land_a_建物型態" ON "public"."a_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_a_lvr_land_a_行政區" ON "public"."a_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_a_lvr_land_b_land_編號" ON "public"."a_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_b_park_編號" ON "public"."a_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_b_交易日" ON "public"."a_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_a_lvr_land_b_建案名稱" ON "public"."a_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_a_lvr_land_b_行政區" ON "public"."a_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_a_lvr_land_c_build_編號" ON "public"."a_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_c_land_編號" ON "public"."a_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_c_park_編號" ON "public"."a_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_a_lvr_land_c_交易日" ON "public"."a_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_a_lvr_land_c_行政區" ON "public"."a_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_b_lvr_land_a_build_編號" ON "public"."b_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_a_land_編號" ON "public"."b_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_a_park_編號" ON "public"."b_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_a_交易日" ON "public"."b_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_b_lvr_land_a_交易總價" ON "public"."b_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_b_lvr_land_a_建物型態" ON "public"."b_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_b_lvr_land_a_行政區" ON "public"."b_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_b_lvr_land_b_land_編號" ON "public"."b_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_b_park_編號" ON "public"."b_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_b_交易日" ON "public"."b_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_b_lvr_land_b_建案名稱" ON "public"."b_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_b_lvr_land_b_行政區" ON "public"."b_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_b_lvr_land_c_build_編號" ON "public"."b_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_c_land_編號" ON "public"."b_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_c_park_編號" ON "public"."b_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_b_lvr_land_c_交易日" ON "public"."b_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_b_lvr_land_c_行政區" ON "public"."b_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_c_lvr_land_a_build_編號" ON "public"."c_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_a_land_編號" ON "public"."c_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_a_park_編號" ON "public"."c_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_a_交易日" ON "public"."c_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_c_lvr_land_a_交易總價" ON "public"."c_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_c_lvr_land_a_建物型態" ON "public"."c_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_c_lvr_land_a_行政區" ON "public"."c_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_c_lvr_land_b_land_編號" ON "public"."c_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_b_park_編號" ON "public"."c_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_b_交易日" ON "public"."c_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_c_lvr_land_b_建案名稱" ON "public"."c_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_c_lvr_land_b_行政區" ON "public"."c_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_c_lvr_land_c_build_編號" ON "public"."c_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_c_land_編號" ON "public"."c_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_c_park_編號" ON "public"."c_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_c_lvr_land_c_交易日" ON "public"."c_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_c_lvr_land_c_行政區" ON "public"."c_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_county_name_zh" ON "public"."county_codes" USING "btree" ("name_zh");



CREATE INDEX "idx_d_lvr_land_a_build_編號" ON "public"."d_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_a_land_編號" ON "public"."d_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_a_park_編號" ON "public"."d_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_a_交易日" ON "public"."d_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_d_lvr_land_a_交易總價" ON "public"."d_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_d_lvr_land_a_建物型態" ON "public"."d_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_d_lvr_land_a_行政區" ON "public"."d_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_d_lvr_land_b_land_編號" ON "public"."d_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_b_park_編號" ON "public"."d_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_b_交易日" ON "public"."d_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_d_lvr_land_b_建案名稱" ON "public"."d_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_d_lvr_land_b_行政區" ON "public"."d_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_d_lvr_land_c_build_編號" ON "public"."d_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_c_land_編號" ON "public"."d_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_c_park_編號" ON "public"."d_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_d_lvr_land_c_交易日" ON "public"."d_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_d_lvr_land_c_行政區" ON "public"."d_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_e_lvr_land_a_build_編號" ON "public"."e_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_a_land_編號" ON "public"."e_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_a_park_編號" ON "public"."e_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_a_交易日" ON "public"."e_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_e_lvr_land_a_交易總價" ON "public"."e_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_e_lvr_land_a_建物型態" ON "public"."e_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_e_lvr_land_a_行政區" ON "public"."e_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_e_lvr_land_b_land_編號" ON "public"."e_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_b_park_編號" ON "public"."e_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_b_交易日" ON "public"."e_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_e_lvr_land_b_建案名稱" ON "public"."e_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_e_lvr_land_b_行政區" ON "public"."e_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_e_lvr_land_c_build_編號" ON "public"."e_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_c_land_編號" ON "public"."e_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_c_park_編號" ON "public"."e_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_e_lvr_land_c_交易日" ON "public"."e_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_e_lvr_land_c_行政區" ON "public"."e_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_f_lvr_land_a_build_編號" ON "public"."f_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_a_land_編號" ON "public"."f_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_a_park_編號" ON "public"."f_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_a_交易日" ON "public"."f_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_f_lvr_land_a_交易總價" ON "public"."f_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_f_lvr_land_a_建物型態" ON "public"."f_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_f_lvr_land_a_行政區" ON "public"."f_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_f_lvr_land_b_land_編號" ON "public"."f_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_b_park_編號" ON "public"."f_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_b_交易日" ON "public"."f_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_f_lvr_land_b_建案名稱" ON "public"."f_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_f_lvr_land_b_行政區" ON "public"."f_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_f_lvr_land_c_build_編號" ON "public"."f_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_c_land_編號" ON "public"."f_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_c_park_編號" ON "public"."f_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_f_lvr_land_c_交易日" ON "public"."f_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_f_lvr_land_c_行政區" ON "public"."f_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_g_lvr_land_a_build_編號" ON "public"."g_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_a_land_編號" ON "public"."g_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_a_park_編號" ON "public"."g_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_a_交易日" ON "public"."g_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_g_lvr_land_a_交易總價" ON "public"."g_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_g_lvr_land_a_建物型態" ON "public"."g_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_g_lvr_land_a_行政區" ON "public"."g_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_g_lvr_land_b_land_編號" ON "public"."g_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_b_park_編號" ON "public"."g_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_b_交易日" ON "public"."g_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_g_lvr_land_b_建案名稱" ON "public"."g_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_g_lvr_land_b_行政區" ON "public"."g_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_g_lvr_land_c_build_編號" ON "public"."g_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_c_land_編號" ON "public"."g_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_c_park_編號" ON "public"."g_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_g_lvr_land_c_交易日" ON "public"."g_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_g_lvr_land_c_行政區" ON "public"."g_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_h_lvr_land_a_build_編號" ON "public"."h_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_a_land_編號" ON "public"."h_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_a_park_編號" ON "public"."h_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_a_交易日" ON "public"."h_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_h_lvr_land_a_交易總價" ON "public"."h_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_h_lvr_land_a_建物型態" ON "public"."h_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_h_lvr_land_a_行政區" ON "public"."h_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_h_lvr_land_b_land_編號" ON "public"."h_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_b_park_編號" ON "public"."h_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_b_交易日" ON "public"."h_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_h_lvr_land_b_建案名稱" ON "public"."h_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_h_lvr_land_b_行政區" ON "public"."h_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_h_lvr_land_c_build_編號" ON "public"."h_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_c_land_編號" ON "public"."h_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_c_park_編號" ON "public"."h_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_h_lvr_land_c_交易日" ON "public"."h_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_h_lvr_land_c_行政區" ON "public"."h_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_i_lvr_land_a_build_編號" ON "public"."i_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_a_land_編號" ON "public"."i_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_a_park_編號" ON "public"."i_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_a_交易日" ON "public"."i_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_i_lvr_land_a_交易總價" ON "public"."i_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_i_lvr_land_a_建物型態" ON "public"."i_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_i_lvr_land_a_行政區" ON "public"."i_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_i_lvr_land_b_land_編號" ON "public"."i_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_b_park_編號" ON "public"."i_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_b_交易日" ON "public"."i_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_i_lvr_land_b_建案名稱" ON "public"."i_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_i_lvr_land_b_行政區" ON "public"."i_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_i_lvr_land_c_build_編號" ON "public"."i_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_c_land_編號" ON "public"."i_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_c_park_編號" ON "public"."i_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_i_lvr_land_c_交易日" ON "public"."i_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_i_lvr_land_c_行政區" ON "public"."i_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_j_lvr_land_a_build_編號" ON "public"."j_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_a_land_編號" ON "public"."j_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_a_park_編號" ON "public"."j_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_a_交易日" ON "public"."j_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_j_lvr_land_a_交易總價" ON "public"."j_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_j_lvr_land_a_建物型態" ON "public"."j_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_j_lvr_land_a_行政區" ON "public"."j_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_j_lvr_land_b_land_編號" ON "public"."j_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_b_park_編號" ON "public"."j_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_b_交易日" ON "public"."j_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_j_lvr_land_b_建案名稱" ON "public"."j_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_j_lvr_land_b_行政區" ON "public"."j_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_j_lvr_land_c_build_編號" ON "public"."j_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_c_land_編號" ON "public"."j_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_c_park_編號" ON "public"."j_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_j_lvr_land_c_交易日" ON "public"."j_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_j_lvr_land_c_行政區" ON "public"."j_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_k_lvr_land_a_build_編號" ON "public"."k_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_a_land_編號" ON "public"."k_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_a_park_編號" ON "public"."k_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_a_交易日" ON "public"."k_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_k_lvr_land_a_交易總價" ON "public"."k_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_k_lvr_land_a_建物型態" ON "public"."k_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_k_lvr_land_a_行政區" ON "public"."k_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_k_lvr_land_b_land_編號" ON "public"."k_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_b_park_編號" ON "public"."k_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_b_交易日" ON "public"."k_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_k_lvr_land_b_建案名稱" ON "public"."k_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_k_lvr_land_b_行政區" ON "public"."k_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_k_lvr_land_c_build_編號" ON "public"."k_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_c_land_編號" ON "public"."k_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_c_park_編號" ON "public"."k_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_k_lvr_land_c_交易日" ON "public"."k_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_k_lvr_land_c_行政區" ON "public"."k_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_m_lvr_land_a_build_編號" ON "public"."m_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_a_land_編號" ON "public"."m_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_a_park_編號" ON "public"."m_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_a_交易日" ON "public"."m_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_m_lvr_land_a_交易總價" ON "public"."m_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_m_lvr_land_a_建物型態" ON "public"."m_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_m_lvr_land_a_行政區" ON "public"."m_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_m_lvr_land_b_land_編號" ON "public"."m_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_b_park_編號" ON "public"."m_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_b_交易日" ON "public"."m_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_m_lvr_land_b_建案名稱" ON "public"."m_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_m_lvr_land_b_行政區" ON "public"."m_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_m_lvr_land_c_build_編號" ON "public"."m_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_c_land_編號" ON "public"."m_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_c_park_編號" ON "public"."m_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_m_lvr_land_c_交易日" ON "public"."m_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_m_lvr_land_c_行政區" ON "public"."m_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_n_lvr_land_a_build_編號" ON "public"."n_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_a_land_編號" ON "public"."n_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_a_park_編號" ON "public"."n_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_a_交易日" ON "public"."n_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_n_lvr_land_a_交易總價" ON "public"."n_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_n_lvr_land_a_建物型態" ON "public"."n_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_n_lvr_land_a_行政區" ON "public"."n_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_n_lvr_land_b_land_編號" ON "public"."n_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_b_park_編號" ON "public"."n_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_b_交易日" ON "public"."n_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_n_lvr_land_b_建案名稱" ON "public"."n_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_n_lvr_land_b_行政區" ON "public"."n_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_n_lvr_land_c_build_編號" ON "public"."n_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_c_land_編號" ON "public"."n_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_c_park_編號" ON "public"."n_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_n_lvr_land_c_交易日" ON "public"."n_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_n_lvr_land_c_行政區" ON "public"."n_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_o_lvr_land_a_build_編號" ON "public"."o_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_a_land_編號" ON "public"."o_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_a_park_編號" ON "public"."o_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_a_交易日" ON "public"."o_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_o_lvr_land_a_交易總價" ON "public"."o_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_o_lvr_land_a_建物型態" ON "public"."o_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_o_lvr_land_a_行政區" ON "public"."o_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_o_lvr_land_b_land_編號" ON "public"."o_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_b_park_編號" ON "public"."o_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_b_交易日" ON "public"."o_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_o_lvr_land_b_建案名稱" ON "public"."o_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_o_lvr_land_b_行政區" ON "public"."o_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_o_lvr_land_c_build_編號" ON "public"."o_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_c_land_編號" ON "public"."o_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_c_park_編號" ON "public"."o_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_o_lvr_land_c_交易日" ON "public"."o_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_o_lvr_land_c_行政區" ON "public"."o_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_p_lvr_land_a_build_編號" ON "public"."p_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_a_land_編號" ON "public"."p_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_a_park_編號" ON "public"."p_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_a_交易日" ON "public"."p_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_p_lvr_land_a_交易總價" ON "public"."p_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_p_lvr_land_a_建物型態" ON "public"."p_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_p_lvr_land_a_行政區" ON "public"."p_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_p_lvr_land_b_land_編號" ON "public"."p_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_b_park_編號" ON "public"."p_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_b_交易日" ON "public"."p_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_p_lvr_land_b_建案名稱" ON "public"."p_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_p_lvr_land_b_行政區" ON "public"."p_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_p_lvr_land_c_build_編號" ON "public"."p_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_c_land_編號" ON "public"."p_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_c_park_編號" ON "public"."p_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_p_lvr_land_c_交易日" ON "public"."p_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_p_lvr_land_c_行政區" ON "public"."p_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_project_name_mappings_old_name" ON "public"."project_name_mappings" USING "btree" ("old_name");



CREATE INDEX "idx_project_rules_score" ON "public"."project_parsing_rules" USING "btree" ("confidence_score" DESC);



CREATE INDEX "idx_q_lvr_land_a_build_編號" ON "public"."q_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_a_land_編號" ON "public"."q_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_a_park_編號" ON "public"."q_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_a_交易日" ON "public"."q_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_q_lvr_land_a_交易總價" ON "public"."q_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_q_lvr_land_a_建物型態" ON "public"."q_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_q_lvr_land_a_行政區" ON "public"."q_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_q_lvr_land_b_land_編號" ON "public"."q_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_b_park_編號" ON "public"."q_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_b_交易日" ON "public"."q_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_q_lvr_land_b_建案名稱" ON "public"."q_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_q_lvr_land_b_行政區" ON "public"."q_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_q_lvr_land_c_build_編號" ON "public"."q_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_c_land_編號" ON "public"."q_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_c_park_編號" ON "public"."q_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_q_lvr_land_c_交易日" ON "public"."q_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_q_lvr_land_c_行政區" ON "public"."q_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_shared_reports_created_by" ON "public"."shared_reports" USING "btree" ("created_by");



CREATE INDEX "idx_shared_reports_token" ON "public"."shared_reports" USING "btree" ("token");



CREATE INDEX "idx_t_lvr_land_a_build_編號" ON "public"."t_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_a_land_編號" ON "public"."t_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_a_park_編號" ON "public"."t_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_a_交易日" ON "public"."t_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_t_lvr_land_a_交易總價" ON "public"."t_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_t_lvr_land_a_建物型態" ON "public"."t_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_t_lvr_land_a_行政區" ON "public"."t_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_t_lvr_land_b_land_編號" ON "public"."t_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_b_park_編號" ON "public"."t_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_b_交易日" ON "public"."t_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_t_lvr_land_b_建案名稱" ON "public"."t_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_t_lvr_land_b_行政區" ON "public"."t_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_t_lvr_land_c_build_編號" ON "public"."t_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_c_land_編號" ON "public"."t_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_c_park_編號" ON "public"."t_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_t_lvr_land_c_交易日" ON "public"."t_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_t_lvr_land_c_行政區" ON "public"."t_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_u_lvr_land_a_build_編號" ON "public"."u_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_a_land_編號" ON "public"."u_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_a_park_編號" ON "public"."u_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_a_交易日" ON "public"."u_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_u_lvr_land_a_交易總價" ON "public"."u_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_u_lvr_land_a_建物型態" ON "public"."u_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_u_lvr_land_a_行政區" ON "public"."u_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_u_lvr_land_b_land_編號" ON "public"."u_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_b_park_編號" ON "public"."u_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_b_交易日" ON "public"."u_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_u_lvr_land_b_建案名稱" ON "public"."u_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_u_lvr_land_b_行政區" ON "public"."u_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_u_lvr_land_c_build_編號" ON "public"."u_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_c_land_編號" ON "public"."u_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_c_park_編號" ON "public"."u_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_u_lvr_land_c_交易日" ON "public"."u_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_u_lvr_land_c_行政區" ON "public"."u_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_v_lvr_land_a_build_編號" ON "public"."v_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_a_land_編號" ON "public"."v_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_a_park_編號" ON "public"."v_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_a_交易日" ON "public"."v_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_v_lvr_land_a_交易總價" ON "public"."v_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_v_lvr_land_a_建物型態" ON "public"."v_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_v_lvr_land_a_行政區" ON "public"."v_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_v_lvr_land_b_land_編號" ON "public"."v_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_b_park_編號" ON "public"."v_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_b_交易日" ON "public"."v_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_v_lvr_land_b_建案名稱" ON "public"."v_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_v_lvr_land_b_行政區" ON "public"."v_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_v_lvr_land_c_build_編號" ON "public"."v_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_c_land_編號" ON "public"."v_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_c_park_編號" ON "public"."v_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_v_lvr_land_c_交易日" ON "public"."v_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_v_lvr_land_c_行政區" ON "public"."v_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_w_lvr_land_a_build_編號" ON "public"."w_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_a_land_編號" ON "public"."w_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_a_park_編號" ON "public"."w_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_a_交易日" ON "public"."w_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_w_lvr_land_a_交易總價" ON "public"."w_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_w_lvr_land_a_建物型態" ON "public"."w_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_w_lvr_land_a_行政區" ON "public"."w_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_w_lvr_land_b_land_編號" ON "public"."w_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_b_park_編號" ON "public"."w_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_b_交易日" ON "public"."w_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_w_lvr_land_b_建案名稱" ON "public"."w_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_w_lvr_land_b_行政區" ON "public"."w_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_w_lvr_land_c_build_編號" ON "public"."w_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_c_land_編號" ON "public"."w_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_c_park_編號" ON "public"."w_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_w_lvr_land_c_交易日" ON "public"."w_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_w_lvr_land_c_行政區" ON "public"."w_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_x_lvr_land_a_build_編號" ON "public"."x_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_a_land_編號" ON "public"."x_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_a_park_編號" ON "public"."x_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_a_交易日" ON "public"."x_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_x_lvr_land_a_交易總價" ON "public"."x_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_x_lvr_land_a_建物型態" ON "public"."x_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_x_lvr_land_a_行政區" ON "public"."x_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_x_lvr_land_b_land_編號" ON "public"."x_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_b_park_編號" ON "public"."x_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_b_交易日" ON "public"."x_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_x_lvr_land_b_建案名稱" ON "public"."x_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_x_lvr_land_b_行政區" ON "public"."x_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_x_lvr_land_c_build_編號" ON "public"."x_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_c_land_編號" ON "public"."x_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_c_park_編號" ON "public"."x_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_x_lvr_land_c_交易日" ON "public"."x_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_x_lvr_land_c_行政區" ON "public"."x_lvr_land_c" USING "btree" ("行政區");



CREATE INDEX "idx_z_lvr_land_a_build_編號" ON "public"."z_lvr_land_a_build" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_a_land_編號" ON "public"."z_lvr_land_a_land" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_a_park_編號" ON "public"."z_lvr_land_a_park" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_a_交易日" ON "public"."z_lvr_land_a" USING "btree" ("交易日");



CREATE INDEX "idx_z_lvr_land_a_交易總價" ON "public"."z_lvr_land_a" USING "btree" ("交易總價");



CREATE INDEX "idx_z_lvr_land_a_建物型態" ON "public"."z_lvr_land_a" USING "btree" ("建物型態");



CREATE INDEX "idx_z_lvr_land_a_行政區" ON "public"."z_lvr_land_a" USING "btree" ("行政區");



CREATE INDEX "idx_z_lvr_land_b_land_編號" ON "public"."z_lvr_land_b_land" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_b_park_編號" ON "public"."z_lvr_land_b_park" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_b_交易日" ON "public"."z_lvr_land_b" USING "btree" ("交易日");



CREATE INDEX "idx_z_lvr_land_b_建案名稱" ON "public"."z_lvr_land_b" USING "btree" ("建案名稱");



CREATE INDEX "idx_z_lvr_land_b_行政區" ON "public"."z_lvr_land_b" USING "btree" ("行政區");



CREATE INDEX "idx_z_lvr_land_c_build_編號" ON "public"."z_lvr_land_c_build" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_c_land_編號" ON "public"."z_lvr_land_c_land" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_c_park_編號" ON "public"."z_lvr_land_c_park" USING "btree" ("編號");



CREATE INDEX "idx_z_lvr_land_c_交易日" ON "public"."z_lvr_land_c" USING "btree" ("交易日");



CREATE INDEX "idx_z_lvr_land_c_行政區" ON "public"."z_lvr_land_c" USING "btree" ("行政區");



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."a_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."b_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."c_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."d_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."e_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."f_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."g_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."h_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."i_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."j_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."k_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."m_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."n_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."o_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."p_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."q_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."t_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."u_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."v_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."w_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."x_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_a" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_a_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_a_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_b" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_b_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_b_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_c" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_main_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_c_build" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_c_land" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



CREATE OR REPLACE TRIGGER "trg_calculate_fields" BEFORE INSERT OR UPDATE ON "public"."z_lvr_land_c_park" FOR EACH ROW EXECUTE FUNCTION "public"."fn_calculate_sub_tables_fields"();



ALTER TABLE ONLY "public"."a_lvr_land_a_build"
    ADD CONSTRAINT "fk_a_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_a_land"
    ADD CONSTRAINT "fk_a_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_a_park"
    ADD CONSTRAINT "fk_a_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_b_land"
    ADD CONSTRAINT "fk_a_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_b_park"
    ADD CONSTRAINT "fk_a_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_c_build"
    ADD CONSTRAINT "fk_a_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_c_land"
    ADD CONSTRAINT "fk_a_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."a_lvr_land_c_park"
    ADD CONSTRAINT "fk_a_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."a_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_a_build"
    ADD CONSTRAINT "fk_b_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_a_land"
    ADD CONSTRAINT "fk_b_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_a_park"
    ADD CONSTRAINT "fk_b_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_b_land"
    ADD CONSTRAINT "fk_b_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_b_park"
    ADD CONSTRAINT "fk_b_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_c_build"
    ADD CONSTRAINT "fk_b_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_c_land"
    ADD CONSTRAINT "fk_b_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."b_lvr_land_c_park"
    ADD CONSTRAINT "fk_b_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."b_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_a_build"
    ADD CONSTRAINT "fk_c_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_a_land"
    ADD CONSTRAINT "fk_c_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_a_park"
    ADD CONSTRAINT "fk_c_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_b_land"
    ADD CONSTRAINT "fk_c_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_b_park"
    ADD CONSTRAINT "fk_c_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_c_build"
    ADD CONSTRAINT "fk_c_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_c_land"
    ADD CONSTRAINT "fk_c_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."c_lvr_land_c_park"
    ADD CONSTRAINT "fk_c_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."c_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_a_build"
    ADD CONSTRAINT "fk_d_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_a_land"
    ADD CONSTRAINT "fk_d_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_a_park"
    ADD CONSTRAINT "fk_d_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_b_land"
    ADD CONSTRAINT "fk_d_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_b_park"
    ADD CONSTRAINT "fk_d_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_c_build"
    ADD CONSTRAINT "fk_d_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_c_land"
    ADD CONSTRAINT "fk_d_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."d_lvr_land_c_park"
    ADD CONSTRAINT "fk_d_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."d_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_a_build"
    ADD CONSTRAINT "fk_e_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_a_land"
    ADD CONSTRAINT "fk_e_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_a_park"
    ADD CONSTRAINT "fk_e_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_b_land"
    ADD CONSTRAINT "fk_e_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_b_park"
    ADD CONSTRAINT "fk_e_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_c_build"
    ADD CONSTRAINT "fk_e_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_c_land"
    ADD CONSTRAINT "fk_e_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."e_lvr_land_c_park"
    ADD CONSTRAINT "fk_e_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."e_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_a_build"
    ADD CONSTRAINT "fk_f_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_a_land"
    ADD CONSTRAINT "fk_f_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_a_park"
    ADD CONSTRAINT "fk_f_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_b_land"
    ADD CONSTRAINT "fk_f_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_b_park"
    ADD CONSTRAINT "fk_f_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_c_build"
    ADD CONSTRAINT "fk_f_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_c_land"
    ADD CONSTRAINT "fk_f_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."f_lvr_land_c_park"
    ADD CONSTRAINT "fk_f_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."f_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_a_build"
    ADD CONSTRAINT "fk_g_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_a_land"
    ADD CONSTRAINT "fk_g_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_a_park"
    ADD CONSTRAINT "fk_g_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_b_land"
    ADD CONSTRAINT "fk_g_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_b_park"
    ADD CONSTRAINT "fk_g_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_c_build"
    ADD CONSTRAINT "fk_g_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_c_land"
    ADD CONSTRAINT "fk_g_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."g_lvr_land_c_park"
    ADD CONSTRAINT "fk_g_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."g_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_a_build"
    ADD CONSTRAINT "fk_h_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_a_land"
    ADD CONSTRAINT "fk_h_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_a_park"
    ADD CONSTRAINT "fk_h_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_b_land"
    ADD CONSTRAINT "fk_h_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_b_park"
    ADD CONSTRAINT "fk_h_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_c_build"
    ADD CONSTRAINT "fk_h_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_c_land"
    ADD CONSTRAINT "fk_h_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."h_lvr_land_c_park"
    ADD CONSTRAINT "fk_h_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."h_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_a_build"
    ADD CONSTRAINT "fk_i_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_a_land"
    ADD CONSTRAINT "fk_i_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_a_park"
    ADD CONSTRAINT "fk_i_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_b_land"
    ADD CONSTRAINT "fk_i_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_b_park"
    ADD CONSTRAINT "fk_i_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_c_build"
    ADD CONSTRAINT "fk_i_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_c_land"
    ADD CONSTRAINT "fk_i_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."i_lvr_land_c_park"
    ADD CONSTRAINT "fk_i_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."i_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_a_build"
    ADD CONSTRAINT "fk_j_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_a_land"
    ADD CONSTRAINT "fk_j_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_a_park"
    ADD CONSTRAINT "fk_j_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_b_land"
    ADD CONSTRAINT "fk_j_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_b_park"
    ADD CONSTRAINT "fk_j_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_c_build"
    ADD CONSTRAINT "fk_j_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_c_land"
    ADD CONSTRAINT "fk_j_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."j_lvr_land_c_park"
    ADD CONSTRAINT "fk_j_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."j_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_a_build"
    ADD CONSTRAINT "fk_k_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_a_land"
    ADD CONSTRAINT "fk_k_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_a_park"
    ADD CONSTRAINT "fk_k_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_b_land"
    ADD CONSTRAINT "fk_k_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_b_park"
    ADD CONSTRAINT "fk_k_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_c_build"
    ADD CONSTRAINT "fk_k_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_c_land"
    ADD CONSTRAINT "fk_k_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."k_lvr_land_c_park"
    ADD CONSTRAINT "fk_k_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."k_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_a_build"
    ADD CONSTRAINT "fk_m_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_a_land"
    ADD CONSTRAINT "fk_m_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_a_park"
    ADD CONSTRAINT "fk_m_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_b_land"
    ADD CONSTRAINT "fk_m_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_b_park"
    ADD CONSTRAINT "fk_m_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_c_build"
    ADD CONSTRAINT "fk_m_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_c_land"
    ADD CONSTRAINT "fk_m_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."m_lvr_land_c_park"
    ADD CONSTRAINT "fk_m_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."m_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_a_build"
    ADD CONSTRAINT "fk_n_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_a_land"
    ADD CONSTRAINT "fk_n_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_a_park"
    ADD CONSTRAINT "fk_n_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_b_land"
    ADD CONSTRAINT "fk_n_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_b_park"
    ADD CONSTRAINT "fk_n_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_c_build"
    ADD CONSTRAINT "fk_n_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_c_land"
    ADD CONSTRAINT "fk_n_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."n_lvr_land_c_park"
    ADD CONSTRAINT "fk_n_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."n_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_a_build"
    ADD CONSTRAINT "fk_o_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_a_land"
    ADD CONSTRAINT "fk_o_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_a_park"
    ADD CONSTRAINT "fk_o_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_b_land"
    ADD CONSTRAINT "fk_o_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_b_park"
    ADD CONSTRAINT "fk_o_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_c_build"
    ADD CONSTRAINT "fk_o_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_c_land"
    ADD CONSTRAINT "fk_o_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."o_lvr_land_c_park"
    ADD CONSTRAINT "fk_o_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."o_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_a_build"
    ADD CONSTRAINT "fk_p_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_a_land"
    ADD CONSTRAINT "fk_p_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_a_park"
    ADD CONSTRAINT "fk_p_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_b_land"
    ADD CONSTRAINT "fk_p_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_b_park"
    ADD CONSTRAINT "fk_p_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_c_build"
    ADD CONSTRAINT "fk_p_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_c_land"
    ADD CONSTRAINT "fk_p_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."p_lvr_land_c_park"
    ADD CONSTRAINT "fk_p_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."p_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_a_build"
    ADD CONSTRAINT "fk_q_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_a_land"
    ADD CONSTRAINT "fk_q_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_a_park"
    ADD CONSTRAINT "fk_q_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_b_land"
    ADD CONSTRAINT "fk_q_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_b_park"
    ADD CONSTRAINT "fk_q_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_c_build"
    ADD CONSTRAINT "fk_q_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_c_land"
    ADD CONSTRAINT "fk_q_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."q_lvr_land_c_park"
    ADD CONSTRAINT "fk_q_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."q_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_a_build"
    ADD CONSTRAINT "fk_t_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_a_land"
    ADD CONSTRAINT "fk_t_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_a_park"
    ADD CONSTRAINT "fk_t_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_b_land"
    ADD CONSTRAINT "fk_t_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_b_park"
    ADD CONSTRAINT "fk_t_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_c_build"
    ADD CONSTRAINT "fk_t_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_c_land"
    ADD CONSTRAINT "fk_t_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."t_lvr_land_c_park"
    ADD CONSTRAINT "fk_t_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."t_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_a_build"
    ADD CONSTRAINT "fk_u_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_a_land"
    ADD CONSTRAINT "fk_u_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_a_park"
    ADD CONSTRAINT "fk_u_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_b_land"
    ADD CONSTRAINT "fk_u_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_b_park"
    ADD CONSTRAINT "fk_u_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_c_build"
    ADD CONSTRAINT "fk_u_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_c_land"
    ADD CONSTRAINT "fk_u_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."u_lvr_land_c_park"
    ADD CONSTRAINT "fk_u_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."u_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_a_build"
    ADD CONSTRAINT "fk_v_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_a_land"
    ADD CONSTRAINT "fk_v_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_a_park"
    ADD CONSTRAINT "fk_v_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_b_land"
    ADD CONSTRAINT "fk_v_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_b_park"
    ADD CONSTRAINT "fk_v_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_c_build"
    ADD CONSTRAINT "fk_v_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_c_land"
    ADD CONSTRAINT "fk_v_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."v_lvr_land_c_park"
    ADD CONSTRAINT "fk_v_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."v_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_a_build"
    ADD CONSTRAINT "fk_w_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_a_land"
    ADD CONSTRAINT "fk_w_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_a_park"
    ADD CONSTRAINT "fk_w_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_b_land"
    ADD CONSTRAINT "fk_w_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_b_park"
    ADD CONSTRAINT "fk_w_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_c_build"
    ADD CONSTRAINT "fk_w_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_c_land"
    ADD CONSTRAINT "fk_w_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."w_lvr_land_c_park"
    ADD CONSTRAINT "fk_w_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."w_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_a_build"
    ADD CONSTRAINT "fk_x_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_a_land"
    ADD CONSTRAINT "fk_x_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_a_park"
    ADD CONSTRAINT "fk_x_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_b_land"
    ADD CONSTRAINT "fk_x_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_b_park"
    ADD CONSTRAINT "fk_x_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_c_build"
    ADD CONSTRAINT "fk_x_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_c_land"
    ADD CONSTRAINT "fk_x_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."x_lvr_land_c_park"
    ADD CONSTRAINT "fk_x_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."x_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_a_build"
    ADD CONSTRAINT "fk_z_a_build_to_a" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_a_land"
    ADD CONSTRAINT "fk_z_a_land_to_a" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_a_park"
    ADD CONSTRAINT "fk_z_a_park_to_a" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_a"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_b_land"
    ADD CONSTRAINT "fk_z_b_land_to_b" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_b_park"
    ADD CONSTRAINT "fk_z_b_park_to_b" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_b"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_c_build"
    ADD CONSTRAINT "fk_z_c_build_to_c" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_c_land"
    ADD CONSTRAINT "fk_z_c_land_to_c" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."z_lvr_land_c_park"
    ADD CONSTRAINT "fk_z_c_park_to_c" FOREIGN KEY ("編號") REFERENCES "public"."z_lvr_land_c"("編號") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_reports"
    ADD CONSTRAINT "shared_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Allow public read access" ON "public"."shared_reports" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."shared_reports" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































































































































GRANT ALL ON FUNCTION "public"."analyze_project_pattern"("p_project_name" "text", "p_sample_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."analyze_project_pattern"("p_project_name" "text", "p_sample_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."analyze_project_pattern"("p_project_name" "text", "p_sample_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_calculate_main_tables_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_calculate_main_tables_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_calculate_main_tables_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_calculate_sub_tables_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_calculate_sub_tables_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_calculate_sub_tables_fields"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_parse_floor_to_int"("floor_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_parse_floor_to_int"("floor_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_parse_floor_to_int"("floor_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_parse_roc_to_date"("roc_date_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."fn_parse_roc_to_date"("roc_date_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_parse_roc_to_date"("roc_date_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transaction_by_serial"("serial_number_param" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transaction_by_serial"("serial_number_param" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transaction_by_serial"("serial_number_param" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transaction_details"("transaction_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_transaction_details"("transaction_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transaction_details"("transaction_id_param" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."learn_all_project_patterns"() TO "anon";
GRANT ALL ON FUNCTION "public"."learn_all_project_patterns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."learn_all_project_patterns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."learn_all_project_patterns_v2"() TO "anon";
GRANT ALL ON FUNCTION "public"."learn_all_project_patterns_v2"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."learn_all_project_patterns_v2"() TO "service_role";



GRANT ALL ON FUNCTION "public"."perform_analysis"("p_county_code" "text", "p_group_by_column" "text", "p_metric_column" "text", "p_building_type" "text", "p_project_names" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."perform_analysis"("p_county_code" "text", "p_group_by_column" "text", "p_metric_column" "text", "p_building_type" "text", "p_project_names" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."perform_analysis"("p_county_code" "text", "p_group_by_column" "text", "p_metric_column" "text", "p_building_type" "text", "p_project_names" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_all_transactions_view"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_all_transactions_view"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_all_transactions_view"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_project_names"("county_code" "text", "search_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_project_names"("county_code" "text", "search_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_project_names"("county_code" "text", "search_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."a_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."a_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."a_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."a_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."a_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_a" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_a" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_a" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_b" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_b" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_b" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_c" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_c" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_c" TO "service_role";



GRANT ALL ON TABLE "public"."all_transactions_view" TO "anon";
GRANT ALL ON TABLE "public"."all_transactions_view" TO "authenticated";
GRANT ALL ON TABLE "public"."all_transactions_view" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."b_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."b_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."b_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."b_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."c_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."c_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."c_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."c_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."county_codes" TO "anon";
GRANT ALL ON TABLE "public"."county_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."county_codes" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."d_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."d_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."d_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."d_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."e_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."e_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."e_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."e_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."f_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."f_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."f_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."f_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."g_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."g_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."g_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."g_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."h_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."h_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."h_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."h_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."i_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."i_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."i_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."i_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."j_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."j_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."j_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."j_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."k_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."k_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."k_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."k_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."m_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."m_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."m_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."m_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."n_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."n_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."n_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."n_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."o_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."o_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."o_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."o_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."p_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."p_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."p_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."p_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."parsing_exceptions_v15" TO "anon";
GRANT ALL ON TABLE "public"."parsing_exceptions_v15" TO "authenticated";
GRANT ALL ON TABLE "public"."parsing_exceptions_v15" TO "service_role";



GRANT ALL ON SEQUENCE "public"."parsing_exceptions_v15_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."parsing_exceptions_v15_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."parsing_exceptions_v15_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."project_name_mappings" TO "anon";
GRANT ALL ON TABLE "public"."project_name_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."project_name_mappings" TO "service_role";



GRANT ALL ON SEQUENCE "public"."project_name_mappings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."project_name_mappings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."project_name_mappings_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."project_parsing_rules" TO "anon";
GRANT ALL ON TABLE "public"."project_parsing_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."project_parsing_rules" TO "service_role";



GRANT ALL ON TABLE "public"."project_parsing_rules_v2" TO "anon";
GRANT ALL ON TABLE "public"."project_parsing_rules_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."project_parsing_rules_v2" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."q_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."q_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."q_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."q_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_reports" TO "anon";
GRANT ALL ON TABLE "public"."shared_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_reports" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."t_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."t_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."t_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."t_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."u_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."u_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."u_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."u_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."v_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."v_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."v_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."v_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."w_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."w_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."w_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."w_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."x_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."x_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."x_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."x_lvr_land_c_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_a_build" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_a_build" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_a_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_a_land" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_a_land" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_a_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_a_park" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_a_park" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_a_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_a_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_b_land" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_b_land" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_b_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_b_park" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_b_park" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_b_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_b_park_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_c_build" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_c_build" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_c_build" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_build_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_build_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_build_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_c_land" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_c_land" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_c_land" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_land_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_land_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_land_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."z_lvr_land_c_park" TO "anon";
GRANT ALL ON TABLE "public"."z_lvr_land_c_park" TO "authenticated";
GRANT ALL ON TABLE "public"."z_lvr_land_c_park" TO "service_role";



GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_park_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_park_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."z_lvr_land_c_park_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























