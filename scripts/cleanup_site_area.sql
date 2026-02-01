DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        -- Remove '坪' and any trailing non-numeric characters from site_area
        -- Using regex_replace to keep only digits and decimal point
        -- This maps '350坪' -> '350', '350.5坪' -> '350.5'
        EXECUTE format('
            UPDATE public.%I 
            SET site_area = regexp_replace(site_area, ''[^0-9.]'', '''', ''g'')
            WHERE site_area IS NOT NULL AND site_area ~ ''[^0-9.]'';
        ', table_name);
        
        -- Optional: Update column comment to clarify unit
        EXECUTE format('
            COMMENT ON COLUMN public.%I.site_area IS ''基地規模 (單位: 坪, 僅存數字)'';
        ', table_name);

    END LOOP;
END $$;
