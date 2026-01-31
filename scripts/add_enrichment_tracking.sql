DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        -- Add tracking columns
        EXECUTE format('
            ALTER TABLE public.%I 
            ADD COLUMN IF NOT EXISTS enrichment_status text DEFAULT ''pending'',
            ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz;
        ', table_name);

        -- Add comments
        EXECUTE format('
            COMMENT ON COLUMN public.%I.enrichment_status IS ''補全狀態: pending(待處理), done(完成), failed(查無資料)'';
            COMMENT ON COLUMN public.%I.last_enriched_at IS ''最後執行補全的時間'';
        ', table_name, table_name);
        
    END LOOP;
END $$;
