DO $$
DECLARE
    city_code text;
    table_name text;
    codes text[] := ARRAY['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 't', 'u', 'v', 'w', 'x', 'z'];
BEGIN
    FOREACH city_code IN ARRAY codes
    LOOP
        table_name := city_code || '_projects';
        
        EXECUTE format('
            CREATE TABLE IF NOT EXISTS public.%I (
                id uuid DEFAULT gen_random_uuid() NOT NULL,
                project_name text NOT NULL,
                raw_project_name text,
                is_new_case boolean DEFAULT true,
                last_seen_at timestamp with time zone,
                created_at timestamp with time zone DEFAULT now(),
                CONSTRAINT %I_pkey PRIMARY KEY (id),
                CONSTRAINT %I_project_name_key UNIQUE (project_name)
            );

            ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;

            -- Allow public read access
            CREATE POLICY "Enable read access for all users" ON public.%I
            AS PERMISSIVE FOR SELECT
            TO public
            USING (true);

            -- Allow service_role full access
            CREATE POLICY "Enable all access for service_role" ON public.%I
            AS PERMISSIVE FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);

            COMMENT ON TABLE public.%I IS ''建案資料表 - 縣市代碼 %s'';
        ', 
        table_name, 
        table_name, table_name, 
        table_name, 
        table_name, 
        table_name, 
        table_name, city_code);
        
    END LOOP;
END $$;
