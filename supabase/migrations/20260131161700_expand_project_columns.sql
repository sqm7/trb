DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        -- Add new detail columns to existing tables
        EXECUTE format('
            ALTER TABLE public.%I 
            ADD COLUMN IF NOT EXISTS site_area text,
            ADD COLUMN IF NOT EXISTS total_households text,
            ADD COLUMN IF NOT EXISTS public_ratio text,
            ADD COLUMN IF NOT EXISTS total_floors text,
            ADD COLUMN IF NOT EXISTS basement_floors text,
            ADD COLUMN IF NOT EXISTS structure text,
            ADD COLUMN IF NOT EXISTS land_usage_zone text,
            ADD COLUMN IF NOT EXISTS parking_type text,
            ADD COLUMN IF NOT EXISTS parking_count text,
            ADD COLUMN IF NOT EXISTS developer text,
            ADD COLUMN IF NOT EXISTS contractor text,
            ADD COLUMN IF NOT EXISTS architect text,
            ADD COLUMN IF NOT EXISTS sales_agent text;
        ', table_name);

        -- Add comments for maintenance
        EXECUTE format('
            COMMENT ON COLUMN public.%I.site_area IS ''基地規模'';
            COMMENT ON COLUMN public.%I.total_households IS ''總戶數'';
            COMMENT ON COLUMN public.%I.public_ratio IS ''公設比'';
            COMMENT ON COLUMN public.%I.total_floors IS ''總樓層數'';
            COMMENT ON COLUMN public.%I.basement_floors IS ''地下層數'';
            COMMENT ON COLUMN public.%I.structure IS ''結構'';
            COMMENT ON COLUMN public.%I.land_usage_zone IS ''土地使用分區'';
            COMMENT ON COLUMN public.%I.parking_type IS ''車位類型'';
            COMMENT ON COLUMN public.%I.parking_count IS ''車位數量'';
            COMMENT ON COLUMN public.%I.developer IS ''建設公司'';
            COMMENT ON COLUMN public.%I.contractor IS ''工程營造'';
            COMMENT ON COLUMN public.%I.architect IS ''建築設計'';
            COMMENT ON COLUMN public.%I.sales_agent IS ''代銷企劃'';
        ', table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name, table_name);
        
    END LOOP;
END $$;
