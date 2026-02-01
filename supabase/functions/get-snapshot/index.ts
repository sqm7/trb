import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Get Snapshot request received:", req.method, req.url);

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

        // Get Snapshot ID from URL query or body
        const url = new URL(req.url)
        const id = url.searchParams.get('id')

        if (!id) {
            console.error("Missing snapshot ID in request");
            throw new Error('Missing snapshot ID')
        }

        console.log("Fetching snapshot ID:", id);

        // Fetch Snapshot
        // Note: connecting as Service Role to increment view_count easily, 
        // but logic must enforce expiry check.
        const { data: snapshot, error: fetchError } = await supabaseClient
            .from('shared_snapshots')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !snapshot) {
            console.error("Fetch Error:", fetchError);
            return new Response(
                JSON.stringify({ error: 'Snapshot not found', details: fetchError?.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        console.log("Snapshot found:", snapshot.title);

        // Check Expiry
        const now = new Date();
        const expiry = new Date(snapshot.expires_at);
        if (expiry < now) {
            console.warn("Snapshot expired:", expiry.toISOString());
            // Optional: Delete it now since we found it expired
            await supabaseClient.from('shared_snapshots').delete().eq('id', id)

            return new Response(
                JSON.stringify({ error: 'This report has expired.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 410 } // 410 Gone
            )
        }

        // Increment View Count (Update directly as we don't have the RPC function yet)
        await supabaseClient
            .from('shared_snapshots')
            .update({ view_count: (snapshot.view_count || 0) + 1 })
            .eq('id', id)

        return new Response(
            JSON.stringify(snapshot),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error("Get Snapshot Fatal Error:", error);
        return new Response(
            JSON.stringify({ error: error.message, details: error.toString() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
