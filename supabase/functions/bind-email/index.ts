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
        // 1. Authenticate user
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('Unauthorized')

        // 2. Parse body
        const { email, password } = await req.json()
        if (!email || !password) throw new Error('Email and password are required')

        // 3. Admin Update
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if email already exists (optional, but updateUserById returns nice error usually)

        console.log(`[Bind Email] Updating user ${user.id} to email ${email}`)

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                email: email,
                password: password,
                email_confirm: true, // Auto-confirm (skips old email verification)
                user_metadata: {
                    ...user.user_metadata,
                    provider: 'email' // Should we mark them as email provider now? Or just let them be mixed.
                    // Maybe don't change provider metadata just yet, or add it to providers list?
                    // User metadata 'provider' is used in UI. 
                    // If we assume they bind email, they become email/password capable.
                    // Let's not touch metadata unless necessary.
                }
            }
        )

        if (updateError) {
            console.error('[Bind Email] Update Error:', updateError)
            throw updateError
        }

        return new Response(
            JSON.stringify({
                message: 'Binding successful',
                user: updatedUser
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('[Bind Email] Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
