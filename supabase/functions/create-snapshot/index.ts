import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Request received:", req.method, req.url);

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase environment variables");
            throw new Error("Server configuration error: Missing environment variables");
        }

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseKey
        )

        // 1. Auth Check: Get User from Auth Header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            console.error("Missing Authorization Header");
            throw new Error('Missing Authorization Header')
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''))
        if (userError || !user) {
            console.error("Auth Error:", userError);
            throw new Error('Invalid Token')
        }

        console.log("User authenticated:", user.id);

        // 2. Role Check: Must be partner, admin, or super_admin
        // We can query the profile or just trust the RLS if we were inserting directly from client,
        // but in Edge Function we are Service Role, so we must check manually.
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError) {
            console.error("Profile lookup error:", profileError);
        }

        console.log("Profile role:", profile?.role);

        const allowedRoles = ['partner', 'admin', 'super_admin']
        if (!profile || !allowedRoles.includes(profile.role)) {
            console.error(`Unauthorized role: ${profile?.role}`);
            return new Response(
                JSON.stringify({ error: `Unauthorized: Partner role required. Your role is: ${profile?.role || 'none'}` }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        // 3. Parse Body
        const { title, config_json, duration_hours = 24 } = await req.json()

        if (!config_json) {
            throw new Error('Missing config_json')
        }

        // 4. Auto-Cleanup Strategy: Delete expired snapshots whenever a new one is created.
        // This keeps the DB clean without needing a separate cron job.
        // We use the function we created, or just run SQL.
        const { error: rpcError } = await supabaseClient.rpc('cleanup_expired_snapshots')
        if (rpcError) {
            console.warn("Cleanup warning:", rpcError); // Don't fail the request for this
        }

        // 5. Create New Snapshot
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + duration_hours)

        const { data, error } = await supabaseClient
            .from('shared_snapshots')
            .insert({
                creator_id: user.id,
                title: title || 'Untitled Snapshot',
                config_json,
                expires_at: expiresAt.toISOString()
            })
            .select('id')
            .single()

        if (error) {
            console.error("Insert error:", error);
            throw error
        }

        return new Response(
            JSON.stringify({ snapshot_id: data.id, expires_at: expiresAt }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error("Edge Function Fatal Error:", error);
        return new Response(
            JSON.stringify({ error: error.message, details: error.toString() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
