--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: analyze_project_pattern(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.analyze_project_pattern(p_project_name text, p_sample_limit integer DEFAULT 50) RETURNS TABLE(pattern_type character varying, pattern_regex text, confidence_score numeric, match_count integer)
    LANGUAGE plpgsql
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


--
-- Name: fn_calculate_main_tables_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calculate_main_tables_fields() RETURNS trigger
    LANGUAGE plpgsql
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


--
-- Name: fn_calculate_sub_tables_fields(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_calculate_sub_tables_fields() RETURNS trigger
    LANGUAGE plpgsql
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


--
-- Name: fn_parse_floor_to_int(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_parse_floor_to_int(floor_text text) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
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


--
-- Name: fn_parse_roc_to_date(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_parse_roc_to_date(roc_date_text text) RETURNS date
    LANGUAGE plpgsql IMMUTABLE
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


--
-- Name: get_transaction_by_serial(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_transaction_by_serial(serial_number_param character varying) RETURNS json
    LANGUAGE plpgsql
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


--
-- Name: get_transaction_details(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_transaction_details(transaction_id_param bigint) RETURNS json
    LANGUAGE plpgsql
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


--
-- Name: learn_all_project_patterns(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.learn_all_project_patterns() RETURNS TABLE(project_name text, pattern_learned text, confidence numeric)
    LANGUAGE plpgsql
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


--
-- Name: learn_all_project_patterns_v2(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.learn_all_project_patterns_v2() RETURNS TABLE(p_project_name text, p_rule_type text, p_confidence numeric, p_details text)
    LANGUAGE plpgsql
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


--
-- Name: perform_analysis(text, text, text, text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.perform_analysis(p_county_code text, p_group_by_column text, p_metric_column text, p_building_type text DEFAULT NULL::text, p_project_names text[] DEFAULT NULL::text[]) RETURNS TABLE(group_key text, metric_value numeric)
    LANGUAGE plpgsql
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


--
-- Name: refresh_all_transactions_view(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_all_transactions_view() RETURNS void
    LANGUAGE plpgsql
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


--
-- Name: search_project_names(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.search_project_names(county_code text, search_query text) RETURNS TABLE("建案名稱" text, similarity_score real)
    LANGUAGE plpgsql
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


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: a_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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
    "戶別." text
);


--
-- Name: a_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: a_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_a_build_id_seq OWNED BY public.a_lvr_land_a_build.id;


--
-- Name: a_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: a_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_a_land_id_seq OWNED BY public.a_lvr_land_a_land.id;


--
-- Name: a_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: a_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_a_park_id_seq OWNED BY public.a_lvr_land_a_park.id;


--
-- Name: a_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: a_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: a_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_b_land_id_seq OWNED BY public.a_lvr_land_b_land.id;


--
-- Name: a_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: a_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_b_park_id_seq OWNED BY public.a_lvr_land_b_park.id;


--
-- Name: a_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: a_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: a_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_c_build_id_seq OWNED BY public.a_lvr_land_c_build.id;


--
-- Name: a_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: a_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_c_land_id_seq OWNED BY public.a_lvr_land_c_land.id;


--
-- Name: a_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.a_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: a_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.a_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: a_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.a_lvr_land_c_park_id_seq OWNED BY public.a_lvr_land_c_park.id;


--
-- Name: b_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: b_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: b_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: c_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: c_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: c_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: d_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: d_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: d_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: e_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: e_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: e_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: f_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: f_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: f_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: g_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: g_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: g_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: h_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: h_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: h_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: i_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: i_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: i_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: j_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: j_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: j_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: k_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: k_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: k_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: m_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: m_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: m_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: n_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: n_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: n_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: o_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: o_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: o_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: p_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: p_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: p_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: q_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: q_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: q_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: t_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: t_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: t_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: u_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: u_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: u_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: v_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: v_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: v_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: w_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: w_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: w_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: x_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: x_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: x_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: z_lvr_land_a; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_a (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
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


--
-- Name: z_lvr_land_b; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_b (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "產權面積_房車" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "建案名稱" text,
    "戶別" text,
    "解約情形" text,
    "總樓層" character varying(50),
    "車位數" integer,
    "車位面積(坪)" numeric(10,2),
    "房屋面積(坪)" numeric(10,2),
    "交易總價(萬)" bigint,
    "房屋總價(萬)" bigint,
    "車位總價(萬)" bigint,
    "房屋單價(萬)" numeric(12,2)
);


--
-- Name: z_lvr_land_c; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_c (
    "編號" character varying(50) NOT NULL,
    "行政區" character varying(50),
    "交易標的" text,
    "地址" text,
    "交易日" date,
    "交易筆棟數" text,
    "樓層" text,
    "建物型態" text,
    "主要用途" text,
    "租賃面積" numeric(10,2),
    "房數" integer,
    "廳數" integer,
    "衛浴數" integer,
    "交易總價" bigint,
    "車位類別" text,
    "車位總面積" numeric(8,2),
    "車位總價" bigint,
    "備註" text,
    "出租型態" text,
    "租賃期間" text,
    "附屬設備" text,
    "租賃住宅服務" text,
    "車位數" integer,
    "租賃房屋面積(坪)" numeric(10,2),
    "起租日" date,
    "租賃期(月)" integer
);


--
-- Name: all_transactions_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.all_transactions_view AS
 SELECT 'A'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    a_lvr_land_a."編號",
    a_lvr_land_a."行政區",
    a_lvr_land_a."交易標的",
    a_lvr_land_a."地址",
    a_lvr_land_a."交易日" AS "交易日期",
    a_lvr_land_a."建物型態",
    a_lvr_land_a."主要用途",
    a_lvr_land_a."產權面積_房車" AS "建物面積",
    a_lvr_land_a."房數",
    a_lvr_land_a."廳數",
    a_lvr_land_a."衛浴數",
    a_lvr_land_a."交易總價" AS "總價",
    a_lvr_land_a."車位類別",
    a_lvr_land_a."車位總價"
   FROM public.a_lvr_land_a
UNION ALL
 SELECT 'A'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    a_lvr_land_b."編號",
    a_lvr_land_b."行政區",
    a_lvr_land_b."交易標的",
    a_lvr_land_b."地址",
    a_lvr_land_b."交易日" AS "交易日期",
    a_lvr_land_b."建物型態",
    a_lvr_land_b."主要用途",
    a_lvr_land_b."產權面積_房車" AS "建物面積",
    a_lvr_land_b."房數",
    a_lvr_land_b."廳數",
    a_lvr_land_b."衛浴數",
    a_lvr_land_b."交易總價" AS "總價",
    a_lvr_land_b."車位類別",
    a_lvr_land_b."車位總價"
   FROM public.a_lvr_land_b
UNION ALL
 SELECT 'A'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    a_lvr_land_c."編號",
    a_lvr_land_c."行政區",
    a_lvr_land_c."交易標的",
    a_lvr_land_c."地址",
    a_lvr_land_c."交易日" AS "交易日期",
    a_lvr_land_c."建物型態",
    a_lvr_land_c."主要用途",
    a_lvr_land_c."租賃面積" AS "建物面積",
    a_lvr_land_c."房數",
    a_lvr_land_c."廳數",
    a_lvr_land_c."衛浴數",
    a_lvr_land_c."交易總價" AS "總價",
    a_lvr_land_c."車位類別",
    a_lvr_land_c."車位總價"
   FROM public.a_lvr_land_c
UNION ALL
 SELECT 'B'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    b_lvr_land_a."編號",
    b_lvr_land_a."行政區",
    b_lvr_land_a."交易標的",
    b_lvr_land_a."地址",
    b_lvr_land_a."交易日" AS "交易日期",
    b_lvr_land_a."建物型態",
    b_lvr_land_a."主要用途",
    b_lvr_land_a."產權面積_房車" AS "建物面積",
    b_lvr_land_a."房數",
    b_lvr_land_a."廳數",
    b_lvr_land_a."衛浴數",
    b_lvr_land_a."交易總價" AS "總價",
    b_lvr_land_a."車位類別",
    b_lvr_land_a."車位總價"
   FROM public.b_lvr_land_a
UNION ALL
 SELECT 'B'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    b_lvr_land_b."編號",
    b_lvr_land_b."行政區",
    b_lvr_land_b."交易標的",
    b_lvr_land_b."地址",
    b_lvr_land_b."交易日" AS "交易日期",
    b_lvr_land_b."建物型態",
    b_lvr_land_b."主要用途",
    b_lvr_land_b."產權面積_房車" AS "建物面積",
    b_lvr_land_b."房數",
    b_lvr_land_b."廳數",
    b_lvr_land_b."衛浴數",
    b_lvr_land_b."交易總價" AS "總價",
    b_lvr_land_b."車位類別",
    b_lvr_land_b."車位總價"
   FROM public.b_lvr_land_b
UNION ALL
 SELECT 'B'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    b_lvr_land_c."編號",
    b_lvr_land_c."行政區",
    b_lvr_land_c."交易標的",
    b_lvr_land_c."地址",
    b_lvr_land_c."交易日" AS "交易日期",
    b_lvr_land_c."建物型態",
    b_lvr_land_c."主要用途",
    b_lvr_land_c."租賃面積" AS "建物面積",
    b_lvr_land_c."房數",
    b_lvr_land_c."廳數",
    b_lvr_land_c."衛浴數",
    b_lvr_land_c."交易總價" AS "總價",
    b_lvr_land_c."車位類別",
    b_lvr_land_c."車位總價"
   FROM public.b_lvr_land_c
UNION ALL
 SELECT 'C'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    c_lvr_land_a."編號",
    c_lvr_land_a."行政區",
    c_lvr_land_a."交易標的",
    c_lvr_land_a."地址",
    c_lvr_land_a."交易日" AS "交易日期",
    c_lvr_land_a."建物型態",
    c_lvr_land_a."主要用途",
    c_lvr_land_a."產權面積_房車" AS "建物面積",
    c_lvr_land_a."房數",
    c_lvr_land_a."廳數",
    c_lvr_land_a."衛浴數",
    c_lvr_land_a."交易總價" AS "總價",
    c_lvr_land_a."車位類別",
    c_lvr_land_a."車位總價"
   FROM public.c_lvr_land_a
UNION ALL
 SELECT 'C'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    c_lvr_land_b."編號",
    c_lvr_land_b."行政區",
    c_lvr_land_b."交易標的",
    c_lvr_land_b."地址",
    c_lvr_land_b."交易日" AS "交易日期",
    c_lvr_land_b."建物型態",
    c_lvr_land_b."主要用途",
    c_lvr_land_b."產權面積_房車" AS "建物面積",
    c_lvr_land_b."房數",
    c_lvr_land_b."廳數",
    c_lvr_land_b."衛浴數",
    c_lvr_land_b."交易總價" AS "總價",
    c_lvr_land_b."車位類別",
    c_lvr_land_b."車位總價"
   FROM public.c_lvr_land_b
UNION ALL
 SELECT 'C'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    c_lvr_land_c."編號",
    c_lvr_land_c."行政區",
    c_lvr_land_c."交易標的",
    c_lvr_land_c."地址",
    c_lvr_land_c."交易日" AS "交易日期",
    c_lvr_land_c."建物型態",
    c_lvr_land_c."主要用途",
    c_lvr_land_c."租賃面積" AS "建物面積",
    c_lvr_land_c."房數",
    c_lvr_land_c."廳數",
    c_lvr_land_c."衛浴數",
    c_lvr_land_c."交易總價" AS "總價",
    c_lvr_land_c."車位類別",
    c_lvr_land_c."車位總價"
   FROM public.c_lvr_land_c
UNION ALL
 SELECT 'D'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    d_lvr_land_a."編號",
    d_lvr_land_a."行政區",
    d_lvr_land_a."交易標的",
    d_lvr_land_a."地址",
    d_lvr_land_a."交易日" AS "交易日期",
    d_lvr_land_a."建物型態",
    d_lvr_land_a."主要用途",
    d_lvr_land_a."產權面積_房車" AS "建物面積",
    d_lvr_land_a."房數",
    d_lvr_land_a."廳數",
    d_lvr_land_a."衛浴數",
    d_lvr_land_a."交易總價" AS "總價",
    d_lvr_land_a."車位類別",
    d_lvr_land_a."車位總價"
   FROM public.d_lvr_land_a
UNION ALL
 SELECT 'D'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    d_lvr_land_b."編號",
    d_lvr_land_b."行政區",
    d_lvr_land_b."交易標的",
    d_lvr_land_b."地址",
    d_lvr_land_b."交易日" AS "交易日期",
    d_lvr_land_b."建物型態",
    d_lvr_land_b."主要用途",
    d_lvr_land_b."產權面積_房車" AS "建物面積",
    d_lvr_land_b."房數",
    d_lvr_land_b."廳數",
    d_lvr_land_b."衛浴數",
    d_lvr_land_b."交易總價" AS "總價",
    d_lvr_land_b."車位類別",
    d_lvr_land_b."車位總價"
   FROM public.d_lvr_land_b
UNION ALL
 SELECT 'D'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    d_lvr_land_c."編號",
    d_lvr_land_c."行政區",
    d_lvr_land_c."交易標的",
    d_lvr_land_c."地址",
    d_lvr_land_c."交易日" AS "交易日期",
    d_lvr_land_c."建物型態",
    d_lvr_land_c."主要用途",
    d_lvr_land_c."租賃面積" AS "建物面積",
    d_lvr_land_c."房數",
    d_lvr_land_c."廳數",
    d_lvr_land_c."衛浴數",
    d_lvr_land_c."交易總價" AS "總價",
    d_lvr_land_c."車位類別",
    d_lvr_land_c."車位總價"
   FROM public.d_lvr_land_c
UNION ALL
 SELECT 'E'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    e_lvr_land_a."編號",
    e_lvr_land_a."行政區",
    e_lvr_land_a."交易標的",
    e_lvr_land_a."地址",
    e_lvr_land_a."交易日" AS "交易日期",
    e_lvr_land_a."建物型態",
    e_lvr_land_a."主要用途",
    e_lvr_land_a."產權面積_房車" AS "建物面積",
    e_lvr_land_a."房數",
    e_lvr_land_a."廳數",
    e_lvr_land_a."衛浴數",
    e_lvr_land_a."交易總價" AS "總價",
    e_lvr_land_a."車位類別",
    e_lvr_land_a."車位總價"
   FROM public.e_lvr_land_a
UNION ALL
 SELECT 'E'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    e_lvr_land_b."編號",
    e_lvr_land_b."行政區",
    e_lvr_land_b."交易標的",
    e_lvr_land_b."地址",
    e_lvr_land_b."交易日" AS "交易日期",
    e_lvr_land_b."建物型態",
    e_lvr_land_b."主要用途",
    e_lvr_land_b."產權面積_房車" AS "建物面積",
    e_lvr_land_b."房數",
    e_lvr_land_b."廳數",
    e_lvr_land_b."衛浴數",
    e_lvr_land_b."交易總價" AS "總價",
    e_lvr_land_b."車位類別",
    e_lvr_land_b."車位總價"
   FROM public.e_lvr_land_b
UNION ALL
 SELECT 'E'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    e_lvr_land_c."編號",
    e_lvr_land_c."行政區",
    e_lvr_land_c."交易標的",
    e_lvr_land_c."地址",
    e_lvr_land_c."交易日" AS "交易日期",
    e_lvr_land_c."建物型態",
    e_lvr_land_c."主要用途",
    e_lvr_land_c."租賃面積" AS "建物面積",
    e_lvr_land_c."房數",
    e_lvr_land_c."廳數",
    e_lvr_land_c."衛浴數",
    e_lvr_land_c."交易總價" AS "總價",
    e_lvr_land_c."車位類別",
    e_lvr_land_c."車位總價"
   FROM public.e_lvr_land_c
UNION ALL
 SELECT 'F'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    f_lvr_land_a."編號",
    f_lvr_land_a."行政區",
    f_lvr_land_a."交易標的",
    f_lvr_land_a."地址",
    f_lvr_land_a."交易日" AS "交易日期",
    f_lvr_land_a."建物型態",
    f_lvr_land_a."主要用途",
    f_lvr_land_a."產權面積_房車" AS "建物面積",
    f_lvr_land_a."房數",
    f_lvr_land_a."廳數",
    f_lvr_land_a."衛浴數",
    f_lvr_land_a."交易總價" AS "總價",
    f_lvr_land_a."車位類別",
    f_lvr_land_a."車位總價"
   FROM public.f_lvr_land_a
UNION ALL
 SELECT 'F'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    f_lvr_land_b."編號",
    f_lvr_land_b."行政區",
    f_lvr_land_b."交易標的",
    f_lvr_land_b."地址",
    f_lvr_land_b."交易日" AS "交易日期",
    f_lvr_land_b."建物型態",
    f_lvr_land_b."主要用途",
    f_lvr_land_b."產權面積_房車" AS "建物面積",
    f_lvr_land_b."房數",
    f_lvr_land_b."廳數",
    f_lvr_land_b."衛浴數",
    f_lvr_land_b."交易總價" AS "總價",
    f_lvr_land_b."車位類別",
    f_lvr_land_b."車位總價"
   FROM public.f_lvr_land_b
UNION ALL
 SELECT 'F'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    f_lvr_land_c."編號",
    f_lvr_land_c."行政區",
    f_lvr_land_c."交易標的",
    f_lvr_land_c."地址",
    f_lvr_land_c."交易日" AS "交易日期",
    f_lvr_land_c."建物型態",
    f_lvr_land_c."主要用途",
    f_lvr_land_c."租賃面積" AS "建物面積",
    f_lvr_land_c."房數",
    f_lvr_land_c."廳數",
    f_lvr_land_c."衛浴數",
    f_lvr_land_c."交易總價" AS "總價",
    f_lvr_land_c."車位類別",
    f_lvr_land_c."車位總價"
   FROM public.f_lvr_land_c
UNION ALL
 SELECT 'G'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    g_lvr_land_a."編號",
    g_lvr_land_a."行政區",
    g_lvr_land_a."交易標的",
    g_lvr_land_a."地址",
    g_lvr_land_a."交易日" AS "交易日期",
    g_lvr_land_a."建物型態",
    g_lvr_land_a."主要用途",
    g_lvr_land_a."產權面積_房車" AS "建物面積",
    g_lvr_land_a."房數",
    g_lvr_land_a."廳數",
    g_lvr_land_a."衛浴數",
    g_lvr_land_a."交易總價" AS "總價",
    g_lvr_land_a."車位類別",
    g_lvr_land_a."車位總價"
   FROM public.g_lvr_land_a
UNION ALL
 SELECT 'G'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    g_lvr_land_b."編號",
    g_lvr_land_b."行政區",
    g_lvr_land_b."交易標的",
    g_lvr_land_b."地址",
    g_lvr_land_b."交易日" AS "交易日期",
    g_lvr_land_b."建物型態",
    g_lvr_land_b."主要用途",
    g_lvr_land_b."產權面積_房車" AS "建物面積",
    g_lvr_land_b."房數",
    g_lvr_land_b."廳數",
    g_lvr_land_b."衛浴數",
    g_lvr_land_b."交易總價" AS "總價",
    g_lvr_land_b."車位類別",
    g_lvr_land_b."車位總價"
   FROM public.g_lvr_land_b
UNION ALL
 SELECT 'G'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    g_lvr_land_c."編號",
    g_lvr_land_c."行政區",
    g_lvr_land_c."交易標的",
    g_lvr_land_c."地址",
    g_lvr_land_c."交易日" AS "交易日期",
    g_lvr_land_c."建物型態",
    g_lvr_land_c."主要用途",
    g_lvr_land_c."租賃面積" AS "建物面積",
    g_lvr_land_c."房數",
    g_lvr_land_c."廳數",
    g_lvr_land_c."衛浴數",
    g_lvr_land_c."交易總價" AS "總價",
    g_lvr_land_c."車位類別",
    g_lvr_land_c."車位總價"
   FROM public.g_lvr_land_c
UNION ALL
 SELECT 'H'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    h_lvr_land_a."編號",
    h_lvr_land_a."行政區",
    h_lvr_land_a."交易標的",
    h_lvr_land_a."地址",
    h_lvr_land_a."交易日" AS "交易日期",
    h_lvr_land_a."建物型態",
    h_lvr_land_a."主要用途",
    h_lvr_land_a."產權面積_房車" AS "建物面積",
    h_lvr_land_a."房數",
    h_lvr_land_a."廳數",
    h_lvr_land_a."衛浴數",
    h_lvr_land_a."交易總價" AS "總價",
    h_lvr_land_a."車位類別",
    h_lvr_land_a."車位總價"
   FROM public.h_lvr_land_a
UNION ALL
 SELECT 'H'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    h_lvr_land_b."編號",
    h_lvr_land_b."行政區",
    h_lvr_land_b."交易標的",
    h_lvr_land_b."地址",
    h_lvr_land_b."交易日" AS "交易日期",
    h_lvr_land_b."建物型態",
    h_lvr_land_b."主要用途",
    h_lvr_land_b."產權面積_房車" AS "建物面積",
    h_lvr_land_b."房數",
    h_lvr_land_b."廳數",
    h_lvr_land_b."衛浴數",
    h_lvr_land_b."交易總價" AS "總價",
    h_lvr_land_b."車位類別",
    h_lvr_land_b."車位總價"
   FROM public.h_lvr_land_b
UNION ALL
 SELECT 'H'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    h_lvr_land_c."編號",
    h_lvr_land_c."行政區",
    h_lvr_land_c."交易標的",
    h_lvr_land_c."地址",
    h_lvr_land_c."交易日" AS "交易日期",
    h_lvr_land_c."建物型態",
    h_lvr_land_c."主要用途",
    h_lvr_land_c."租賃面積" AS "建物面積",
    h_lvr_land_c."房數",
    h_lvr_land_c."廳數",
    h_lvr_land_c."衛浴數",
    h_lvr_land_c."交易總價" AS "總價",
    h_lvr_land_c."車位類別",
    h_lvr_land_c."車位總價"
   FROM public.h_lvr_land_c
UNION ALL
 SELECT 'I'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    i_lvr_land_a."編號",
    i_lvr_land_a."行政區",
    i_lvr_land_a."交易標的",
    i_lvr_land_a."地址",
    i_lvr_land_a."交易日" AS "交易日期",
    i_lvr_land_a."建物型態",
    i_lvr_land_a."主要用途",
    i_lvr_land_a."產權面積_房車" AS "建物面積",
    i_lvr_land_a."房數",
    i_lvr_land_a."廳數",
    i_lvr_land_a."衛浴數",
    i_lvr_land_a."交易總價" AS "總價",
    i_lvr_land_a."車位類別",
    i_lvr_land_a."車位總價"
   FROM public.i_lvr_land_a
UNION ALL
 SELECT 'I'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    i_lvr_land_b."編號",
    i_lvr_land_b."行政區",
    i_lvr_land_b."交易標的",
    i_lvr_land_b."地址",
    i_lvr_land_b."交易日" AS "交易日期",
    i_lvr_land_b."建物型態",
    i_lvr_land_b."主要用途",
    i_lvr_land_b."產權面積_房車" AS "建物面積",
    i_lvr_land_b."房數",
    i_lvr_land_b."廳數",
    i_lvr_land_b."衛浴數",
    i_lvr_land_b."交易總價" AS "總價",
    i_lvr_land_b."車位類別",
    i_lvr_land_b."車位總價"
   FROM public.i_lvr_land_b
UNION ALL
 SELECT 'I'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    i_lvr_land_c."編號",
    i_lvr_land_c."行政區",
    i_lvr_land_c."交易標的",
    i_lvr_land_c."地址",
    i_lvr_land_c."交易日" AS "交易日期",
    i_lvr_land_c."建物型態",
    i_lvr_land_c."主要用途",
    i_lvr_land_c."租賃面積" AS "建物面積",
    i_lvr_land_c."房數",
    i_lvr_land_c."廳數",
    i_lvr_land_c."衛浴數",
    i_lvr_land_c."交易總價" AS "總價",
    i_lvr_land_c."車位類別",
    i_lvr_land_c."車位總價"
   FROM public.i_lvr_land_c
UNION ALL
 SELECT 'J'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    j_lvr_land_a."編號",
    j_lvr_land_a."行政區",
    j_lvr_land_a."交易標的",
    j_lvr_land_a."地址",
    j_lvr_land_a."交易日" AS "交易日期",
    j_lvr_land_a."建物型態",
    j_lvr_land_a."主要用途",
    j_lvr_land_a."產權面積_房車" AS "建物面積",
    j_lvr_land_a."房數",
    j_lvr_land_a."廳數",
    j_lvr_land_a."衛浴數",
    j_lvr_land_a."交易總價" AS "總價",
    j_lvr_land_a."車位類別",
    j_lvr_land_a."車位總價"
   FROM public.j_lvr_land_a
UNION ALL
 SELECT 'J'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    j_lvr_land_b."編號",
    j_lvr_land_b."行政區",
    j_lvr_land_b."交易標的",
    j_lvr_land_b."地址",
    j_lvr_land_b."交易日" AS "交易日期",
    j_lvr_land_b."建物型態",
    j_lvr_land_b."主要用途",
    j_lvr_land_b."產權面積_房車" AS "建物面積",
    j_lvr_land_b."房數",
    j_lvr_land_b."廳數",
    j_lvr_land_b."衛浴數",
    j_lvr_land_b."交易總價" AS "總價",
    j_lvr_land_b."車位類別",
    j_lvr_land_b."車位總價"
   FROM public.j_lvr_land_b
UNION ALL
 SELECT 'J'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    j_lvr_land_c."編號",
    j_lvr_land_c."行政區",
    j_lvr_land_c."交易標的",
    j_lvr_land_c."地址",
    j_lvr_land_c."交易日" AS "交易日期",
    j_lvr_land_c."建物型態",
    j_lvr_land_c."主要用途",
    j_lvr_land_c."租賃面積" AS "建物面積",
    j_lvr_land_c."房數",
    j_lvr_land_c."廳數",
    j_lvr_land_c."衛浴數",
    j_lvr_land_c."交易總價" AS "總價",
    j_lvr_land_c."車位類別",
    j_lvr_land_c."車位總價"
   FROM public.j_lvr_land_c
UNION ALL
 SELECT 'K'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    k_lvr_land_a."編號",
    k_lvr_land_a."行政區",
    k_lvr_land_a."交易標的",
    k_lvr_land_a."地址",
    k_lvr_land_a."交易日" AS "交易日期",
    k_lvr_land_a."建物型態",
    k_lvr_land_a."主要用途",
    k_lvr_land_a."產權面積_房車" AS "建物面積",
    k_lvr_land_a."房數",
    k_lvr_land_a."廳數",
    k_lvr_land_a."衛浴數",
    k_lvr_land_a."交易總價" AS "總價",
    k_lvr_land_a."車位類別",
    k_lvr_land_a."車位總價"
   FROM public.k_lvr_land_a
UNION ALL
 SELECT 'K'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    k_lvr_land_b."編號",
    k_lvr_land_b."行政區",
    k_lvr_land_b."交易標的",
    k_lvr_land_b."地址",
    k_lvr_land_b."交易日" AS "交易日期",
    k_lvr_land_b."建物型態",
    k_lvr_land_b."主要用途",
    k_lvr_land_b."產權面積_房車" AS "建物面積",
    k_lvr_land_b."房數",
    k_lvr_land_b."廳數",
    k_lvr_land_b."衛浴數",
    k_lvr_land_b."交易總價" AS "總價",
    k_lvr_land_b."車位類別",
    k_lvr_land_b."車位總價"
   FROM public.k_lvr_land_b
UNION ALL
 SELECT 'K'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    k_lvr_land_c."編號",
    k_lvr_land_c."行政區",
    k_lvr_land_c."交易標的",
    k_lvr_land_c."地址",
    k_lvr_land_c."交易日" AS "交易日期",
    k_lvr_land_c."建物型態",
    k_lvr_land_c."主要用途",
    k_lvr_land_c."租賃面積" AS "建物面積",
    k_lvr_land_c."房數",
    k_lvr_land_c."廳數",
    k_lvr_land_c."衛浴數",
    k_lvr_land_c."交易總價" AS "總價",
    k_lvr_land_c."車位類別",
    k_lvr_land_c."車位總價"
   FROM public.k_lvr_land_c
UNION ALL
 SELECT 'M'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    m_lvr_land_a."編號",
    m_lvr_land_a."行政區",
    m_lvr_land_a."交易標的",
    m_lvr_land_a."地址",
    m_lvr_land_a."交易日" AS "交易日期",
    m_lvr_land_a."建物型態",
    m_lvr_land_a."主要用途",
    m_lvr_land_a."產權面積_房車" AS "建物面積",
    m_lvr_land_a."房數",
    m_lvr_land_a."廳數",
    m_lvr_land_a."衛浴數",
    m_lvr_land_a."交易總價" AS "總價",
    m_lvr_land_a."車位類別",
    m_lvr_land_a."車位總價"
   FROM public.m_lvr_land_a
UNION ALL
 SELECT 'M'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    m_lvr_land_b."編號",
    m_lvr_land_b."行政區",
    m_lvr_land_b."交易標的",
    m_lvr_land_b."地址",
    m_lvr_land_b."交易日" AS "交易日期",
    m_lvr_land_b."建物型態",
    m_lvr_land_b."主要用途",
    m_lvr_land_b."產權面積_房車" AS "建物面積",
    m_lvr_land_b."房數",
    m_lvr_land_b."廳數",
    m_lvr_land_b."衛浴數",
    m_lvr_land_b."交易總價" AS "總價",
    m_lvr_land_b."車位類別",
    m_lvr_land_b."車位總價"
   FROM public.m_lvr_land_b
UNION ALL
 SELECT 'M'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    m_lvr_land_c."編號",
    m_lvr_land_c."行政區",
    m_lvr_land_c."交易標的",
    m_lvr_land_c."地址",
    m_lvr_land_c."交易日" AS "交易日期",
    m_lvr_land_c."建物型態",
    m_lvr_land_c."主要用途",
    m_lvr_land_c."租賃面積" AS "建物面積",
    m_lvr_land_c."房數",
    m_lvr_land_c."廳數",
    m_lvr_land_c."衛浴數",
    m_lvr_land_c."交易總價" AS "總價",
    m_lvr_land_c."車位類別",
    m_lvr_land_c."車位總價"
   FROM public.m_lvr_land_c
UNION ALL
 SELECT 'N'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    n_lvr_land_a."編號",
    n_lvr_land_a."行政區",
    n_lvr_land_a."交易標的",
    n_lvr_land_a."地址",
    n_lvr_land_a."交易日" AS "交易日期",
    n_lvr_land_a."建物型態",
    n_lvr_land_a."主要用途",
    n_lvr_land_a."產權面積_房車" AS "建物面積",
    n_lvr_land_a."房數",
    n_lvr_land_a."廳數",
    n_lvr_land_a."衛浴數",
    n_lvr_land_a."交易總價" AS "總價",
    n_lvr_land_a."車位類別",
    n_lvr_land_a."車位總價"
   FROM public.n_lvr_land_a
UNION ALL
 SELECT 'N'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    n_lvr_land_b."編號",
    n_lvr_land_b."行政區",
    n_lvr_land_b."交易標的",
    n_lvr_land_b."地址",
    n_lvr_land_b."交易日" AS "交易日期",
    n_lvr_land_b."建物型態",
    n_lvr_land_b."主要用途",
    n_lvr_land_b."產權面積_房車" AS "建物面積",
    n_lvr_land_b."房數",
    n_lvr_land_b."廳數",
    n_lvr_land_b."衛浴數",
    n_lvr_land_b."交易總價" AS "總價",
    n_lvr_land_b."車位類別",
    n_lvr_land_b."車位總價"
   FROM public.n_lvr_land_b
UNION ALL
 SELECT 'N'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    n_lvr_land_c."編號",
    n_lvr_land_c."行政區",
    n_lvr_land_c."交易標的",
    n_lvr_land_c."地址",
    n_lvr_land_c."交易日" AS "交易日期",
    n_lvr_land_c."建物型態",
    n_lvr_land_c."主要用途",
    n_lvr_land_c."租賃面積" AS "建物面積",
    n_lvr_land_c."房數",
    n_lvr_land_c."廳數",
    n_lvr_land_c."衛浴數",
    n_lvr_land_c."交易總價" AS "總價",
    n_lvr_land_c."車位類別",
    n_lvr_land_c."車位總價"
   FROM public.n_lvr_land_c
UNION ALL
 SELECT 'O'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    o_lvr_land_a."編號",
    o_lvr_land_a."行政區",
    o_lvr_land_a."交易標的",
    o_lvr_land_a."地址",
    o_lvr_land_a."交易日" AS "交易日期",
    o_lvr_land_a."建物型態",
    o_lvr_land_a."主要用途",
    o_lvr_land_a."產權面積_房車" AS "建物面積",
    o_lvr_land_a."房數",
    o_lvr_land_a."廳數",
    o_lvr_land_a."衛浴數",
    o_lvr_land_a."交易總價" AS "總價",
    o_lvr_land_a."車位類別",
    o_lvr_land_a."車位總價"
   FROM public.o_lvr_land_a
UNION ALL
 SELECT 'O'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    o_lvr_land_b."編號",
    o_lvr_land_b."行政區",
    o_lvr_land_b."交易標的",
    o_lvr_land_b."地址",
    o_lvr_land_b."交易日" AS "交易日期",
    o_lvr_land_b."建物型態",
    o_lvr_land_b."主要用途",
    o_lvr_land_b."產權面積_房車" AS "建物面積",
    o_lvr_land_b."房數",
    o_lvr_land_b."廳數",
    o_lvr_land_b."衛浴數",
    o_lvr_land_b."交易總價" AS "總價",
    o_lvr_land_b."車位類別",
    o_lvr_land_b."車位總價"
   FROM public.o_lvr_land_b
UNION ALL
 SELECT 'O'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    o_lvr_land_c."編號",
    o_lvr_land_c."行政區",
    o_lvr_land_c."交易標的",
    o_lvr_land_c."地址",
    o_lvr_land_c."交易日" AS "交易日期",
    o_lvr_land_c."建物型態",
    o_lvr_land_c."主要用途",
    o_lvr_land_c."租賃面積" AS "建物面積",
    o_lvr_land_c."房數",
    o_lvr_land_c."廳數",
    o_lvr_land_c."衛浴數",
    o_lvr_land_c."交易總價" AS "總價",
    o_lvr_land_c."車位類別",
    o_lvr_land_c."車位總價"
   FROM public.o_lvr_land_c
UNION ALL
 SELECT 'P'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    p_lvr_land_a."編號",
    p_lvr_land_a."行政區",
    p_lvr_land_a."交易標的",
    p_lvr_land_a."地址",
    p_lvr_land_a."交易日" AS "交易日期",
    p_lvr_land_a."建物型態",
    p_lvr_land_a."主要用途",
    p_lvr_land_a."產權面積_房車" AS "建物面積",
    p_lvr_land_a."房數",
    p_lvr_land_a."廳數",
    p_lvr_land_a."衛浴數",
    p_lvr_land_a."交易總價" AS "總價",
    p_lvr_land_a."車位類別",
    p_lvr_land_a."車位總價"
   FROM public.p_lvr_land_a
UNION ALL
 SELECT 'P'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    p_lvr_land_b."編號",
    p_lvr_land_b."行政區",
    p_lvr_land_b."交易標的",
    p_lvr_land_b."地址",
    p_lvr_land_b."交易日" AS "交易日期",
    p_lvr_land_b."建物型態",
    p_lvr_land_b."主要用途",
    p_lvr_land_b."產權面積_房車" AS "建物面積",
    p_lvr_land_b."房數",
    p_lvr_land_b."廳數",
    p_lvr_land_b."衛浴數",
    p_lvr_land_b."交易總價" AS "總價",
    p_lvr_land_b."車位類別",
    p_lvr_land_b."車位總價"
   FROM public.p_lvr_land_b
UNION ALL
 SELECT 'P'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    p_lvr_land_c."編號",
    p_lvr_land_c."行政區",
    p_lvr_land_c."交易標的",
    p_lvr_land_c."地址",
    p_lvr_land_c."交易日" AS "交易日期",
    p_lvr_land_c."建物型態",
    p_lvr_land_c."主要用途",
    p_lvr_land_c."租賃面積" AS "建物面積",
    p_lvr_land_c."房數",
    p_lvr_land_c."廳數",
    p_lvr_land_c."衛浴數",
    p_lvr_land_c."交易總價" AS "總價",
    p_lvr_land_c."車位類別",
    p_lvr_land_c."車位總價"
   FROM public.p_lvr_land_c
UNION ALL
 SELECT 'Q'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    q_lvr_land_a."編號",
    q_lvr_land_a."行政區",
    q_lvr_land_a."交易標的",
    q_lvr_land_a."地址",
    q_lvr_land_a."交易日" AS "交易日期",
    q_lvr_land_a."建物型態",
    q_lvr_land_a."主要用途",
    q_lvr_land_a."產權面積_房車" AS "建物面積",
    q_lvr_land_a."房數",
    q_lvr_land_a."廳數",
    q_lvr_land_a."衛浴數",
    q_lvr_land_a."交易總價" AS "總價",
    q_lvr_land_a."車位類別",
    q_lvr_land_a."車位總價"
   FROM public.q_lvr_land_a
UNION ALL
 SELECT 'Q'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    q_lvr_land_b."編號",
    q_lvr_land_b."行政區",
    q_lvr_land_b."交易標的",
    q_lvr_land_b."地址",
    q_lvr_land_b."交易日" AS "交易日期",
    q_lvr_land_b."建物型態",
    q_lvr_land_b."主要用途",
    q_lvr_land_b."產權面積_房車" AS "建物面積",
    q_lvr_land_b."房數",
    q_lvr_land_b."廳數",
    q_lvr_land_b."衛浴數",
    q_lvr_land_b."交易總價" AS "總價",
    q_lvr_land_b."車位類別",
    q_lvr_land_b."車位總價"
   FROM public.q_lvr_land_b
UNION ALL
 SELECT 'Q'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    q_lvr_land_c."編號",
    q_lvr_land_c."行政區",
    q_lvr_land_c."交易標的",
    q_lvr_land_c."地址",
    q_lvr_land_c."交易日" AS "交易日期",
    q_lvr_land_c."建物型態",
    q_lvr_land_c."主要用途",
    q_lvr_land_c."租賃面積" AS "建物面積",
    q_lvr_land_c."房數",
    q_lvr_land_c."廳數",
    q_lvr_land_c."衛浴數",
    q_lvr_land_c."交易總價" AS "總價",
    q_lvr_land_c."車位類別",
    q_lvr_land_c."車位總價"
   FROM public.q_lvr_land_c
UNION ALL
 SELECT 'T'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    t_lvr_land_a."編號",
    t_lvr_land_a."行政區",
    t_lvr_land_a."交易標的",
    t_lvr_land_a."地址",
    t_lvr_land_a."交易日" AS "交易日期",
    t_lvr_land_a."建物型態",
    t_lvr_land_a."主要用途",
    t_lvr_land_a."產權面積_房車" AS "建物面積",
    t_lvr_land_a."房數",
    t_lvr_land_a."廳數",
    t_lvr_land_a."衛浴數",
    t_lvr_land_a."交易總價" AS "總價",
    t_lvr_land_a."車位類別",
    t_lvr_land_a."車位總價"
   FROM public.t_lvr_land_a
UNION ALL
 SELECT 'T'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    t_lvr_land_b."編號",
    t_lvr_land_b."行政區",
    t_lvr_land_b."交易標的",
    t_lvr_land_b."地址",
    t_lvr_land_b."交易日" AS "交易日期",
    t_lvr_land_b."建物型態",
    t_lvr_land_b."主要用途",
    t_lvr_land_b."產權面積_房車" AS "建物面積",
    t_lvr_land_b."房數",
    t_lvr_land_b."廳數",
    t_lvr_land_b."衛浴數",
    t_lvr_land_b."交易總價" AS "總價",
    t_lvr_land_b."車位類別",
    t_lvr_land_b."車位總價"
   FROM public.t_lvr_land_b
UNION ALL
 SELECT 'T'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    t_lvr_land_c."編號",
    t_lvr_land_c."行政區",
    t_lvr_land_c."交易標的",
    t_lvr_land_c."地址",
    t_lvr_land_c."交易日" AS "交易日期",
    t_lvr_land_c."建物型態",
    t_lvr_land_c."主要用途",
    t_lvr_land_c."租賃面積" AS "建物面積",
    t_lvr_land_c."房數",
    t_lvr_land_c."廳數",
    t_lvr_land_c."衛浴數",
    t_lvr_land_c."交易總價" AS "總價",
    t_lvr_land_c."車位類別",
    t_lvr_land_c."車位總價"
   FROM public.t_lvr_land_c
UNION ALL
 SELECT 'U'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    u_lvr_land_a."編號",
    u_lvr_land_a."行政區",
    u_lvr_land_a."交易標的",
    u_lvr_land_a."地址",
    u_lvr_land_a."交易日" AS "交易日期",
    u_lvr_land_a."建物型態",
    u_lvr_land_a."主要用途",
    u_lvr_land_a."產權面積_房車" AS "建物面積",
    u_lvr_land_a."房數",
    u_lvr_land_a."廳數",
    u_lvr_land_a."衛浴數",
    u_lvr_land_a."交易總價" AS "總價",
    u_lvr_land_a."車位類別",
    u_lvr_land_a."車位總價"
   FROM public.u_lvr_land_a
UNION ALL
 SELECT 'U'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    u_lvr_land_b."編號",
    u_lvr_land_b."行政區",
    u_lvr_land_b."交易標的",
    u_lvr_land_b."地址",
    u_lvr_land_b."交易日" AS "交易日期",
    u_lvr_land_b."建物型態",
    u_lvr_land_b."主要用途",
    u_lvr_land_b."產權面積_房車" AS "建物面積",
    u_lvr_land_b."房數",
    u_lvr_land_b."廳數",
    u_lvr_land_b."衛浴數",
    u_lvr_land_b."交易總價" AS "總價",
    u_lvr_land_b."車位類別",
    u_lvr_land_b."車位總價"
   FROM public.u_lvr_land_b
UNION ALL
 SELECT 'U'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    u_lvr_land_c."編號",
    u_lvr_land_c."行政區",
    u_lvr_land_c."交易標的",
    u_lvr_land_c."地址",
    u_lvr_land_c."交易日" AS "交易日期",
    u_lvr_land_c."建物型態",
    u_lvr_land_c."主要用途",
    u_lvr_land_c."租賃面積" AS "建物面積",
    u_lvr_land_c."房數",
    u_lvr_land_c."廳數",
    u_lvr_land_c."衛浴數",
    u_lvr_land_c."交易總價" AS "總價",
    u_lvr_land_c."車位類別",
    u_lvr_land_c."車位總價"
   FROM public.u_lvr_land_c
UNION ALL
 SELECT 'V'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    v_lvr_land_a."編號",
    v_lvr_land_a."行政區",
    v_lvr_land_a."交易標的",
    v_lvr_land_a."地址",
    v_lvr_land_a."交易日" AS "交易日期",
    v_lvr_land_a."建物型態",
    v_lvr_land_a."主要用途",
    v_lvr_land_a."產權面積_房車" AS "建物面積",
    v_lvr_land_a."房數",
    v_lvr_land_a."廳數",
    v_lvr_land_a."衛浴數",
    v_lvr_land_a."交易總價" AS "總價",
    v_lvr_land_a."車位類別",
    v_lvr_land_a."車位總價"
   FROM public.v_lvr_land_a
UNION ALL
 SELECT 'V'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    v_lvr_land_b."編號",
    v_lvr_land_b."行政區",
    v_lvr_land_b."交易標的",
    v_lvr_land_b."地址",
    v_lvr_land_b."交易日" AS "交易日期",
    v_lvr_land_b."建物型態",
    v_lvr_land_b."主要用途",
    v_lvr_land_b."產權面積_房車" AS "建物面積",
    v_lvr_land_b."房數",
    v_lvr_land_b."廳數",
    v_lvr_land_b."衛浴數",
    v_lvr_land_b."交易總價" AS "總價",
    v_lvr_land_b."車位類別",
    v_lvr_land_b."車位總價"
   FROM public.v_lvr_land_b
UNION ALL
 SELECT 'V'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    v_lvr_land_c."編號",
    v_lvr_land_c."行政區",
    v_lvr_land_c."交易標的",
    v_lvr_land_c."地址",
    v_lvr_land_c."交易日" AS "交易日期",
    v_lvr_land_c."建物型態",
    v_lvr_land_c."主要用途",
    v_lvr_land_c."租賃面積" AS "建物面積",
    v_lvr_land_c."房數",
    v_lvr_land_c."廳數",
    v_lvr_land_c."衛浴數",
    v_lvr_land_c."交易總價" AS "總價",
    v_lvr_land_c."車位類別",
    v_lvr_land_c."車位總價"
   FROM public.v_lvr_land_c
UNION ALL
 SELECT 'W'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    w_lvr_land_a."編號",
    w_lvr_land_a."行政區",
    w_lvr_land_a."交易標的",
    w_lvr_land_a."地址",
    w_lvr_land_a."交易日" AS "交易日期",
    w_lvr_land_a."建物型態",
    w_lvr_land_a."主要用途",
    w_lvr_land_a."產權面積_房車" AS "建物面積",
    w_lvr_land_a."房數",
    w_lvr_land_a."廳數",
    w_lvr_land_a."衛浴數",
    w_lvr_land_a."交易總價" AS "總價",
    w_lvr_land_a."車位類別",
    w_lvr_land_a."車位總價"
   FROM public.w_lvr_land_a
UNION ALL
 SELECT 'W'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    w_lvr_land_b."編號",
    w_lvr_land_b."行政區",
    w_lvr_land_b."交易標的",
    w_lvr_land_b."地址",
    w_lvr_land_b."交易日" AS "交易日期",
    w_lvr_land_b."建物型態",
    w_lvr_land_b."主要用途",
    w_lvr_land_b."產權面積_房車" AS "建物面積",
    w_lvr_land_b."房數",
    w_lvr_land_b."廳數",
    w_lvr_land_b."衛浴數",
    w_lvr_land_b."交易總價" AS "總價",
    w_lvr_land_b."車位類別",
    w_lvr_land_b."車位總價"
   FROM public.w_lvr_land_b
UNION ALL
 SELECT 'W'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    w_lvr_land_c."編號",
    w_lvr_land_c."行政區",
    w_lvr_land_c."交易標的",
    w_lvr_land_c."地址",
    w_lvr_land_c."交易日" AS "交易日期",
    w_lvr_land_c."建物型態",
    w_lvr_land_c."主要用途",
    w_lvr_land_c."租賃面積" AS "建物面積",
    w_lvr_land_c."房數",
    w_lvr_land_c."廳數",
    w_lvr_land_c."衛浴數",
    w_lvr_land_c."交易總價" AS "總價",
    w_lvr_land_c."車位類別",
    w_lvr_land_c."車位總價"
   FROM public.w_lvr_land_c
UNION ALL
 SELECT 'X'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    x_lvr_land_a."編號",
    x_lvr_land_a."行政區",
    x_lvr_land_a."交易標的",
    x_lvr_land_a."地址",
    x_lvr_land_a."交易日" AS "交易日期",
    x_lvr_land_a."建物型態",
    x_lvr_land_a."主要用途",
    x_lvr_land_a."產權面積_房車" AS "建物面積",
    x_lvr_land_a."房數",
    x_lvr_land_a."廳數",
    x_lvr_land_a."衛浴數",
    x_lvr_land_a."交易總價" AS "總價",
    x_lvr_land_a."車位類別",
    x_lvr_land_a."車位總價"
   FROM public.x_lvr_land_a
UNION ALL
 SELECT 'X'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    x_lvr_land_b."編號",
    x_lvr_land_b."行政區",
    x_lvr_land_b."交易標的",
    x_lvr_land_b."地址",
    x_lvr_land_b."交易日" AS "交易日期",
    x_lvr_land_b."建物型態",
    x_lvr_land_b."主要用途",
    x_lvr_land_b."產權面積_房車" AS "建物面積",
    x_lvr_land_b."房數",
    x_lvr_land_b."廳數",
    x_lvr_land_b."衛浴數",
    x_lvr_land_b."交易總價" AS "總價",
    x_lvr_land_b."車位類別",
    x_lvr_land_b."車位總價"
   FROM public.x_lvr_land_b
UNION ALL
 SELECT 'X'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    x_lvr_land_c."編號",
    x_lvr_land_c."行政區",
    x_lvr_land_c."交易標的",
    x_lvr_land_c."地址",
    x_lvr_land_c."交易日" AS "交易日期",
    x_lvr_land_c."建物型態",
    x_lvr_land_c."主要用途",
    x_lvr_land_c."租賃面積" AS "建物面積",
    x_lvr_land_c."房數",
    x_lvr_land_c."廳數",
    x_lvr_land_c."衛浴數",
    x_lvr_land_c."交易總價" AS "總價",
    x_lvr_land_c."車位類別",
    x_lvr_land_c."車位總價"
   FROM public.x_lvr_land_c
UNION ALL
 SELECT 'Z'::text AS "縣市代碼",
    '中古交易'::text AS "交易類型",
    z_lvr_land_a."編號",
    z_lvr_land_a."行政區",
    z_lvr_land_a."交易標的",
    z_lvr_land_a."地址",
    z_lvr_land_a."交易日" AS "交易日期",
    z_lvr_land_a."建物型態",
    z_lvr_land_a."主要用途",
    z_lvr_land_a."產權面積_房車" AS "建物面積",
    z_lvr_land_a."房數",
    z_lvr_land_a."廳數",
    z_lvr_land_a."衛浴數",
    z_lvr_land_a."交易總價" AS "總價",
    z_lvr_land_a."車位類別",
    z_lvr_land_a."車位總價"
   FROM public.z_lvr_land_a
UNION ALL
 SELECT 'Z'::text AS "縣市代碼",
    '預售交易'::text AS "交易類型",
    z_lvr_land_b."編號",
    z_lvr_land_b."行政區",
    z_lvr_land_b."交易標的",
    z_lvr_land_b."地址",
    z_lvr_land_b."交易日" AS "交易日期",
    z_lvr_land_b."建物型態",
    z_lvr_land_b."主要用途",
    z_lvr_land_b."產權面積_房車" AS "建物面積",
    z_lvr_land_b."房數",
    z_lvr_land_b."廳數",
    z_lvr_land_b."衛浴數",
    z_lvr_land_b."交易總價" AS "總價",
    z_lvr_land_b."車位類別",
    z_lvr_land_b."車位總價"
   FROM public.z_lvr_land_b
UNION ALL
 SELECT 'Z'::text AS "縣市代碼",
    '租賃交易'::text AS "交易類型",
    z_lvr_land_c."編號",
    z_lvr_land_c."行政區",
    z_lvr_land_c."交易標的",
    z_lvr_land_c."地址",
    z_lvr_land_c."交易日" AS "交易日期",
    z_lvr_land_c."建物型態",
    z_lvr_land_c."主要用途",
    z_lvr_land_c."租賃面積" AS "建物面積",
    z_lvr_land_c."房數",
    z_lvr_land_c."廳數",
    z_lvr_land_c."衛浴數",
    z_lvr_land_c."交易總價" AS "總價",
    z_lvr_land_c."車位類別",
    z_lvr_land_c."車位總價"
   FROM public.z_lvr_land_c;


--
-- Name: b_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: b_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_a_build_id_seq OWNED BY public.b_lvr_land_a_build.id;


--
-- Name: b_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: b_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_a_land_id_seq OWNED BY public.b_lvr_land_a_land.id;


--
-- Name: b_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: b_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_a_park_id_seq OWNED BY public.b_lvr_land_a_park.id;


--
-- Name: b_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: b_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_b_land_id_seq OWNED BY public.b_lvr_land_b_land.id;


--
-- Name: b_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: b_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_b_park_id_seq OWNED BY public.b_lvr_land_b_park.id;


--
-- Name: b_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: b_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_c_build_id_seq OWNED BY public.b_lvr_land_c_build.id;


--
-- Name: b_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: b_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_c_land_id_seq OWNED BY public.b_lvr_land_c_land.id;


--
-- Name: b_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: b_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b_lvr_land_c_park_id_seq OWNED BY public.b_lvr_land_c_park.id;


--
-- Name: c_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: c_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_a_build_id_seq OWNED BY public.c_lvr_land_a_build.id;


--
-- Name: c_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: c_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_a_land_id_seq OWNED BY public.c_lvr_land_a_land.id;


--
-- Name: c_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: c_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_a_park_id_seq OWNED BY public.c_lvr_land_a_park.id;


--
-- Name: c_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: c_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_b_land_id_seq OWNED BY public.c_lvr_land_b_land.id;


--
-- Name: c_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: c_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_b_park_id_seq OWNED BY public.c_lvr_land_b_park.id;


--
-- Name: c_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: c_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_c_build_id_seq OWNED BY public.c_lvr_land_c_build.id;


--
-- Name: c_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: c_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_c_land_id_seq OWNED BY public.c_lvr_land_c_land.id;


--
-- Name: c_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.c_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: c_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.c_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: c_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.c_lvr_land_c_park_id_seq OWNED BY public.c_lvr_land_c_park.id;


--
-- Name: county_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.county_codes (
    code character(1) NOT NULL,
    name_zh character varying(20) NOT NULL,
    name_en character varying(50) NOT NULL
);


--
-- Name: TABLE county_codes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.county_codes IS '縣市代碼對照表';


--
-- Name: COLUMN county_codes.code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.county_codes.code IS '縣市代碼';


--
-- Name: COLUMN county_codes.name_zh; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.county_codes.name_zh IS '中文縣市名稱';


--
-- Name: COLUMN county_codes.name_en; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.county_codes.name_en IS '英文縣市名稱';


--
-- Name: d_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: d_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_a_build_id_seq OWNED BY public.d_lvr_land_a_build.id;


--
-- Name: d_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: d_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_a_land_id_seq OWNED BY public.d_lvr_land_a_land.id;


--
-- Name: d_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: d_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_a_park_id_seq OWNED BY public.d_lvr_land_a_park.id;


--
-- Name: d_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: d_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_b_land_id_seq OWNED BY public.d_lvr_land_b_land.id;


--
-- Name: d_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: d_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_b_park_id_seq OWNED BY public.d_lvr_land_b_park.id;


--
-- Name: d_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: d_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_c_build_id_seq OWNED BY public.d_lvr_land_c_build.id;


--
-- Name: d_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: d_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_c_land_id_seq OWNED BY public.d_lvr_land_c_land.id;


--
-- Name: d_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.d_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: d_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.d_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: d_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.d_lvr_land_c_park_id_seq OWNED BY public.d_lvr_land_c_park.id;


--
-- Name: e_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: e_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_a_build_id_seq OWNED BY public.e_lvr_land_a_build.id;


--
-- Name: e_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: e_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_a_land_id_seq OWNED BY public.e_lvr_land_a_land.id;


--
-- Name: e_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: e_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_a_park_id_seq OWNED BY public.e_lvr_land_a_park.id;


--
-- Name: e_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: e_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_b_land_id_seq OWNED BY public.e_lvr_land_b_land.id;


--
-- Name: e_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: e_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_b_park_id_seq OWNED BY public.e_lvr_land_b_park.id;


--
-- Name: e_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: e_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_c_build_id_seq OWNED BY public.e_lvr_land_c_build.id;


--
-- Name: e_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: e_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_c_land_id_seq OWNED BY public.e_lvr_land_c_land.id;


--
-- Name: e_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.e_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: e_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.e_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: e_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.e_lvr_land_c_park_id_seq OWNED BY public.e_lvr_land_c_park.id;


--
-- Name: f_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: f_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_a_build_id_seq OWNED BY public.f_lvr_land_a_build.id;


--
-- Name: f_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: f_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_a_land_id_seq OWNED BY public.f_lvr_land_a_land.id;


--
-- Name: f_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: f_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_a_park_id_seq OWNED BY public.f_lvr_land_a_park.id;


--
-- Name: f_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: f_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_b_land_id_seq OWNED BY public.f_lvr_land_b_land.id;


--
-- Name: f_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: f_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_b_park_id_seq OWNED BY public.f_lvr_land_b_park.id;


--
-- Name: f_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: f_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_c_build_id_seq OWNED BY public.f_lvr_land_c_build.id;


--
-- Name: f_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: f_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_c_land_id_seq OWNED BY public.f_lvr_land_c_land.id;


--
-- Name: f_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.f_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: f_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.f_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: f_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.f_lvr_land_c_park_id_seq OWNED BY public.f_lvr_land_c_park.id;


--
-- Name: g_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: g_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_a_build_id_seq OWNED BY public.g_lvr_land_a_build.id;


--
-- Name: g_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: g_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_a_land_id_seq OWNED BY public.g_lvr_land_a_land.id;


--
-- Name: g_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: g_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_a_park_id_seq OWNED BY public.g_lvr_land_a_park.id;


--
-- Name: g_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: g_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_b_land_id_seq OWNED BY public.g_lvr_land_b_land.id;


--
-- Name: g_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: g_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_b_park_id_seq OWNED BY public.g_lvr_land_b_park.id;


--
-- Name: g_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: g_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_c_build_id_seq OWNED BY public.g_lvr_land_c_build.id;


--
-- Name: g_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: g_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_c_land_id_seq OWNED BY public.g_lvr_land_c_land.id;


--
-- Name: g_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.g_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: g_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.g_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: g_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.g_lvr_land_c_park_id_seq OWNED BY public.g_lvr_land_c_park.id;


--
-- Name: h_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: h_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_a_build_id_seq OWNED BY public.h_lvr_land_a_build.id;


--
-- Name: h_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: h_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_a_land_id_seq OWNED BY public.h_lvr_land_a_land.id;


--
-- Name: h_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: h_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_a_park_id_seq OWNED BY public.h_lvr_land_a_park.id;


--
-- Name: h_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: h_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_b_land_id_seq OWNED BY public.h_lvr_land_b_land.id;


--
-- Name: h_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: h_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_b_park_id_seq OWNED BY public.h_lvr_land_b_park.id;


--
-- Name: h_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: h_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_c_build_id_seq OWNED BY public.h_lvr_land_c_build.id;


--
-- Name: h_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: h_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_c_land_id_seq OWNED BY public.h_lvr_land_c_land.id;


--
-- Name: h_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.h_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: h_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.h_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: h_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.h_lvr_land_c_park_id_seq OWNED BY public.h_lvr_land_c_park.id;


--
-- Name: i_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: i_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_a_build_id_seq OWNED BY public.i_lvr_land_a_build.id;


--
-- Name: i_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: i_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_a_land_id_seq OWNED BY public.i_lvr_land_a_land.id;


--
-- Name: i_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: i_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_a_park_id_seq OWNED BY public.i_lvr_land_a_park.id;


--
-- Name: i_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: i_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_b_land_id_seq OWNED BY public.i_lvr_land_b_land.id;


--
-- Name: i_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: i_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_b_park_id_seq OWNED BY public.i_lvr_land_b_park.id;


--
-- Name: i_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: i_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_c_build_id_seq OWNED BY public.i_lvr_land_c_build.id;


--
-- Name: i_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: i_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_c_land_id_seq OWNED BY public.i_lvr_land_c_land.id;


--
-- Name: i_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.i_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: i_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.i_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: i_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.i_lvr_land_c_park_id_seq OWNED BY public.i_lvr_land_c_park.id;


--
-- Name: j_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: j_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_a_build_id_seq OWNED BY public.j_lvr_land_a_build.id;


--
-- Name: j_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: j_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_a_land_id_seq OWNED BY public.j_lvr_land_a_land.id;


--
-- Name: j_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: j_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_a_park_id_seq OWNED BY public.j_lvr_land_a_park.id;


--
-- Name: j_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: j_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_b_land_id_seq OWNED BY public.j_lvr_land_b_land.id;


--
-- Name: j_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: j_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_b_park_id_seq OWNED BY public.j_lvr_land_b_park.id;


--
-- Name: j_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: j_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_c_build_id_seq OWNED BY public.j_lvr_land_c_build.id;


--
-- Name: j_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: j_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_c_land_id_seq OWNED BY public.j_lvr_land_c_land.id;


--
-- Name: j_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.j_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: j_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.j_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: j_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.j_lvr_land_c_park_id_seq OWNED BY public.j_lvr_land_c_park.id;


--
-- Name: k_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: k_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_a_build_id_seq OWNED BY public.k_lvr_land_a_build.id;


--
-- Name: k_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: k_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_a_land_id_seq OWNED BY public.k_lvr_land_a_land.id;


--
-- Name: k_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: k_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_a_park_id_seq OWNED BY public.k_lvr_land_a_park.id;


--
-- Name: k_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: k_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_b_land_id_seq OWNED BY public.k_lvr_land_b_land.id;


--
-- Name: k_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: k_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_b_park_id_seq OWNED BY public.k_lvr_land_b_park.id;


--
-- Name: k_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: k_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_c_build_id_seq OWNED BY public.k_lvr_land_c_build.id;


--
-- Name: k_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: k_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_c_land_id_seq OWNED BY public.k_lvr_land_c_land.id;


--
-- Name: k_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.k_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: k_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.k_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: k_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.k_lvr_land_c_park_id_seq OWNED BY public.k_lvr_land_c_park.id;


--
-- Name: m_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: m_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_a_build_id_seq OWNED BY public.m_lvr_land_a_build.id;


--
-- Name: m_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: m_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_a_land_id_seq OWNED BY public.m_lvr_land_a_land.id;


--
-- Name: m_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: m_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_a_park_id_seq OWNED BY public.m_lvr_land_a_park.id;


--
-- Name: m_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: m_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_b_land_id_seq OWNED BY public.m_lvr_land_b_land.id;


--
-- Name: m_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: m_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_b_park_id_seq OWNED BY public.m_lvr_land_b_park.id;


--
-- Name: m_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: m_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_c_build_id_seq OWNED BY public.m_lvr_land_c_build.id;


--
-- Name: m_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: m_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_c_land_id_seq OWNED BY public.m_lvr_land_c_land.id;


--
-- Name: m_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.m_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: m_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.m_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: m_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.m_lvr_land_c_park_id_seq OWNED BY public.m_lvr_land_c_park.id;


--
-- Name: n_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: n_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_a_build_id_seq OWNED BY public.n_lvr_land_a_build.id;


--
-- Name: n_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: n_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_a_land_id_seq OWNED BY public.n_lvr_land_a_land.id;


--
-- Name: n_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: n_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_a_park_id_seq OWNED BY public.n_lvr_land_a_park.id;


--
-- Name: n_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: n_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_b_land_id_seq OWNED BY public.n_lvr_land_b_land.id;


--
-- Name: n_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: n_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_b_park_id_seq OWNED BY public.n_lvr_land_b_park.id;


--
-- Name: n_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: n_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_c_build_id_seq OWNED BY public.n_lvr_land_c_build.id;


--
-- Name: n_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: n_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_c_land_id_seq OWNED BY public.n_lvr_land_c_land.id;


--
-- Name: n_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.n_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: n_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.n_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: n_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.n_lvr_land_c_park_id_seq OWNED BY public.n_lvr_land_c_park.id;


--
-- Name: o_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: o_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_a_build_id_seq OWNED BY public.o_lvr_land_a_build.id;


--
-- Name: o_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: o_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_a_land_id_seq OWNED BY public.o_lvr_land_a_land.id;


--
-- Name: o_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: o_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_a_park_id_seq OWNED BY public.o_lvr_land_a_park.id;


--
-- Name: o_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: o_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_b_land_id_seq OWNED BY public.o_lvr_land_b_land.id;


--
-- Name: o_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: o_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_b_park_id_seq OWNED BY public.o_lvr_land_b_park.id;


--
-- Name: o_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: o_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_c_build_id_seq OWNED BY public.o_lvr_land_c_build.id;


--
-- Name: o_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: o_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_c_land_id_seq OWNED BY public.o_lvr_land_c_land.id;


--
-- Name: o_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.o_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: o_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.o_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: o_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.o_lvr_land_c_park_id_seq OWNED BY public.o_lvr_land_c_park.id;


--
-- Name: p_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: p_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_a_build_id_seq OWNED BY public.p_lvr_land_a_build.id;


--
-- Name: p_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: p_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_a_land_id_seq OWNED BY public.p_lvr_land_a_land.id;


--
-- Name: p_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: p_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_a_park_id_seq OWNED BY public.p_lvr_land_a_park.id;


--
-- Name: p_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: p_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_b_land_id_seq OWNED BY public.p_lvr_land_b_land.id;


--
-- Name: p_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: p_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_b_park_id_seq OWNED BY public.p_lvr_land_b_park.id;


--
-- Name: p_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: p_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_c_build_id_seq OWNED BY public.p_lvr_land_c_build.id;


--
-- Name: p_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: p_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_c_land_id_seq OWNED BY public.p_lvr_land_c_land.id;


--
-- Name: p_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.p_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: p_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.p_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: p_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.p_lvr_land_c_park_id_seq OWNED BY public.p_lvr_land_c_park.id;


--
-- Name: parsing_exceptions_v15; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parsing_exceptions_v15 (
    id integer NOT NULL,
    description text,
    pattern_to_match text NOT NULL,
    extraction_regex text NOT NULL,
    output_format text NOT NULL,
    priority integer DEFAULT 100
);


--
-- Name: TABLE parsing_exceptions_v15; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.parsing_exceptions_v15 IS 'V15 例外規則庫: 用於處理通用引擎無法完美解決的特殊組合案例';


--
-- Name: parsing_exceptions_v15_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.parsing_exceptions_v15_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: parsing_exceptions_v15_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.parsing_exceptions_v15_id_seq OWNED BY public.parsing_exceptions_v15.id;


--
-- Name: project_parsing_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_parsing_rules (
    project_name character varying(255) NOT NULL,
    pattern_type character varying(50),
    pattern_regex text,
    parser_rule text,
    confidence_score numeric(5,2),
    sample_count integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: project_parsing_rules_v2; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_parsing_rules_v2 (
    project_name character varying(255) NOT NULL,
    rule_type character varying(50) NOT NULL,
    extraction_regex text,
    parser_logic text,
    confidence_score numeric(5,2),
    sample_count integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE project_parsing_rules_v2; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.project_parsing_rules_v2 IS 'V9版學習規則表，支援多種解析策略';


--
-- Name: q_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: q_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_a_build_id_seq OWNED BY public.q_lvr_land_a_build.id;


--
-- Name: q_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: q_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_a_land_id_seq OWNED BY public.q_lvr_land_a_land.id;


--
-- Name: q_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: q_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_a_park_id_seq OWNED BY public.q_lvr_land_a_park.id;


--
-- Name: q_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: q_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_b_land_id_seq OWNED BY public.q_lvr_land_b_land.id;


--
-- Name: q_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: q_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_b_park_id_seq OWNED BY public.q_lvr_land_b_park.id;


--
-- Name: q_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: q_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_c_build_id_seq OWNED BY public.q_lvr_land_c_build.id;


--
-- Name: q_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: q_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_c_land_id_seq OWNED BY public.q_lvr_land_c_land.id;


--
-- Name: q_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.q_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: q_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.q_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: q_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.q_lvr_land_c_park_id_seq OWNED BY public.q_lvr_land_c_park.id;


--
-- Name: shared_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shared_reports (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    token text NOT NULL,
    report_type text,
    filters jsonb,
    date_config jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    view_mode text,
    view_options jsonb
);


--
-- Name: TABLE shared_reports; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.shared_reports IS '儲存所有公開分享報告的設定';


--
-- Name: COLUMN shared_reports.token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.shared_reports.token IS '用於公開網址的唯一、隨機分享權杖';


--
-- Name: COLUMN shared_reports.report_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.shared_reports.report_type IS '報告類型，例如銷控表或排名';


--
-- Name: COLUMN shared_reports.filters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.shared_reports.filters IS '固定的篩選條件，例如專案名稱、行政區等';


--
-- Name: COLUMN shared_reports.date_config; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.shared_reports.date_config IS '日期的規則，分為 "relative" 或 "absolute"';


--
-- Name: COLUMN shared_reports.created_by; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.shared_reports.created_by IS '建立此分享連結的使用者ID';


--
-- Name: t_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: t_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_a_build_id_seq OWNED BY public.t_lvr_land_a_build.id;


--
-- Name: t_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: t_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_a_land_id_seq OWNED BY public.t_lvr_land_a_land.id;


--
-- Name: t_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: t_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_a_park_id_seq OWNED BY public.t_lvr_land_a_park.id;


--
-- Name: t_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: t_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_b_land_id_seq OWNED BY public.t_lvr_land_b_land.id;


--
-- Name: t_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: t_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_b_park_id_seq OWNED BY public.t_lvr_land_b_park.id;


--
-- Name: t_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: t_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_c_build_id_seq OWNED BY public.t_lvr_land_c_build.id;


--
-- Name: t_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: t_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_c_land_id_seq OWNED BY public.t_lvr_land_c_land.id;


--
-- Name: t_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.t_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: t_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.t_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: t_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.t_lvr_land_c_park_id_seq OWNED BY public.t_lvr_land_c_park.id;


--
-- Name: u_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: u_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_a_build_id_seq OWNED BY public.u_lvr_land_a_build.id;


--
-- Name: u_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: u_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_a_land_id_seq OWNED BY public.u_lvr_land_a_land.id;


--
-- Name: u_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: u_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_a_park_id_seq OWNED BY public.u_lvr_land_a_park.id;


--
-- Name: u_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: u_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_b_land_id_seq OWNED BY public.u_lvr_land_b_land.id;


--
-- Name: u_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: u_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_b_park_id_seq OWNED BY public.u_lvr_land_b_park.id;


--
-- Name: u_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: u_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_c_build_id_seq OWNED BY public.u_lvr_land_c_build.id;


--
-- Name: u_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: u_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_c_land_id_seq OWNED BY public.u_lvr_land_c_land.id;


--
-- Name: u_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.u_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: u_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.u_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: u_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.u_lvr_land_c_park_id_seq OWNED BY public.u_lvr_land_c_park.id;


--
-- Name: v_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: v_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_a_build_id_seq OWNED BY public.v_lvr_land_a_build.id;


--
-- Name: v_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: v_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_a_land_id_seq OWNED BY public.v_lvr_land_a_land.id;


--
-- Name: v_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: v_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_a_park_id_seq OWNED BY public.v_lvr_land_a_park.id;


--
-- Name: v_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: v_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_b_land_id_seq OWNED BY public.v_lvr_land_b_land.id;


--
-- Name: v_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: v_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_b_park_id_seq OWNED BY public.v_lvr_land_b_park.id;


--
-- Name: v_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: v_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_c_build_id_seq OWNED BY public.v_lvr_land_c_build.id;


--
-- Name: v_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: v_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_c_land_id_seq OWNED BY public.v_lvr_land_c_land.id;


--
-- Name: v_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.v_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: v_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.v_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: v_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.v_lvr_land_c_park_id_seq OWNED BY public.v_lvr_land_c_park.id;


--
-- Name: w_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: w_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_a_build_id_seq OWNED BY public.w_lvr_land_a_build.id;


--
-- Name: w_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: w_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_a_land_id_seq OWNED BY public.w_lvr_land_a_land.id;


--
-- Name: w_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: w_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_a_park_id_seq OWNED BY public.w_lvr_land_a_park.id;


--
-- Name: w_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: w_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_b_land_id_seq OWNED BY public.w_lvr_land_b_land.id;


--
-- Name: w_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: w_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_b_park_id_seq OWNED BY public.w_lvr_land_b_park.id;


--
-- Name: w_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: w_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_c_build_id_seq OWNED BY public.w_lvr_land_c_build.id;


--
-- Name: w_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: w_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_c_land_id_seq OWNED BY public.w_lvr_land_c_land.id;


--
-- Name: w_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.w_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: w_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.w_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: w_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.w_lvr_land_c_park_id_seq OWNED BY public.w_lvr_land_c_park.id;


--
-- Name: x_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: x_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_a_build_id_seq OWNED BY public.x_lvr_land_a_build.id;


--
-- Name: x_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: x_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_a_land_id_seq OWNED BY public.x_lvr_land_a_land.id;


--
-- Name: x_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: x_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_a_park_id_seq OWNED BY public.x_lvr_land_a_park.id;


--
-- Name: x_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: x_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_b_land_id_seq OWNED BY public.x_lvr_land_b_land.id;


--
-- Name: x_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: x_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_b_park_id_seq OWNED BY public.x_lvr_land_b_park.id;


--
-- Name: x_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: x_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_c_build_id_seq OWNED BY public.x_lvr_land_c_build.id;


--
-- Name: x_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: x_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_c_land_id_seq OWNED BY public.x_lvr_land_c_land.id;


--
-- Name: x_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.x_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: x_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.x_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: x_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.x_lvr_land_c_park_id_seq OWNED BY public.x_lvr_land_c_park.id;


--
-- Name: z_lvr_land_a_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_a_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: z_lvr_land_a_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_a_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_a_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_a_build_id_seq OWNED BY public.z_lvr_land_a_build.id;


--
-- Name: z_lvr_land_a_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_a_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: z_lvr_land_a_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_a_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_a_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_a_land_id_seq OWNED BY public.z_lvr_land_a_land.id;


--
-- Name: z_lvr_land_a_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_a_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: z_lvr_land_a_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_a_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_a_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_a_park_id_seq OWNED BY public.z_lvr_land_a_park.id;


--
-- Name: z_lvr_land_b_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_b_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地持分面積" numeric(12,2),
    "持分分母" bigint,
    "持分分子" bigint,
    "使用分區" text,
    "土地持分面積(坪)" numeric(12,2)
);


--
-- Name: z_lvr_land_b_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_b_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_b_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_b_land_id_seq OWNED BY public.z_lvr_land_b_land.id;


--
-- Name: z_lvr_land_b_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_b_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位價格(萬)" bigint,
    "車位面積(坪)" numeric(10,2)
);


--
-- Name: z_lvr_land_b_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_b_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_b_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_b_park_id_seq OWNED BY public.z_lvr_land_b_park.id;


--
-- Name: z_lvr_land_c_build; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_c_build (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "交易屋齡" integer,
    "結構" text,
    "完工日" date,
    "總樓層" text,
    "移轉情形" character varying(50)
);


--
-- Name: z_lvr_land_c_build_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_c_build_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_c_build_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_c_build_id_seq OWNED BY public.z_lvr_land_c_build.id;


--
-- Name: z_lvr_land_c_land; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_c_land (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "地號_段" text,
    "地號" character varying(50),
    "土地租賃面積" numeric(12,2),
    "使用分區" text,
    "土地租賃面積(坪)" numeric(12,2)
);


--
-- Name: z_lvr_land_c_land_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_c_land_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_c_land_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_c_land_id_seq OWNED BY public.z_lvr_land_c_land.id;


--
-- Name: z_lvr_land_c_park; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.z_lvr_land_c_park (
    id integer NOT NULL,
    "編號" character varying(50) NOT NULL,
    "車位類別" text,
    "車位價格" bigint,
    "車位面積" numeric(8,2),
    "車位樓層" character varying(20),
    "車位面積(坪)" numeric(10,2),
    "車位價格(萬)" bigint
);


--
-- Name: z_lvr_land_c_park_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.z_lvr_land_c_park_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: z_lvr_land_c_park_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.z_lvr_land_c_park_id_seq OWNED BY public.z_lvr_land_c_park.id;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: a_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_a_build_id_seq'::regclass);


--
-- Name: a_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_a_land_id_seq'::regclass);


--
-- Name: a_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_a_park_id_seq'::regclass);


--
-- Name: a_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_b_land_id_seq'::regclass);


--
-- Name: a_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_b_park_id_seq'::regclass);


--
-- Name: a_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_c_build_id_seq'::regclass);


--
-- Name: a_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_c_land_id_seq'::regclass);


--
-- Name: a_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.a_lvr_land_c_park_id_seq'::regclass);


--
-- Name: b_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_a_build_id_seq'::regclass);


--
-- Name: b_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_a_land_id_seq'::regclass);


--
-- Name: b_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_a_park_id_seq'::regclass);


--
-- Name: b_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_b_land_id_seq'::regclass);


--
-- Name: b_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_b_park_id_seq'::regclass);


--
-- Name: b_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_c_build_id_seq'::regclass);


--
-- Name: b_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_c_land_id_seq'::regclass);


--
-- Name: b_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.b_lvr_land_c_park_id_seq'::regclass);


--
-- Name: c_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_a_build_id_seq'::regclass);


--
-- Name: c_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_a_land_id_seq'::regclass);


--
-- Name: c_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_a_park_id_seq'::regclass);


--
-- Name: c_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_b_land_id_seq'::regclass);


--
-- Name: c_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_b_park_id_seq'::regclass);


--
-- Name: c_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_c_build_id_seq'::regclass);


--
-- Name: c_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_c_land_id_seq'::regclass);


--
-- Name: c_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.c_lvr_land_c_park_id_seq'::regclass);


--
-- Name: d_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_a_build_id_seq'::regclass);


--
-- Name: d_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_a_land_id_seq'::regclass);


--
-- Name: d_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_a_park_id_seq'::regclass);


--
-- Name: d_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_b_land_id_seq'::regclass);


--
-- Name: d_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_b_park_id_seq'::regclass);


--
-- Name: d_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_c_build_id_seq'::regclass);


--
-- Name: d_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_c_land_id_seq'::regclass);


--
-- Name: d_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.d_lvr_land_c_park_id_seq'::regclass);


--
-- Name: e_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_a_build_id_seq'::regclass);


--
-- Name: e_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_a_land_id_seq'::regclass);


--
-- Name: e_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_a_park_id_seq'::regclass);


--
-- Name: e_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_b_land_id_seq'::regclass);


--
-- Name: e_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_b_park_id_seq'::regclass);


--
-- Name: e_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_c_build_id_seq'::regclass);


--
-- Name: e_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_c_land_id_seq'::regclass);


--
-- Name: e_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.e_lvr_land_c_park_id_seq'::regclass);


--
-- Name: f_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_a_build_id_seq'::regclass);


--
-- Name: f_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_a_land_id_seq'::regclass);


--
-- Name: f_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_a_park_id_seq'::regclass);


--
-- Name: f_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_b_land_id_seq'::regclass);


--
-- Name: f_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_b_park_id_seq'::regclass);


--
-- Name: f_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_c_build_id_seq'::regclass);


--
-- Name: f_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_c_land_id_seq'::regclass);


--
-- Name: f_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.f_lvr_land_c_park_id_seq'::regclass);


--
-- Name: g_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_a_build_id_seq'::regclass);


--
-- Name: g_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_a_land_id_seq'::regclass);


--
-- Name: g_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_a_park_id_seq'::regclass);


--
-- Name: g_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_b_land_id_seq'::regclass);


--
-- Name: g_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_b_park_id_seq'::regclass);


--
-- Name: g_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_c_build_id_seq'::regclass);


--
-- Name: g_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_c_land_id_seq'::regclass);


--
-- Name: g_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.g_lvr_land_c_park_id_seq'::regclass);


--
-- Name: h_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_a_build_id_seq'::regclass);


--
-- Name: h_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_a_land_id_seq'::regclass);


--
-- Name: h_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_a_park_id_seq'::regclass);


--
-- Name: h_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_b_land_id_seq'::regclass);


--
-- Name: h_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_b_park_id_seq'::regclass);


--
-- Name: h_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_c_build_id_seq'::regclass);


--
-- Name: h_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_c_land_id_seq'::regclass);


--
-- Name: h_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.h_lvr_land_c_park_id_seq'::regclass);


--
-- Name: i_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_a_build_id_seq'::regclass);


--
-- Name: i_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_a_land_id_seq'::regclass);


--
-- Name: i_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_a_park_id_seq'::regclass);


--
-- Name: i_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_b_land_id_seq'::regclass);


--
-- Name: i_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_b_park_id_seq'::regclass);


--
-- Name: i_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_c_build_id_seq'::regclass);


--
-- Name: i_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_c_land_id_seq'::regclass);


--
-- Name: i_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.i_lvr_land_c_park_id_seq'::regclass);


--
-- Name: j_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_a_build_id_seq'::regclass);


--
-- Name: j_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_a_land_id_seq'::regclass);


--
-- Name: j_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_a_park_id_seq'::regclass);


--
-- Name: j_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_b_land_id_seq'::regclass);


--
-- Name: j_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_b_park_id_seq'::regclass);


--
-- Name: j_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_c_build_id_seq'::regclass);


--
-- Name: j_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_c_land_id_seq'::regclass);


--
-- Name: j_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.j_lvr_land_c_park_id_seq'::regclass);


--
-- Name: k_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_a_build_id_seq'::regclass);


--
-- Name: k_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_a_land_id_seq'::regclass);


--
-- Name: k_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_a_park_id_seq'::regclass);


--
-- Name: k_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_b_land_id_seq'::regclass);


--
-- Name: k_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_b_park_id_seq'::regclass);


--
-- Name: k_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_c_build_id_seq'::regclass);


--
-- Name: k_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_c_land_id_seq'::regclass);


--
-- Name: k_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.k_lvr_land_c_park_id_seq'::regclass);


--
-- Name: m_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_a_build_id_seq'::regclass);


--
-- Name: m_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_a_land_id_seq'::regclass);


--
-- Name: m_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_a_park_id_seq'::regclass);


--
-- Name: m_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_b_land_id_seq'::regclass);


--
-- Name: m_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_b_park_id_seq'::regclass);


--
-- Name: m_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_c_build_id_seq'::regclass);


--
-- Name: m_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_c_land_id_seq'::regclass);


--
-- Name: m_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.m_lvr_land_c_park_id_seq'::regclass);


--
-- Name: n_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_a_build_id_seq'::regclass);


--
-- Name: n_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_a_land_id_seq'::regclass);


--
-- Name: n_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_a_park_id_seq'::regclass);


--
-- Name: n_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_b_land_id_seq'::regclass);


--
-- Name: n_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_b_park_id_seq'::regclass);


--
-- Name: n_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_c_build_id_seq'::regclass);


--
-- Name: n_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_c_land_id_seq'::regclass);


--
-- Name: n_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.n_lvr_land_c_park_id_seq'::regclass);


--
-- Name: o_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_a_build_id_seq'::regclass);


--
-- Name: o_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_a_land_id_seq'::regclass);


--
-- Name: o_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_a_park_id_seq'::regclass);


--
-- Name: o_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_b_land_id_seq'::regclass);


--
-- Name: o_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_b_park_id_seq'::regclass);


--
-- Name: o_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_c_build_id_seq'::regclass);


--
-- Name: o_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_c_land_id_seq'::regclass);


--
-- Name: o_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.o_lvr_land_c_park_id_seq'::regclass);


--
-- Name: p_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_a_build_id_seq'::regclass);


--
-- Name: p_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_a_land_id_seq'::regclass);


--
-- Name: p_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_a_park_id_seq'::regclass);


--
-- Name: p_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_b_land_id_seq'::regclass);


--
-- Name: p_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_b_park_id_seq'::regclass);


--
-- Name: p_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_c_build_id_seq'::regclass);


--
-- Name: p_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_c_land_id_seq'::regclass);


--
-- Name: p_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.p_lvr_land_c_park_id_seq'::regclass);


--
-- Name: parsing_exceptions_v15 id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parsing_exceptions_v15 ALTER COLUMN id SET DEFAULT nextval('public.parsing_exceptions_v15_id_seq'::regclass);


--
-- Name: q_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_a_build_id_seq'::regclass);


--
-- Name: q_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_a_land_id_seq'::regclass);


--
-- Name: q_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_a_park_id_seq'::regclass);


--
-- Name: q_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_b_land_id_seq'::regclass);


--
-- Name: q_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_b_park_id_seq'::regclass);


--
-- Name: q_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_c_build_id_seq'::regclass);


--
-- Name: q_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_c_land_id_seq'::regclass);


--
-- Name: q_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.q_lvr_land_c_park_id_seq'::regclass);


--
-- Name: t_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_a_build_id_seq'::regclass);


--
-- Name: t_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_a_land_id_seq'::regclass);


--
-- Name: t_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_a_park_id_seq'::regclass);


--
-- Name: t_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_b_land_id_seq'::regclass);


--
-- Name: t_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_b_park_id_seq'::regclass);


--
-- Name: t_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_c_build_id_seq'::regclass);


--
-- Name: t_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_c_land_id_seq'::regclass);


--
-- Name: t_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.t_lvr_land_c_park_id_seq'::regclass);


--
-- Name: u_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_a_build_id_seq'::regclass);


--
-- Name: u_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_a_land_id_seq'::regclass);


--
-- Name: u_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_a_park_id_seq'::regclass);


--
-- Name: u_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_b_land_id_seq'::regclass);


--
-- Name: u_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_b_park_id_seq'::regclass);


--
-- Name: u_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_c_build_id_seq'::regclass);


--
-- Name: u_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_c_land_id_seq'::regclass);


--
-- Name: u_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.u_lvr_land_c_park_id_seq'::regclass);


--
-- Name: v_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_a_build_id_seq'::regclass);


--
-- Name: v_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_a_land_id_seq'::regclass);


--
-- Name: v_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_a_park_id_seq'::regclass);


--
-- Name: v_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_b_land_id_seq'::regclass);


--
-- Name: v_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_b_park_id_seq'::regclass);


--
-- Name: v_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_c_build_id_seq'::regclass);


--
-- Name: v_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_c_land_id_seq'::regclass);


--
-- Name: v_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.v_lvr_land_c_park_id_seq'::regclass);


--
-- Name: w_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_a_build_id_seq'::regclass);


--
-- Name: w_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_a_land_id_seq'::regclass);


--
-- Name: w_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_a_park_id_seq'::regclass);


--
-- Name: w_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_b_land_id_seq'::regclass);


--
-- Name: w_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_b_park_id_seq'::regclass);


--
-- Name: w_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_c_build_id_seq'::regclass);


--
-- Name: w_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_c_land_id_seq'::regclass);


--
-- Name: w_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.w_lvr_land_c_park_id_seq'::regclass);


--
-- Name: x_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_a_build_id_seq'::regclass);


--
-- Name: x_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_a_land_id_seq'::regclass);


--
-- Name: x_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_a_park_id_seq'::regclass);


--
-- Name: x_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_b_land_id_seq'::regclass);


--
-- Name: x_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_b_park_id_seq'::regclass);


--
-- Name: x_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_c_build_id_seq'::regclass);


--
-- Name: x_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_c_land_id_seq'::regclass);


--
-- Name: x_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.x_lvr_land_c_park_id_seq'::regclass);


--
-- Name: z_lvr_land_a_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_build ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_a_build_id_seq'::regclass);


--
-- Name: z_lvr_land_a_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_land ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_a_land_id_seq'::regclass);


--
-- Name: z_lvr_land_a_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_park ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_a_park_id_seq'::regclass);


--
-- Name: z_lvr_land_b_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_land ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_b_land_id_seq'::regclass);


--
-- Name: z_lvr_land_b_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_park ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_b_park_id_seq'::regclass);


--
-- Name: z_lvr_land_c_build id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_build ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_c_build_id_seq'::regclass);


--
-- Name: z_lvr_land_c_land id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_land ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_c_land_id_seq'::regclass);


--
-- Name: z_lvr_land_c_park id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_park ALTER COLUMN id SET DEFAULT nextval('public.z_lvr_land_c_park_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_a_build a_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_build
    ADD CONSTRAINT a_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_a_land a_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_land
    ADD CONSTRAINT a_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_a_park a_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_park
    ADD CONSTRAINT a_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_a a_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a
    ADD CONSTRAINT a_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: a_lvr_land_b_land a_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_land
    ADD CONSTRAINT a_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_b_park a_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_park
    ADD CONSTRAINT a_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_b a_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b
    ADD CONSTRAINT a_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: a_lvr_land_c_build a_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_build
    ADD CONSTRAINT a_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_c_land a_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_land
    ADD CONSTRAINT a_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_c_park a_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_park
    ADD CONSTRAINT a_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: a_lvr_land_c a_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c
    ADD CONSTRAINT a_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: b_lvr_land_a_build b_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_build
    ADD CONSTRAINT b_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_a_land b_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_land
    ADD CONSTRAINT b_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_a_park b_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_park
    ADD CONSTRAINT b_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_a b_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a
    ADD CONSTRAINT b_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: b_lvr_land_b_land b_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_land
    ADD CONSTRAINT b_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_b_park b_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_park
    ADD CONSTRAINT b_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_b b_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b
    ADD CONSTRAINT b_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: b_lvr_land_c_build b_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_build
    ADD CONSTRAINT b_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_c_land b_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_land
    ADD CONSTRAINT b_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_c_park b_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_park
    ADD CONSTRAINT b_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: b_lvr_land_c b_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c
    ADD CONSTRAINT b_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: c_lvr_land_a_build c_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_build
    ADD CONSTRAINT c_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_a_land c_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_land
    ADD CONSTRAINT c_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_a_park c_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_park
    ADD CONSTRAINT c_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_a c_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a
    ADD CONSTRAINT c_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: c_lvr_land_b_land c_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_land
    ADD CONSTRAINT c_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_b_park c_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_park
    ADD CONSTRAINT c_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_b c_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b
    ADD CONSTRAINT c_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: c_lvr_land_c_build c_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_build
    ADD CONSTRAINT c_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_c_land c_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_land
    ADD CONSTRAINT c_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_c_park c_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_park
    ADD CONSTRAINT c_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: c_lvr_land_c c_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c
    ADD CONSTRAINT c_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: county_codes county_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.county_codes
    ADD CONSTRAINT county_codes_pkey PRIMARY KEY (code);


--
-- Name: d_lvr_land_a_build d_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_build
    ADD CONSTRAINT d_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_a_land d_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_land
    ADD CONSTRAINT d_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_a_park d_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_park
    ADD CONSTRAINT d_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_a d_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a
    ADD CONSTRAINT d_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: d_lvr_land_b_land d_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_land
    ADD CONSTRAINT d_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_b_park d_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_park
    ADD CONSTRAINT d_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_b d_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b
    ADD CONSTRAINT d_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: d_lvr_land_c_build d_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_build
    ADD CONSTRAINT d_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_c_land d_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_land
    ADD CONSTRAINT d_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_c_park d_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_park
    ADD CONSTRAINT d_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: d_lvr_land_c d_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c
    ADD CONSTRAINT d_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: e_lvr_land_a_build e_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_build
    ADD CONSTRAINT e_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_a_land e_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_land
    ADD CONSTRAINT e_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_a_park e_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_park
    ADD CONSTRAINT e_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_a e_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a
    ADD CONSTRAINT e_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: e_lvr_land_b_land e_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_land
    ADD CONSTRAINT e_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_b_park e_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_park
    ADD CONSTRAINT e_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_b e_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b
    ADD CONSTRAINT e_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: e_lvr_land_c_build e_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_build
    ADD CONSTRAINT e_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_c_land e_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_land
    ADD CONSTRAINT e_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_c_park e_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_park
    ADD CONSTRAINT e_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: e_lvr_land_c e_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c
    ADD CONSTRAINT e_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: f_lvr_land_a_build f_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_build
    ADD CONSTRAINT f_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_a_land f_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_land
    ADD CONSTRAINT f_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_a_park f_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_park
    ADD CONSTRAINT f_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_a f_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a
    ADD CONSTRAINT f_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: f_lvr_land_b_land f_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_land
    ADD CONSTRAINT f_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_b_park f_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_park
    ADD CONSTRAINT f_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_b f_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b
    ADD CONSTRAINT f_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: f_lvr_land_c_build f_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_build
    ADD CONSTRAINT f_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_c_land f_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_land
    ADD CONSTRAINT f_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_c_park f_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_park
    ADD CONSTRAINT f_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: f_lvr_land_c f_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c
    ADD CONSTRAINT f_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: g_lvr_land_a_build g_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_build
    ADD CONSTRAINT g_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_a_land g_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_land
    ADD CONSTRAINT g_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_a_park g_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_park
    ADD CONSTRAINT g_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_a g_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a
    ADD CONSTRAINT g_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: g_lvr_land_b_land g_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_land
    ADD CONSTRAINT g_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_b_park g_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_park
    ADD CONSTRAINT g_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_b g_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b
    ADD CONSTRAINT g_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: g_lvr_land_c_build g_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_build
    ADD CONSTRAINT g_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_c_land g_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_land
    ADD CONSTRAINT g_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_c_park g_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_park
    ADD CONSTRAINT g_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: g_lvr_land_c g_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c
    ADD CONSTRAINT g_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: h_lvr_land_a_build h_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_build
    ADD CONSTRAINT h_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_a_land h_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_land
    ADD CONSTRAINT h_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_a_park h_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_park
    ADD CONSTRAINT h_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_a h_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a
    ADD CONSTRAINT h_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: h_lvr_land_b_land h_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_land
    ADD CONSTRAINT h_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_b_park h_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_park
    ADD CONSTRAINT h_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_b h_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b
    ADD CONSTRAINT h_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: h_lvr_land_c_build h_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_build
    ADD CONSTRAINT h_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_c_land h_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_land
    ADD CONSTRAINT h_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_c_park h_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_park
    ADD CONSTRAINT h_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: h_lvr_land_c h_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c
    ADD CONSTRAINT h_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: i_lvr_land_a_build i_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_build
    ADD CONSTRAINT i_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_a_land i_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_land
    ADD CONSTRAINT i_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_a_park i_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_park
    ADD CONSTRAINT i_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_a i_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a
    ADD CONSTRAINT i_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: i_lvr_land_b_land i_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_land
    ADD CONSTRAINT i_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_b_park i_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_park
    ADD CONSTRAINT i_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_b i_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b
    ADD CONSTRAINT i_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: i_lvr_land_c_build i_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_build
    ADD CONSTRAINT i_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_c_land i_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_land
    ADD CONSTRAINT i_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_c_park i_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_park
    ADD CONSTRAINT i_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: i_lvr_land_c i_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c
    ADD CONSTRAINT i_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: j_lvr_land_a_build j_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_build
    ADD CONSTRAINT j_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_a_land j_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_land
    ADD CONSTRAINT j_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_a_park j_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_park
    ADD CONSTRAINT j_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_a j_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a
    ADD CONSTRAINT j_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: j_lvr_land_b_land j_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_land
    ADD CONSTRAINT j_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_b_park j_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_park
    ADD CONSTRAINT j_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_b j_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b
    ADD CONSTRAINT j_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: j_lvr_land_c_build j_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_build
    ADD CONSTRAINT j_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_c_land j_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_land
    ADD CONSTRAINT j_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_c_park j_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_park
    ADD CONSTRAINT j_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: j_lvr_land_c j_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c
    ADD CONSTRAINT j_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: k_lvr_land_a_build k_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_build
    ADD CONSTRAINT k_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_a_land k_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_land
    ADD CONSTRAINT k_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_a_park k_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_park
    ADD CONSTRAINT k_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_a k_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a
    ADD CONSTRAINT k_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: k_lvr_land_b_land k_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_land
    ADD CONSTRAINT k_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_b_park k_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_park
    ADD CONSTRAINT k_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_b k_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b
    ADD CONSTRAINT k_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: k_lvr_land_c_build k_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_build
    ADD CONSTRAINT k_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_c_land k_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_land
    ADD CONSTRAINT k_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_c_park k_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_park
    ADD CONSTRAINT k_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: k_lvr_land_c k_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c
    ADD CONSTRAINT k_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: m_lvr_land_a_build m_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_build
    ADD CONSTRAINT m_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_a_land m_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_land
    ADD CONSTRAINT m_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_a_park m_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_park
    ADD CONSTRAINT m_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_a m_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a
    ADD CONSTRAINT m_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: m_lvr_land_b_land m_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_land
    ADD CONSTRAINT m_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_b_park m_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_park
    ADD CONSTRAINT m_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_b m_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b
    ADD CONSTRAINT m_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: m_lvr_land_c_build m_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_build
    ADD CONSTRAINT m_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_c_land m_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_land
    ADD CONSTRAINT m_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_c_park m_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_park
    ADD CONSTRAINT m_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: m_lvr_land_c m_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c
    ADD CONSTRAINT m_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: n_lvr_land_a_build n_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_build
    ADD CONSTRAINT n_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_a_land n_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_land
    ADD CONSTRAINT n_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_a_park n_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_park
    ADD CONSTRAINT n_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_a n_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a
    ADD CONSTRAINT n_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: n_lvr_land_b_land n_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_land
    ADD CONSTRAINT n_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_b_park n_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_park
    ADD CONSTRAINT n_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_b n_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b
    ADD CONSTRAINT n_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: n_lvr_land_c_build n_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_build
    ADD CONSTRAINT n_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_c_land n_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_land
    ADD CONSTRAINT n_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_c_park n_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_park
    ADD CONSTRAINT n_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: n_lvr_land_c n_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c
    ADD CONSTRAINT n_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: o_lvr_land_a_build o_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_build
    ADD CONSTRAINT o_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_a_land o_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_land
    ADD CONSTRAINT o_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_a_park o_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_park
    ADD CONSTRAINT o_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_a o_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a
    ADD CONSTRAINT o_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: o_lvr_land_b_land o_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_land
    ADD CONSTRAINT o_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_b_park o_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_park
    ADD CONSTRAINT o_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_b o_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b
    ADD CONSTRAINT o_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: o_lvr_land_c_build o_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_build
    ADD CONSTRAINT o_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_c_land o_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_land
    ADD CONSTRAINT o_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_c_park o_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_park
    ADD CONSTRAINT o_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: o_lvr_land_c o_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c
    ADD CONSTRAINT o_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: p_lvr_land_a_build p_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_build
    ADD CONSTRAINT p_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_a_land p_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_land
    ADD CONSTRAINT p_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_a_park p_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_park
    ADD CONSTRAINT p_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_a p_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a
    ADD CONSTRAINT p_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: p_lvr_land_b_land p_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_land
    ADD CONSTRAINT p_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_b_park p_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_park
    ADD CONSTRAINT p_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_b p_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b
    ADD CONSTRAINT p_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: p_lvr_land_c_build p_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_build
    ADD CONSTRAINT p_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_c_land p_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_land
    ADD CONSTRAINT p_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_c_park p_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_park
    ADD CONSTRAINT p_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: p_lvr_land_c p_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c
    ADD CONSTRAINT p_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: parsing_exceptions_v15 parsing_exceptions_v15_pattern_to_match_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parsing_exceptions_v15
    ADD CONSTRAINT parsing_exceptions_v15_pattern_to_match_key UNIQUE (pattern_to_match);


--
-- Name: parsing_exceptions_v15 parsing_exceptions_v15_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parsing_exceptions_v15
    ADD CONSTRAINT parsing_exceptions_v15_pkey PRIMARY KEY (id);


--
-- Name: project_parsing_rules project_parsing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_parsing_rules
    ADD CONSTRAINT project_parsing_rules_pkey PRIMARY KEY (project_name);


--
-- Name: project_parsing_rules_v2 project_parsing_rules_v2_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_parsing_rules_v2
    ADD CONSTRAINT project_parsing_rules_v2_pkey PRIMARY KEY (project_name);


--
-- Name: q_lvr_land_a_build q_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_build
    ADD CONSTRAINT q_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_a_land q_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_land
    ADD CONSTRAINT q_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_a_park q_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_park
    ADD CONSTRAINT q_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_a q_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a
    ADD CONSTRAINT q_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: q_lvr_land_b_land q_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_land
    ADD CONSTRAINT q_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_b_park q_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_park
    ADD CONSTRAINT q_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_b q_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b
    ADD CONSTRAINT q_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: q_lvr_land_c_build q_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_build
    ADD CONSTRAINT q_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_c_land q_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_land
    ADD CONSTRAINT q_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_c_park q_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_park
    ADD CONSTRAINT q_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: q_lvr_land_c q_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c
    ADD CONSTRAINT q_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: shared_reports shared_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_reports
    ADD CONSTRAINT shared_reports_pkey PRIMARY KEY (id);


--
-- Name: shared_reports shared_reports_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_reports
    ADD CONSTRAINT shared_reports_token_key UNIQUE (token);


--
-- Name: t_lvr_land_a_build t_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_build
    ADD CONSTRAINT t_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_a_land t_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_land
    ADD CONSTRAINT t_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_a_park t_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_park
    ADD CONSTRAINT t_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_a t_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a
    ADD CONSTRAINT t_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: t_lvr_land_b_land t_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_land
    ADD CONSTRAINT t_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_b_park t_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_park
    ADD CONSTRAINT t_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_b t_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b
    ADD CONSTRAINT t_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: t_lvr_land_c_build t_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_build
    ADD CONSTRAINT t_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_c_land t_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_land
    ADD CONSTRAINT t_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_c_park t_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_park
    ADD CONSTRAINT t_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: t_lvr_land_c t_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c
    ADD CONSTRAINT t_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: u_lvr_land_a_build u_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_build
    ADD CONSTRAINT u_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_a_land u_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_land
    ADD CONSTRAINT u_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_a_park u_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_park
    ADD CONSTRAINT u_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_a u_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a
    ADD CONSTRAINT u_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: u_lvr_land_b_land u_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_land
    ADD CONSTRAINT u_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_b_park u_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_park
    ADD CONSTRAINT u_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_b u_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b
    ADD CONSTRAINT u_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: u_lvr_land_c_build u_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_build
    ADD CONSTRAINT u_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_c_land u_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_land
    ADD CONSTRAINT u_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_c_park u_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_park
    ADD CONSTRAINT u_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: u_lvr_land_c u_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c
    ADD CONSTRAINT u_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: v_lvr_land_a_build v_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_build
    ADD CONSTRAINT v_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_a_land v_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_land
    ADD CONSTRAINT v_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_a_park v_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_park
    ADD CONSTRAINT v_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_a v_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a
    ADD CONSTRAINT v_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: v_lvr_land_b_land v_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_land
    ADD CONSTRAINT v_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_b_park v_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_park
    ADD CONSTRAINT v_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_b v_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b
    ADD CONSTRAINT v_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: v_lvr_land_c_build v_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_build
    ADD CONSTRAINT v_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_c_land v_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_land
    ADD CONSTRAINT v_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_c_park v_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_park
    ADD CONSTRAINT v_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: v_lvr_land_c v_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c
    ADD CONSTRAINT v_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: w_lvr_land_a_build w_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_build
    ADD CONSTRAINT w_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_a_land w_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_land
    ADD CONSTRAINT w_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_a_park w_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_park
    ADD CONSTRAINT w_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_a w_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a
    ADD CONSTRAINT w_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: w_lvr_land_b_land w_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_land
    ADD CONSTRAINT w_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_b_park w_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_park
    ADD CONSTRAINT w_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_b w_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b
    ADD CONSTRAINT w_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: w_lvr_land_c_build w_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_build
    ADD CONSTRAINT w_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_c_land w_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_land
    ADD CONSTRAINT w_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_c_park w_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_park
    ADD CONSTRAINT w_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: w_lvr_land_c w_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c
    ADD CONSTRAINT w_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: x_lvr_land_a_build x_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_build
    ADD CONSTRAINT x_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_a_land x_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_land
    ADD CONSTRAINT x_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_a_park x_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_park
    ADD CONSTRAINT x_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_a x_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a
    ADD CONSTRAINT x_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: x_lvr_land_b_land x_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_land
    ADD CONSTRAINT x_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_b_park x_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_park
    ADD CONSTRAINT x_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_b x_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b
    ADD CONSTRAINT x_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: x_lvr_land_c_build x_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_build
    ADD CONSTRAINT x_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_c_land x_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_land
    ADD CONSTRAINT x_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_c_park x_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_park
    ADD CONSTRAINT x_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: x_lvr_land_c x_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c
    ADD CONSTRAINT x_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: z_lvr_land_a_build z_lvr_land_a_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_build
    ADD CONSTRAINT z_lvr_land_a_build_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_a_land z_lvr_land_a_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_land
    ADD CONSTRAINT z_lvr_land_a_land_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_a_park z_lvr_land_a_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_park
    ADD CONSTRAINT z_lvr_land_a_park_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_a z_lvr_land_a_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a
    ADD CONSTRAINT z_lvr_land_a_pkey PRIMARY KEY ("編號");


--
-- Name: z_lvr_land_b_land z_lvr_land_b_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_land
    ADD CONSTRAINT z_lvr_land_b_land_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_b_park z_lvr_land_b_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_park
    ADD CONSTRAINT z_lvr_land_b_park_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_b z_lvr_land_b_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b
    ADD CONSTRAINT z_lvr_land_b_pkey PRIMARY KEY ("編號");


--
-- Name: z_lvr_land_c_build z_lvr_land_c_build_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_build
    ADD CONSTRAINT z_lvr_land_c_build_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_c_land z_lvr_land_c_land_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_land
    ADD CONSTRAINT z_lvr_land_c_land_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_c_park z_lvr_land_c_park_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_park
    ADD CONSTRAINT z_lvr_land_c_park_pkey PRIMARY KEY (id);


--
-- Name: z_lvr_land_c z_lvr_land_c_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c
    ADD CONSTRAINT z_lvr_land_c_pkey PRIMARY KEY ("編號");


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_a_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_build_編號" ON public.a_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_a_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_land_編號" ON public.a_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_a_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_park_編號" ON public.a_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_a_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_交易日" ON public.a_lvr_land_a USING btree ("交易日");


--
-- Name: idx_a_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_交易總價" ON public.a_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_a_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_建物型態" ON public.a_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_a_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_a_行政區" ON public.a_lvr_land_a USING btree ("行政區");


--
-- Name: idx_a_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_b_land_編號" ON public.a_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_a_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_b_park_編號" ON public.a_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_a_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_b_交易日" ON public.a_lvr_land_b USING btree ("交易日");


--
-- Name: idx_a_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_b_建案名稱" ON public.a_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_a_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_b_行政區" ON public.a_lvr_land_b USING btree ("行政區");


--
-- Name: idx_a_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_c_build_編號" ON public.a_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_a_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_c_land_編號" ON public.a_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_a_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_c_park_編號" ON public.a_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_a_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_c_交易日" ON public.a_lvr_land_c USING btree ("交易日");


--
-- Name: idx_a_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_a_lvr_land_c_行政區" ON public.a_lvr_land_c USING btree ("行政區");


--
-- Name: idx_b_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_build_編號" ON public.b_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_b_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_land_編號" ON public.b_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_b_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_park_編號" ON public.b_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_b_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_交易日" ON public.b_lvr_land_a USING btree ("交易日");


--
-- Name: idx_b_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_交易總價" ON public.b_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_b_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_建物型態" ON public.b_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_b_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_a_行政區" ON public.b_lvr_land_a USING btree ("行政區");


--
-- Name: idx_b_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_b_land_編號" ON public.b_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_b_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_b_park_編號" ON public.b_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_b_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_b_交易日" ON public.b_lvr_land_b USING btree ("交易日");


--
-- Name: idx_b_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_b_建案名稱" ON public.b_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_b_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_b_行政區" ON public.b_lvr_land_b USING btree ("行政區");


--
-- Name: idx_b_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_c_build_編號" ON public.b_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_b_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_c_land_編號" ON public.b_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_b_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_c_park_編號" ON public.b_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_b_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_c_交易日" ON public.b_lvr_land_c USING btree ("交易日");


--
-- Name: idx_b_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_b_lvr_land_c_行政區" ON public.b_lvr_land_c USING btree ("行政區");


--
-- Name: idx_c_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_build_編號" ON public.c_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_c_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_land_編號" ON public.c_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_c_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_park_編號" ON public.c_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_c_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_交易日" ON public.c_lvr_land_a USING btree ("交易日");


--
-- Name: idx_c_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_交易總價" ON public.c_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_c_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_建物型態" ON public.c_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_c_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_a_行政區" ON public.c_lvr_land_a USING btree ("行政區");


--
-- Name: idx_c_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_b_land_編號" ON public.c_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_c_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_b_park_編號" ON public.c_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_c_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_b_交易日" ON public.c_lvr_land_b USING btree ("交易日");


--
-- Name: idx_c_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_b_建案名稱" ON public.c_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_c_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_b_行政區" ON public.c_lvr_land_b USING btree ("行政區");


--
-- Name: idx_c_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_c_build_編號" ON public.c_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_c_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_c_land_編號" ON public.c_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_c_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_c_park_編號" ON public.c_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_c_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_c_交易日" ON public.c_lvr_land_c USING btree ("交易日");


--
-- Name: idx_c_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_c_lvr_land_c_行政區" ON public.c_lvr_land_c USING btree ("行政區");


--
-- Name: idx_county_name_zh; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_county_name_zh ON public.county_codes USING btree (name_zh);


--
-- Name: idx_d_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_build_編號" ON public.d_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_d_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_land_編號" ON public.d_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_d_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_park_編號" ON public.d_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_d_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_交易日" ON public.d_lvr_land_a USING btree ("交易日");


--
-- Name: idx_d_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_交易總價" ON public.d_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_d_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_建物型態" ON public.d_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_d_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_a_行政區" ON public.d_lvr_land_a USING btree ("行政區");


--
-- Name: idx_d_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_b_land_編號" ON public.d_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_d_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_b_park_編號" ON public.d_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_d_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_b_交易日" ON public.d_lvr_land_b USING btree ("交易日");


--
-- Name: idx_d_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_b_建案名稱" ON public.d_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_d_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_b_行政區" ON public.d_lvr_land_b USING btree ("行政區");


--
-- Name: idx_d_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_c_build_編號" ON public.d_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_d_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_c_land_編號" ON public.d_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_d_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_c_park_編號" ON public.d_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_d_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_c_交易日" ON public.d_lvr_land_c USING btree ("交易日");


--
-- Name: idx_d_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_d_lvr_land_c_行政區" ON public.d_lvr_land_c USING btree ("行政區");


--
-- Name: idx_e_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_build_編號" ON public.e_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_e_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_land_編號" ON public.e_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_e_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_park_編號" ON public.e_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_e_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_交易日" ON public.e_lvr_land_a USING btree ("交易日");


--
-- Name: idx_e_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_交易總價" ON public.e_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_e_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_建物型態" ON public.e_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_e_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_a_行政區" ON public.e_lvr_land_a USING btree ("行政區");


--
-- Name: idx_e_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_b_land_編號" ON public.e_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_e_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_b_park_編號" ON public.e_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_e_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_b_交易日" ON public.e_lvr_land_b USING btree ("交易日");


--
-- Name: idx_e_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_b_建案名稱" ON public.e_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_e_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_b_行政區" ON public.e_lvr_land_b USING btree ("行政區");


--
-- Name: idx_e_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_c_build_編號" ON public.e_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_e_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_c_land_編號" ON public.e_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_e_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_c_park_編號" ON public.e_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_e_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_c_交易日" ON public.e_lvr_land_c USING btree ("交易日");


--
-- Name: idx_e_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_e_lvr_land_c_行政區" ON public.e_lvr_land_c USING btree ("行政區");


--
-- Name: idx_f_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_build_編號" ON public.f_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_f_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_land_編號" ON public.f_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_f_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_park_編號" ON public.f_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_f_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_交易日" ON public.f_lvr_land_a USING btree ("交易日");


--
-- Name: idx_f_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_交易總價" ON public.f_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_f_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_建物型態" ON public.f_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_f_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_a_行政區" ON public.f_lvr_land_a USING btree ("行政區");


--
-- Name: idx_f_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_b_land_編號" ON public.f_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_f_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_b_park_編號" ON public.f_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_f_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_b_交易日" ON public.f_lvr_land_b USING btree ("交易日");


--
-- Name: idx_f_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_b_建案名稱" ON public.f_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_f_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_b_行政區" ON public.f_lvr_land_b USING btree ("行政區");


--
-- Name: idx_f_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_c_build_編號" ON public.f_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_f_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_c_land_編號" ON public.f_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_f_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_c_park_編號" ON public.f_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_f_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_c_交易日" ON public.f_lvr_land_c USING btree ("交易日");


--
-- Name: idx_f_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_f_lvr_land_c_行政區" ON public.f_lvr_land_c USING btree ("行政區");


--
-- Name: idx_g_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_build_編號" ON public.g_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_g_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_land_編號" ON public.g_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_g_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_park_編號" ON public.g_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_g_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_交易日" ON public.g_lvr_land_a USING btree ("交易日");


--
-- Name: idx_g_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_交易總價" ON public.g_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_g_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_建物型態" ON public.g_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_g_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_a_行政區" ON public.g_lvr_land_a USING btree ("行政區");


--
-- Name: idx_g_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_b_land_編號" ON public.g_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_g_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_b_park_編號" ON public.g_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_g_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_b_交易日" ON public.g_lvr_land_b USING btree ("交易日");


--
-- Name: idx_g_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_b_建案名稱" ON public.g_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_g_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_b_行政區" ON public.g_lvr_land_b USING btree ("行政區");


--
-- Name: idx_g_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_c_build_編號" ON public.g_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_g_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_c_land_編號" ON public.g_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_g_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_c_park_編號" ON public.g_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_g_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_c_交易日" ON public.g_lvr_land_c USING btree ("交易日");


--
-- Name: idx_g_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_g_lvr_land_c_行政區" ON public.g_lvr_land_c USING btree ("行政區");


--
-- Name: idx_h_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_build_編號" ON public.h_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_h_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_land_編號" ON public.h_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_h_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_park_編號" ON public.h_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_h_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_交易日" ON public.h_lvr_land_a USING btree ("交易日");


--
-- Name: idx_h_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_交易總價" ON public.h_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_h_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_建物型態" ON public.h_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_h_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_a_行政區" ON public.h_lvr_land_a USING btree ("行政區");


--
-- Name: idx_h_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_b_land_編號" ON public.h_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_h_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_b_park_編號" ON public.h_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_h_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_b_交易日" ON public.h_lvr_land_b USING btree ("交易日");


--
-- Name: idx_h_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_b_建案名稱" ON public.h_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_h_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_b_行政區" ON public.h_lvr_land_b USING btree ("行政區");


--
-- Name: idx_h_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_c_build_編號" ON public.h_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_h_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_c_land_編號" ON public.h_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_h_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_c_park_編號" ON public.h_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_h_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_c_交易日" ON public.h_lvr_land_c USING btree ("交易日");


--
-- Name: idx_h_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_h_lvr_land_c_行政區" ON public.h_lvr_land_c USING btree ("行政區");


--
-- Name: idx_i_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_build_編號" ON public.i_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_i_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_land_編號" ON public.i_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_i_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_park_編號" ON public.i_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_i_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_交易日" ON public.i_lvr_land_a USING btree ("交易日");


--
-- Name: idx_i_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_交易總價" ON public.i_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_i_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_建物型態" ON public.i_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_i_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_a_行政區" ON public.i_lvr_land_a USING btree ("行政區");


--
-- Name: idx_i_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_b_land_編號" ON public.i_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_i_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_b_park_編號" ON public.i_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_i_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_b_交易日" ON public.i_lvr_land_b USING btree ("交易日");


--
-- Name: idx_i_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_b_建案名稱" ON public.i_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_i_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_b_行政區" ON public.i_lvr_land_b USING btree ("行政區");


--
-- Name: idx_i_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_c_build_編號" ON public.i_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_i_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_c_land_編號" ON public.i_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_i_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_c_park_編號" ON public.i_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_i_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_c_交易日" ON public.i_lvr_land_c USING btree ("交易日");


--
-- Name: idx_i_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_i_lvr_land_c_行政區" ON public.i_lvr_land_c USING btree ("行政區");


--
-- Name: idx_j_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_build_編號" ON public.j_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_j_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_land_編號" ON public.j_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_j_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_park_編號" ON public.j_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_j_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_交易日" ON public.j_lvr_land_a USING btree ("交易日");


--
-- Name: idx_j_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_交易總價" ON public.j_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_j_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_建物型態" ON public.j_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_j_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_a_行政區" ON public.j_lvr_land_a USING btree ("行政區");


--
-- Name: idx_j_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_b_land_編號" ON public.j_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_j_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_b_park_編號" ON public.j_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_j_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_b_交易日" ON public.j_lvr_land_b USING btree ("交易日");


--
-- Name: idx_j_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_b_建案名稱" ON public.j_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_j_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_b_行政區" ON public.j_lvr_land_b USING btree ("行政區");


--
-- Name: idx_j_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_c_build_編號" ON public.j_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_j_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_c_land_編號" ON public.j_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_j_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_c_park_編號" ON public.j_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_j_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_c_交易日" ON public.j_lvr_land_c USING btree ("交易日");


--
-- Name: idx_j_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_j_lvr_land_c_行政區" ON public.j_lvr_land_c USING btree ("行政區");


--
-- Name: idx_k_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_build_編號" ON public.k_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_k_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_land_編號" ON public.k_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_k_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_park_編號" ON public.k_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_k_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_交易日" ON public.k_lvr_land_a USING btree ("交易日");


--
-- Name: idx_k_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_交易總價" ON public.k_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_k_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_建物型態" ON public.k_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_k_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_a_行政區" ON public.k_lvr_land_a USING btree ("行政區");


--
-- Name: idx_k_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_b_land_編號" ON public.k_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_k_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_b_park_編號" ON public.k_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_k_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_b_交易日" ON public.k_lvr_land_b USING btree ("交易日");


--
-- Name: idx_k_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_b_建案名稱" ON public.k_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_k_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_b_行政區" ON public.k_lvr_land_b USING btree ("行政區");


--
-- Name: idx_k_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_c_build_編號" ON public.k_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_k_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_c_land_編號" ON public.k_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_k_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_c_park_編號" ON public.k_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_k_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_c_交易日" ON public.k_lvr_land_c USING btree ("交易日");


--
-- Name: idx_k_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_k_lvr_land_c_行政區" ON public.k_lvr_land_c USING btree ("行政區");


--
-- Name: idx_m_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_build_編號" ON public.m_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_m_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_land_編號" ON public.m_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_m_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_park_編號" ON public.m_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_m_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_交易日" ON public.m_lvr_land_a USING btree ("交易日");


--
-- Name: idx_m_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_交易總價" ON public.m_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_m_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_建物型態" ON public.m_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_m_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_a_行政區" ON public.m_lvr_land_a USING btree ("行政區");


--
-- Name: idx_m_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_b_land_編號" ON public.m_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_m_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_b_park_編號" ON public.m_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_m_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_b_交易日" ON public.m_lvr_land_b USING btree ("交易日");


--
-- Name: idx_m_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_b_建案名稱" ON public.m_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_m_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_b_行政區" ON public.m_lvr_land_b USING btree ("行政區");


--
-- Name: idx_m_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_c_build_編號" ON public.m_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_m_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_c_land_編號" ON public.m_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_m_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_c_park_編號" ON public.m_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_m_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_c_交易日" ON public.m_lvr_land_c USING btree ("交易日");


--
-- Name: idx_m_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_m_lvr_land_c_行政區" ON public.m_lvr_land_c USING btree ("行政區");


--
-- Name: idx_n_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_build_編號" ON public.n_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_n_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_land_編號" ON public.n_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_n_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_park_編號" ON public.n_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_n_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_交易日" ON public.n_lvr_land_a USING btree ("交易日");


--
-- Name: idx_n_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_交易總價" ON public.n_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_n_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_建物型態" ON public.n_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_n_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_a_行政區" ON public.n_lvr_land_a USING btree ("行政區");


--
-- Name: idx_n_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_b_land_編號" ON public.n_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_n_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_b_park_編號" ON public.n_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_n_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_b_交易日" ON public.n_lvr_land_b USING btree ("交易日");


--
-- Name: idx_n_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_b_建案名稱" ON public.n_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_n_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_b_行政區" ON public.n_lvr_land_b USING btree ("行政區");


--
-- Name: idx_n_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_c_build_編號" ON public.n_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_n_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_c_land_編號" ON public.n_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_n_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_c_park_編號" ON public.n_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_n_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_c_交易日" ON public.n_lvr_land_c USING btree ("交易日");


--
-- Name: idx_n_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_n_lvr_land_c_行政區" ON public.n_lvr_land_c USING btree ("行政區");


--
-- Name: idx_o_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_build_編號" ON public.o_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_o_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_land_編號" ON public.o_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_o_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_park_編號" ON public.o_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_o_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_交易日" ON public.o_lvr_land_a USING btree ("交易日");


--
-- Name: idx_o_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_交易總價" ON public.o_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_o_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_建物型態" ON public.o_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_o_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_a_行政區" ON public.o_lvr_land_a USING btree ("行政區");


--
-- Name: idx_o_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_b_land_編號" ON public.o_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_o_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_b_park_編號" ON public.o_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_o_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_b_交易日" ON public.o_lvr_land_b USING btree ("交易日");


--
-- Name: idx_o_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_b_建案名稱" ON public.o_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_o_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_b_行政區" ON public.o_lvr_land_b USING btree ("行政區");


--
-- Name: idx_o_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_c_build_編號" ON public.o_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_o_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_c_land_編號" ON public.o_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_o_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_c_park_編號" ON public.o_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_o_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_c_交易日" ON public.o_lvr_land_c USING btree ("交易日");


--
-- Name: idx_o_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_o_lvr_land_c_行政區" ON public.o_lvr_land_c USING btree ("行政區");


--
-- Name: idx_p_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_build_編號" ON public.p_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_p_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_land_編號" ON public.p_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_p_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_park_編號" ON public.p_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_p_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_交易日" ON public.p_lvr_land_a USING btree ("交易日");


--
-- Name: idx_p_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_交易總價" ON public.p_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_p_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_建物型態" ON public.p_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_p_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_a_行政區" ON public.p_lvr_land_a USING btree ("行政區");


--
-- Name: idx_p_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_b_land_編號" ON public.p_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_p_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_b_park_編號" ON public.p_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_p_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_b_交易日" ON public.p_lvr_land_b USING btree ("交易日");


--
-- Name: idx_p_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_b_建案名稱" ON public.p_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_p_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_b_行政區" ON public.p_lvr_land_b USING btree ("行政區");


--
-- Name: idx_p_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_c_build_編號" ON public.p_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_p_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_c_land_編號" ON public.p_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_p_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_c_park_編號" ON public.p_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_p_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_c_交易日" ON public.p_lvr_land_c USING btree ("交易日");


--
-- Name: idx_p_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_p_lvr_land_c_行政區" ON public.p_lvr_land_c USING btree ("行政區");


--
-- Name: idx_project_rules_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_rules_score ON public.project_parsing_rules USING btree (confidence_score DESC);


--
-- Name: idx_q_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_build_編號" ON public.q_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_q_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_land_編號" ON public.q_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_q_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_park_編號" ON public.q_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_q_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_交易日" ON public.q_lvr_land_a USING btree ("交易日");


--
-- Name: idx_q_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_交易總價" ON public.q_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_q_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_建物型態" ON public.q_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_q_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_a_行政區" ON public.q_lvr_land_a USING btree ("行政區");


--
-- Name: idx_q_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_b_land_編號" ON public.q_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_q_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_b_park_編號" ON public.q_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_q_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_b_交易日" ON public.q_lvr_land_b USING btree ("交易日");


--
-- Name: idx_q_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_b_建案名稱" ON public.q_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_q_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_b_行政區" ON public.q_lvr_land_b USING btree ("行政區");


--
-- Name: idx_q_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_c_build_編號" ON public.q_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_q_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_c_land_編號" ON public.q_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_q_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_c_park_編號" ON public.q_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_q_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_c_交易日" ON public.q_lvr_land_c USING btree ("交易日");


--
-- Name: idx_q_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_q_lvr_land_c_行政區" ON public.q_lvr_land_c USING btree ("行政區");


--
-- Name: idx_shared_reports_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shared_reports_created_by ON public.shared_reports USING btree (created_by);


--
-- Name: idx_shared_reports_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shared_reports_token ON public.shared_reports USING btree (token);


--
-- Name: idx_t_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_build_編號" ON public.t_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_t_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_land_編號" ON public.t_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_t_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_park_編號" ON public.t_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_t_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_交易日" ON public.t_lvr_land_a USING btree ("交易日");


--
-- Name: idx_t_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_交易總價" ON public.t_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_t_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_建物型態" ON public.t_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_t_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_a_行政區" ON public.t_lvr_land_a USING btree ("行政區");


--
-- Name: idx_t_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_b_land_編號" ON public.t_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_t_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_b_park_編號" ON public.t_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_t_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_b_交易日" ON public.t_lvr_land_b USING btree ("交易日");


--
-- Name: idx_t_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_b_建案名稱" ON public.t_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_t_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_b_行政區" ON public.t_lvr_land_b USING btree ("行政區");


--
-- Name: idx_t_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_c_build_編號" ON public.t_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_t_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_c_land_編號" ON public.t_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_t_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_c_park_編號" ON public.t_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_t_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_c_交易日" ON public.t_lvr_land_c USING btree ("交易日");


--
-- Name: idx_t_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_t_lvr_land_c_行政區" ON public.t_lvr_land_c USING btree ("行政區");


--
-- Name: idx_u_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_build_編號" ON public.u_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_u_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_land_編號" ON public.u_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_u_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_park_編號" ON public.u_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_u_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_交易日" ON public.u_lvr_land_a USING btree ("交易日");


--
-- Name: idx_u_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_交易總價" ON public.u_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_u_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_建物型態" ON public.u_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_u_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_a_行政區" ON public.u_lvr_land_a USING btree ("行政區");


--
-- Name: idx_u_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_b_land_編號" ON public.u_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_u_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_b_park_編號" ON public.u_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_u_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_b_交易日" ON public.u_lvr_land_b USING btree ("交易日");


--
-- Name: idx_u_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_b_建案名稱" ON public.u_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_u_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_b_行政區" ON public.u_lvr_land_b USING btree ("行政區");


--
-- Name: idx_u_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_c_build_編號" ON public.u_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_u_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_c_land_編號" ON public.u_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_u_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_c_park_編號" ON public.u_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_u_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_c_交易日" ON public.u_lvr_land_c USING btree ("交易日");


--
-- Name: idx_u_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_u_lvr_land_c_行政區" ON public.u_lvr_land_c USING btree ("行政區");


--
-- Name: idx_v_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_build_編號" ON public.v_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_v_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_land_編號" ON public.v_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_v_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_park_編號" ON public.v_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_v_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_交易日" ON public.v_lvr_land_a USING btree ("交易日");


--
-- Name: idx_v_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_交易總價" ON public.v_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_v_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_建物型態" ON public.v_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_v_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_a_行政區" ON public.v_lvr_land_a USING btree ("行政區");


--
-- Name: idx_v_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_b_land_編號" ON public.v_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_v_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_b_park_編號" ON public.v_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_v_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_b_交易日" ON public.v_lvr_land_b USING btree ("交易日");


--
-- Name: idx_v_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_b_建案名稱" ON public.v_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_v_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_b_行政區" ON public.v_lvr_land_b USING btree ("行政區");


--
-- Name: idx_v_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_c_build_編號" ON public.v_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_v_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_c_land_編號" ON public.v_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_v_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_c_park_編號" ON public.v_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_v_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_c_交易日" ON public.v_lvr_land_c USING btree ("交易日");


--
-- Name: idx_v_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_v_lvr_land_c_行政區" ON public.v_lvr_land_c USING btree ("行政區");


--
-- Name: idx_w_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_build_編號" ON public.w_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_w_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_land_編號" ON public.w_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_w_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_park_編號" ON public.w_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_w_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_交易日" ON public.w_lvr_land_a USING btree ("交易日");


--
-- Name: idx_w_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_交易總價" ON public.w_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_w_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_建物型態" ON public.w_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_w_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_a_行政區" ON public.w_lvr_land_a USING btree ("行政區");


--
-- Name: idx_w_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_b_land_編號" ON public.w_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_w_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_b_park_編號" ON public.w_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_w_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_b_交易日" ON public.w_lvr_land_b USING btree ("交易日");


--
-- Name: idx_w_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_b_建案名稱" ON public.w_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_w_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_b_行政區" ON public.w_lvr_land_b USING btree ("行政區");


--
-- Name: idx_w_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_c_build_編號" ON public.w_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_w_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_c_land_編號" ON public.w_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_w_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_c_park_編號" ON public.w_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_w_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_c_交易日" ON public.w_lvr_land_c USING btree ("交易日");


--
-- Name: idx_w_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_w_lvr_land_c_行政區" ON public.w_lvr_land_c USING btree ("行政區");


--
-- Name: idx_x_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_build_編號" ON public.x_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_x_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_land_編號" ON public.x_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_x_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_park_編號" ON public.x_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_x_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_交易日" ON public.x_lvr_land_a USING btree ("交易日");


--
-- Name: idx_x_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_交易總價" ON public.x_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_x_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_建物型態" ON public.x_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_x_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_a_行政區" ON public.x_lvr_land_a USING btree ("行政區");


--
-- Name: idx_x_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_b_land_編號" ON public.x_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_x_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_b_park_編號" ON public.x_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_x_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_b_交易日" ON public.x_lvr_land_b USING btree ("交易日");


--
-- Name: idx_x_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_b_建案名稱" ON public.x_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_x_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_b_行政區" ON public.x_lvr_land_b USING btree ("行政區");


--
-- Name: idx_x_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_c_build_編號" ON public.x_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_x_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_c_land_編號" ON public.x_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_x_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_c_park_編號" ON public.x_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_x_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_c_交易日" ON public.x_lvr_land_c USING btree ("交易日");


--
-- Name: idx_x_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_x_lvr_land_c_行政區" ON public.x_lvr_land_c USING btree ("行政區");


--
-- Name: idx_z_lvr_land_a_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_build_編號" ON public.z_lvr_land_a_build USING btree ("編號");


--
-- Name: idx_z_lvr_land_a_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_land_編號" ON public.z_lvr_land_a_land USING btree ("編號");


--
-- Name: idx_z_lvr_land_a_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_park_編號" ON public.z_lvr_land_a_park USING btree ("編號");


--
-- Name: idx_z_lvr_land_a_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_交易日" ON public.z_lvr_land_a USING btree ("交易日");


--
-- Name: idx_z_lvr_land_a_交易總價; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_交易總價" ON public.z_lvr_land_a USING btree ("交易總價");


--
-- Name: idx_z_lvr_land_a_建物型態; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_建物型態" ON public.z_lvr_land_a USING btree ("建物型態");


--
-- Name: idx_z_lvr_land_a_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_a_行政區" ON public.z_lvr_land_a USING btree ("行政區");


--
-- Name: idx_z_lvr_land_b_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_b_land_編號" ON public.z_lvr_land_b_land USING btree ("編號");


--
-- Name: idx_z_lvr_land_b_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_b_park_編號" ON public.z_lvr_land_b_park USING btree ("編號");


--
-- Name: idx_z_lvr_land_b_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_b_交易日" ON public.z_lvr_land_b USING btree ("交易日");


--
-- Name: idx_z_lvr_land_b_建案名稱; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_b_建案名稱" ON public.z_lvr_land_b USING btree ("建案名稱");


--
-- Name: idx_z_lvr_land_b_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_b_行政區" ON public.z_lvr_land_b USING btree ("行政區");


--
-- Name: idx_z_lvr_land_c_build_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_c_build_編號" ON public.z_lvr_land_c_build USING btree ("編號");


--
-- Name: idx_z_lvr_land_c_land_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_c_land_編號" ON public.z_lvr_land_c_land USING btree ("編號");


--
-- Name: idx_z_lvr_land_c_park_編號; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_c_park_編號" ON public.z_lvr_land_c_park USING btree ("編號");


--
-- Name: idx_z_lvr_land_c_交易日; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_c_交易日" ON public.z_lvr_land_c USING btree ("交易日");


--
-- Name: idx_z_lvr_land_c_行政區; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_z_lvr_land_c_行政區" ON public.z_lvr_land_c USING btree ("行政區");


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: a_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: a_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: a_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: a_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: a_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.a_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: b_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: b_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: b_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: b_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.b_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: c_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: c_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: c_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: c_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.c_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: d_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: d_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: d_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: d_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.d_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: e_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: e_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: e_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: e_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.e_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: f_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: f_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: f_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: f_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.f_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: g_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: g_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: g_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: g_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.g_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: h_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: h_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: h_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: h_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.h_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: i_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: i_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: i_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: i_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.i_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: j_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: j_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: j_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: j_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.j_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: k_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: k_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: k_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: k_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.k_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: m_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: m_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: m_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: m_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.m_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: n_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: n_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: n_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: n_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.n_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: o_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: o_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: o_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: o_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.o_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: p_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: p_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: p_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: p_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.p_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: q_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: q_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: q_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: q_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.q_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: t_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: t_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: t_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: t_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.t_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: u_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: u_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: u_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: u_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.u_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: v_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: v_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: v_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: v_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.v_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: w_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: w_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: w_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: w_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.w_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: x_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: x_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: x_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: x_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.x_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_a trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_a FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: z_lvr_land_a_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_a_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_a_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_a_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_b trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_b FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: z_lvr_land_b_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_b_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_b_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_b_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_c trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_c FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_main_tables_fields();


--
-- Name: z_lvr_land_c_build trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_c_build FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_c_land trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_c_land FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: z_lvr_land_c_park trg_calculate_fields; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_calculate_fields BEFORE INSERT OR UPDATE ON public.z_lvr_land_c_park FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_sub_tables_fields();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: a_lvr_land_a_build fk_a_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_build
    ADD CONSTRAINT fk_a_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_a_land fk_a_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_land
    ADD CONSTRAINT fk_a_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_a_park fk_a_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_a_park
    ADD CONSTRAINT fk_a_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_b_land fk_a_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_land
    ADD CONSTRAINT fk_a_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_b_park fk_a_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_b_park
    ADD CONSTRAINT fk_a_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_c_build fk_a_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_build
    ADD CONSTRAINT fk_a_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_c_land fk_a_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_land
    ADD CONSTRAINT fk_a_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: a_lvr_land_c_park fk_a_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.a_lvr_land_c_park
    ADD CONSTRAINT fk_a_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.a_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_a_build fk_b_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_build
    ADD CONSTRAINT fk_b_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_a_land fk_b_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_land
    ADD CONSTRAINT fk_b_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_a_park fk_b_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_a_park
    ADD CONSTRAINT fk_b_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_b_land fk_b_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_land
    ADD CONSTRAINT fk_b_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_b_park fk_b_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_b_park
    ADD CONSTRAINT fk_b_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_c_build fk_b_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_build
    ADD CONSTRAINT fk_b_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_c_land fk_b_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_land
    ADD CONSTRAINT fk_b_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: b_lvr_land_c_park fk_b_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b_lvr_land_c_park
    ADD CONSTRAINT fk_b_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.b_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_a_build fk_c_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_build
    ADD CONSTRAINT fk_c_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_a_land fk_c_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_land
    ADD CONSTRAINT fk_c_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_a_park fk_c_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_a_park
    ADD CONSTRAINT fk_c_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_b_land fk_c_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_land
    ADD CONSTRAINT fk_c_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_b_park fk_c_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_b_park
    ADD CONSTRAINT fk_c_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_c_build fk_c_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_build
    ADD CONSTRAINT fk_c_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_c_land fk_c_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_land
    ADD CONSTRAINT fk_c_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: c_lvr_land_c_park fk_c_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.c_lvr_land_c_park
    ADD CONSTRAINT fk_c_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.c_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_a_build fk_d_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_build
    ADD CONSTRAINT fk_d_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_a_land fk_d_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_land
    ADD CONSTRAINT fk_d_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_a_park fk_d_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_a_park
    ADD CONSTRAINT fk_d_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_b_land fk_d_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_land
    ADD CONSTRAINT fk_d_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_b_park fk_d_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_b_park
    ADD CONSTRAINT fk_d_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_c_build fk_d_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_build
    ADD CONSTRAINT fk_d_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_c_land fk_d_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_land
    ADD CONSTRAINT fk_d_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: d_lvr_land_c_park fk_d_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.d_lvr_land_c_park
    ADD CONSTRAINT fk_d_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.d_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_a_build fk_e_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_build
    ADD CONSTRAINT fk_e_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_a_land fk_e_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_land
    ADD CONSTRAINT fk_e_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_a_park fk_e_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_a_park
    ADD CONSTRAINT fk_e_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_b_land fk_e_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_land
    ADD CONSTRAINT fk_e_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_b_park fk_e_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_b_park
    ADD CONSTRAINT fk_e_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_c_build fk_e_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_build
    ADD CONSTRAINT fk_e_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_c_land fk_e_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_land
    ADD CONSTRAINT fk_e_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: e_lvr_land_c_park fk_e_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.e_lvr_land_c_park
    ADD CONSTRAINT fk_e_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.e_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_a_build fk_f_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_build
    ADD CONSTRAINT fk_f_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_a_land fk_f_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_land
    ADD CONSTRAINT fk_f_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_a_park fk_f_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_a_park
    ADD CONSTRAINT fk_f_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_b_land fk_f_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_land
    ADD CONSTRAINT fk_f_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_b_park fk_f_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_b_park
    ADD CONSTRAINT fk_f_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_c_build fk_f_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_build
    ADD CONSTRAINT fk_f_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_c_land fk_f_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_land
    ADD CONSTRAINT fk_f_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: f_lvr_land_c_park fk_f_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.f_lvr_land_c_park
    ADD CONSTRAINT fk_f_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.f_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_a_build fk_g_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_build
    ADD CONSTRAINT fk_g_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_a_land fk_g_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_land
    ADD CONSTRAINT fk_g_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_a_park fk_g_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_a_park
    ADD CONSTRAINT fk_g_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_b_land fk_g_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_land
    ADD CONSTRAINT fk_g_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_b_park fk_g_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_b_park
    ADD CONSTRAINT fk_g_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_c_build fk_g_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_build
    ADD CONSTRAINT fk_g_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_c_land fk_g_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_land
    ADD CONSTRAINT fk_g_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: g_lvr_land_c_park fk_g_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.g_lvr_land_c_park
    ADD CONSTRAINT fk_g_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.g_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_a_build fk_h_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_build
    ADD CONSTRAINT fk_h_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_a_land fk_h_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_land
    ADD CONSTRAINT fk_h_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_a_park fk_h_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_a_park
    ADD CONSTRAINT fk_h_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_b_land fk_h_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_land
    ADD CONSTRAINT fk_h_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_b_park fk_h_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_b_park
    ADD CONSTRAINT fk_h_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_c_build fk_h_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_build
    ADD CONSTRAINT fk_h_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_c_land fk_h_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_land
    ADD CONSTRAINT fk_h_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: h_lvr_land_c_park fk_h_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.h_lvr_land_c_park
    ADD CONSTRAINT fk_h_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.h_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_a_build fk_i_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_build
    ADD CONSTRAINT fk_i_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_a_land fk_i_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_land
    ADD CONSTRAINT fk_i_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_a_park fk_i_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_a_park
    ADD CONSTRAINT fk_i_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_b_land fk_i_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_land
    ADD CONSTRAINT fk_i_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_b_park fk_i_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_b_park
    ADD CONSTRAINT fk_i_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_c_build fk_i_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_build
    ADD CONSTRAINT fk_i_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_c_land fk_i_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_land
    ADD CONSTRAINT fk_i_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: i_lvr_land_c_park fk_i_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.i_lvr_land_c_park
    ADD CONSTRAINT fk_i_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.i_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_a_build fk_j_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_build
    ADD CONSTRAINT fk_j_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_a_land fk_j_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_land
    ADD CONSTRAINT fk_j_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_a_park fk_j_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_a_park
    ADD CONSTRAINT fk_j_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_b_land fk_j_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_land
    ADD CONSTRAINT fk_j_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_b_park fk_j_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_b_park
    ADD CONSTRAINT fk_j_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_c_build fk_j_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_build
    ADD CONSTRAINT fk_j_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_c_land fk_j_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_land
    ADD CONSTRAINT fk_j_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: j_lvr_land_c_park fk_j_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.j_lvr_land_c_park
    ADD CONSTRAINT fk_j_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.j_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_a_build fk_k_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_build
    ADD CONSTRAINT fk_k_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_a_land fk_k_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_land
    ADD CONSTRAINT fk_k_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_a_park fk_k_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_a_park
    ADD CONSTRAINT fk_k_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_b_land fk_k_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_land
    ADD CONSTRAINT fk_k_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_b_park fk_k_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_b_park
    ADD CONSTRAINT fk_k_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_c_build fk_k_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_build
    ADD CONSTRAINT fk_k_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_c_land fk_k_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_land
    ADD CONSTRAINT fk_k_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: k_lvr_land_c_park fk_k_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.k_lvr_land_c_park
    ADD CONSTRAINT fk_k_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.k_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_a_build fk_m_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_build
    ADD CONSTRAINT fk_m_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_a_land fk_m_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_land
    ADD CONSTRAINT fk_m_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_a_park fk_m_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_a_park
    ADD CONSTRAINT fk_m_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_b_land fk_m_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_land
    ADD CONSTRAINT fk_m_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_b_park fk_m_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_b_park
    ADD CONSTRAINT fk_m_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_c_build fk_m_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_build
    ADD CONSTRAINT fk_m_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_c_land fk_m_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_land
    ADD CONSTRAINT fk_m_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: m_lvr_land_c_park fk_m_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.m_lvr_land_c_park
    ADD CONSTRAINT fk_m_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.m_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_a_build fk_n_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_build
    ADD CONSTRAINT fk_n_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_a_land fk_n_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_land
    ADD CONSTRAINT fk_n_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_a_park fk_n_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_a_park
    ADD CONSTRAINT fk_n_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_b_land fk_n_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_land
    ADD CONSTRAINT fk_n_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_b_park fk_n_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_b_park
    ADD CONSTRAINT fk_n_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_c_build fk_n_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_build
    ADD CONSTRAINT fk_n_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_c_land fk_n_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_land
    ADD CONSTRAINT fk_n_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: n_lvr_land_c_park fk_n_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.n_lvr_land_c_park
    ADD CONSTRAINT fk_n_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.n_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_a_build fk_o_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_build
    ADD CONSTRAINT fk_o_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_a_land fk_o_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_land
    ADD CONSTRAINT fk_o_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_a_park fk_o_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_a_park
    ADD CONSTRAINT fk_o_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_b_land fk_o_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_land
    ADD CONSTRAINT fk_o_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_b_park fk_o_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_b_park
    ADD CONSTRAINT fk_o_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_c_build fk_o_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_build
    ADD CONSTRAINT fk_o_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_c_land fk_o_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_land
    ADD CONSTRAINT fk_o_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: o_lvr_land_c_park fk_o_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.o_lvr_land_c_park
    ADD CONSTRAINT fk_o_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.o_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_a_build fk_p_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_build
    ADD CONSTRAINT fk_p_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_a_land fk_p_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_land
    ADD CONSTRAINT fk_p_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_a_park fk_p_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_a_park
    ADD CONSTRAINT fk_p_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_b_land fk_p_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_land
    ADD CONSTRAINT fk_p_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_b_park fk_p_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_b_park
    ADD CONSTRAINT fk_p_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_c_build fk_p_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_build
    ADD CONSTRAINT fk_p_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_c_land fk_p_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_land
    ADD CONSTRAINT fk_p_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: p_lvr_land_c_park fk_p_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.p_lvr_land_c_park
    ADD CONSTRAINT fk_p_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.p_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_a_build fk_q_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_build
    ADD CONSTRAINT fk_q_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_a_land fk_q_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_land
    ADD CONSTRAINT fk_q_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_a_park fk_q_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_a_park
    ADD CONSTRAINT fk_q_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_b_land fk_q_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_land
    ADD CONSTRAINT fk_q_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_b_park fk_q_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_b_park
    ADD CONSTRAINT fk_q_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_c_build fk_q_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_build
    ADD CONSTRAINT fk_q_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_c_land fk_q_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_land
    ADD CONSTRAINT fk_q_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: q_lvr_land_c_park fk_q_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.q_lvr_land_c_park
    ADD CONSTRAINT fk_q_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.q_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_a_build fk_t_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_build
    ADD CONSTRAINT fk_t_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_a_land fk_t_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_land
    ADD CONSTRAINT fk_t_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_a_park fk_t_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_a_park
    ADD CONSTRAINT fk_t_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_b_land fk_t_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_land
    ADD CONSTRAINT fk_t_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_b_park fk_t_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_b_park
    ADD CONSTRAINT fk_t_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_c_build fk_t_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_build
    ADD CONSTRAINT fk_t_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_c_land fk_t_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_land
    ADD CONSTRAINT fk_t_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: t_lvr_land_c_park fk_t_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.t_lvr_land_c_park
    ADD CONSTRAINT fk_t_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.t_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_a_build fk_u_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_build
    ADD CONSTRAINT fk_u_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_a_land fk_u_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_land
    ADD CONSTRAINT fk_u_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_a_park fk_u_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_a_park
    ADD CONSTRAINT fk_u_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_b_land fk_u_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_land
    ADD CONSTRAINT fk_u_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_b_park fk_u_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_b_park
    ADD CONSTRAINT fk_u_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_c_build fk_u_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_build
    ADD CONSTRAINT fk_u_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_c_land fk_u_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_land
    ADD CONSTRAINT fk_u_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: u_lvr_land_c_park fk_u_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.u_lvr_land_c_park
    ADD CONSTRAINT fk_u_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.u_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_a_build fk_v_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_build
    ADD CONSTRAINT fk_v_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_a_land fk_v_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_land
    ADD CONSTRAINT fk_v_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_a_park fk_v_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_a_park
    ADD CONSTRAINT fk_v_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_b_land fk_v_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_land
    ADD CONSTRAINT fk_v_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_b_park fk_v_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_b_park
    ADD CONSTRAINT fk_v_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_c_build fk_v_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_build
    ADD CONSTRAINT fk_v_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_c_land fk_v_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_land
    ADD CONSTRAINT fk_v_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: v_lvr_land_c_park fk_v_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.v_lvr_land_c_park
    ADD CONSTRAINT fk_v_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.v_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_a_build fk_w_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_build
    ADD CONSTRAINT fk_w_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_a_land fk_w_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_land
    ADD CONSTRAINT fk_w_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_a_park fk_w_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_a_park
    ADD CONSTRAINT fk_w_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_b_land fk_w_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_land
    ADD CONSTRAINT fk_w_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_b_park fk_w_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_b_park
    ADD CONSTRAINT fk_w_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_c_build fk_w_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_build
    ADD CONSTRAINT fk_w_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_c_land fk_w_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_land
    ADD CONSTRAINT fk_w_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: w_lvr_land_c_park fk_w_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.w_lvr_land_c_park
    ADD CONSTRAINT fk_w_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.w_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_a_build fk_x_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_build
    ADD CONSTRAINT fk_x_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_a_land fk_x_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_land
    ADD CONSTRAINT fk_x_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_a_park fk_x_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_a_park
    ADD CONSTRAINT fk_x_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_b_land fk_x_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_land
    ADD CONSTRAINT fk_x_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_b_park fk_x_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_b_park
    ADD CONSTRAINT fk_x_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_c_build fk_x_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_build
    ADD CONSTRAINT fk_x_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_c_land fk_x_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_land
    ADD CONSTRAINT fk_x_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: x_lvr_land_c_park fk_x_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.x_lvr_land_c_park
    ADD CONSTRAINT fk_x_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.x_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_a_build fk_z_a_build_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_build
    ADD CONSTRAINT fk_z_a_build_to_a FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_a_land fk_z_a_land_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_land
    ADD CONSTRAINT fk_z_a_land_to_a FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_a_park fk_z_a_park_to_a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_a_park
    ADD CONSTRAINT fk_z_a_park_to_a FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_a("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_b_land fk_z_b_land_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_land
    ADD CONSTRAINT fk_z_b_land_to_b FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_b_park fk_z_b_park_to_b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_b_park
    ADD CONSTRAINT fk_z_b_park_to_b FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_b("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_c_build fk_z_c_build_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_build
    ADD CONSTRAINT fk_z_c_build_to_c FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_c_land fk_z_c_land_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_land
    ADD CONSTRAINT fk_z_c_land_to_c FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: z_lvr_land_c_park fk_z_c_park_to_c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.z_lvr_land_c_park
    ADD CONSTRAINT fk_z_c_park_to_c FOREIGN KEY ("編號") REFERENCES public.z_lvr_land_c("編號") ON DELETE CASCADE;


--
-- Name: shared_reports shared_reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shared_reports
    ADD CONSTRAINT shared_reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: shared_reports Allow public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access" ON public.shared_reports FOR SELECT TO authenticated, anon USING (true);


--
-- Name: shared_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

