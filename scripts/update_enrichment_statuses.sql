DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        -- Update default value to 'pending' (待補)
        EXECUTE format('
            ALTER TABLE public.%I 
            ALTER COLUMN enrichment_status SET DEFAULT ''pending'';
        ', table_name);

        -- Update comments to reflect new 3-state system
        EXECUTE format('
            COMMENT ON COLUMN public.%I.enrichment_status IS ''補全狀態: requested(代辦 - Agent執行), pending(待補 - 人工/等待), done(完備)'';
        ', table_name);

        -- Map existing 'pending' to 'pending' (already aligned)
        -- Map existing 'failed' back to 'pending' to follow the new 3-state rule
        EXECUTE format('
            UPDATE public.%I SET enrichment_status = ''pending'' WHERE enrichment_status = ''failed'';
        ', table_name);
        
    END LOOP;
END $$;
