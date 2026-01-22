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
        const { email, password, current_password, action } = await req.json()

        // Handle Unbind Action (Revert to LINE placeholder)
        if (action === 'unbind') {
            console.log(`[Bind Email] Unbinding email for user ${user.id}`)

            // Verify LINE association
            const lineUserId = user.user_metadata?.line_user_id ?? user.app_metadata?.provider === 'line' ? user.id : null;
            if (!lineUserId) {
                throw new Error('No LINE account linked. Cannot unbind email.')
            }

            const placeholderEmail = `${lineUserId}@line.workaround`

            // Admin Update: Revert to placeholder and scramble password
            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
            )

            const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                user.id,
                {
                    email: placeholderEmail,
                    email_confirm: true,
                    password: crypto.randomUUID(), // Scramble password
                    user_metadata: {
                        ...user.user_metadata,
                        // Clear dismissal metadata
                        dismissed_new_email: null,
                        last_email_update: new Date().toISOString()
                    }
                }
            )

            if (updateError) throw updateError

            // Sync Profile
            await supabaseAdmin
                .from('profiles')
                .update({ email: placeholderEmail })
                .eq('id', user.id)

            return new Response(
                JSON.stringify({ message: 'Email unbound successfully', user: updatedUser }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!email) throw new Error('Email is required')

        // 3. Verify Identity (Critical for admin operations)
        // If user has 'line' provider, they might not have a password. 
        // If they are changing a "Wrong Email", they might have set a password previously.
        // If 'current_password' is provided, we MUST verify it.
        if (current_password) {
            const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                email: user.email!,
                password: current_password
            })
            if (signInError) throw new Error('Incorrect current password')
        }
        // If no current_password provided, rely on the valid JWT (user is logged in).
        // For extra security, frontend should require password if user has one.

        // 4. Admin Client
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Handle Cancel Action explicitly
        if (action === 'cancel') {
            console.log(`[Bind Email] Cancelling change for user ${user.id}`)
            const { data: adminUserData } = await supabaseAdmin.auth.admin.getUserById(user.id)
            const pendingEmail = adminUserData.user?.new_email

            if (pendingEmail) {
                const { error: dismissError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                    user_metadata: {
                        ...user.user_metadata,
                        dismissed_new_email: pendingEmail
                    }
                })
                if (dismissError) throw dismissError
            } else {
                // If no pending email found in backend, force clear the frontend warning by setting a dummy or clearing local state?
                // Actually, if pendingEmail is null, the frontend shouldn't show the warning anyway (user.new_email would be null).
                // Just in case, we can set dismissed to 'all' or similar? No, stick to logic.
            }

            return new Response(
                JSON.stringify({ message: 'Change cancelled (dismissed)' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 5. Check if this is a "Cancel" request (Legacy Param: Email == Current Email)
        if (email === user.email) {
            // Keep this for backward compatibility or just redirect to cancel logic
            return new Response(
                JSON.stringify({ message: 'No change detected' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 6. Normal Update (New Email)
        // Check for password update
        const updateAttributes: any = {
            email: email,
            email_confirm: true,
            // Clear any previous dismissal so warnings show up for new requests
            user_metadata: {
                ...user.user_metadata,
                dismissed_new_email: null,
                last_email_update: new Date().toISOString()
            },
            app_metadata: {
                ...user.app_metadata,
                // Ensure 'email' is added to providers list
                providers: [...new Set([...(user.app_metadata?.providers || []), 'email'])]
            }
        }
        if (password) updateAttributes.password = password

        console.log(`[Bind Email] Updating user ${user.id} to email ${email}`)

        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            updateAttributes
        )

        if (updateError) {
            console.error('[Bind Email] Update Error:', updateError)
            throw updateError
        }

        // 5. Sync to Profiles (Critical for UI consistency)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ email: email })
            .eq('id', user.id)

        if (profileError) {
            console.error('[Bind Email] Profile Sync Error:', profileError)
            // We don't throw here to avoid rolling back the auth change, 
            // but we log it. In a perfect world, we might want a transaction.
        }

        return new Response(
            JSON.stringify({
                message: 'Update successful',
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
