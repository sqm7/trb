DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        -- Add new detail columns to each county table
        EXECUTE format('
            ALTER TABLE public.%I 
            ADD COLUMN IF NOT EXISTS land_use_zoning TEXT,
            ADD COLUMN IF NOT EXISTS land_plot_number TEXT,
            ADD COLUMN IF NOT EXISTS community_unit_count INTEGER;
        ', table_name);

        -- RESET LOGIC: If we add new mandatory fields, previous 'done' records 
        -- should be moved back to 'requested' for the Agent to re-enrich.
        EXECUTE format('
            UPDATE public.%I 
            SET enrichment_status = ''requested''
            WHERE enrichment_status = ''done'';
        ', table_name);

        -- Add comments
        EXECUTE format('
            COMMENT ON COLUMN public.%I.land_use_zoning IS ''土地使用分區'';
            COMMENT ON COLUMN public.%I.land_plot_number IS ''地號'';
            COMMENT ON COLUMN public.%I.community_unit_count IS ''社區戶數'';
        ', table_name, table_name, table_name);
        
    END LOOP;
END $$;
