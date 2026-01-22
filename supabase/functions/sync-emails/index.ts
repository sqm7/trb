import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Use Service Role to access all users and write to profiles
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch all Auth Users
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 1000
        })

        if (listError) throw listError

        const updates = []
        const errors = []

        console.log(`[Sync Emails] Found ${users.length} users. Starting sync...`)

        // 2. Iterate and Sync
        for (const user of users) {
            // Skip if email is missing or is a LINE workaround (optional, but usually we want to sync whatever is in Auth)
            if (!user.email) continue

            // Update Profile
            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ email: user.email })
                .eq('id', user.id)

            if (error) {
                console.error(`[Sync Emails] Failed for ${user.id} (${user.email}):`, error)
                errors.push({ id: user.id, email: user.email, error: error.message })
            } else {
                updates.push({ id: user.id, email: user.email })
            }
        }

        console.log(`[Sync Emails] Completed. Updated: ${updates.length}, Errors: ${errors.length}`)

        return new Response(
            JSON.stringify({
                message: 'Sync completed',
                total_users: users.length,
                updated_count: updates.length,
                updates: updates,
                errors: errors
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('[Sync Emails] Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
