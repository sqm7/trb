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
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        // 1. Verify Requesting User (Must be Admin)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('Invalid Token')

        const { data: requesterProfile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !requesterProfile || (requesterProfile.role !== 'admin' && requesterProfile.role !== 'super_admin')) {
            throw new Error('Unauthorized: Admin access required')
        }

        // 2. Parse Request Body
        const { targetUserId } = await req.json()
        if (!targetUserId) throw new Error('Target User ID is required')

        // Cannot delete self
        if (targetUserId === user.id) {
            throw new Error('Cannot delete your own account')
        }

        console.log(`[Delete User] Admin ${user.email} deleting user ${targetUserId}`)

        // 3. Perform Deletion (Using Service Role)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // A. Delete from public.profiles (Explicitly requested, though cascade might handle it)
        const { error: profileDeleteError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', targetUserId)

        if (profileDeleteError) {
            console.error('[Delete User] Profile delete error:', profileDeleteError)
            // We continue to try deleting from Auth even if profile delete fails (it might not exist)
        } else {
            console.log('[Delete User] Profile deleted')
        }

        // B. Delete from auth.users (This is the critical one)
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)

        if (authDeleteError) {
            console.error('[Delete User] Auth delete error:', authDeleteError)
            throw authDeleteError
        }

        console.log('[Delete User] Auth user deleted')

        return new Response(
            JSON.stringify({ message: 'User deleted successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error in delete-user:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
