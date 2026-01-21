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

        // 2. Fetch All Data (Using Service Role)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // Parallel fetch for efficiency
        const [usersResponse, profilesResponse] = await Promise.all([
            supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
            supabaseAdmin.from('profiles').select('*')
        ])

        if (usersResponse.error) throw usersResponse.error
        if (profilesResponse.error) throw profilesResponse.error

        const users = usersResponse.data.users
        const profiles = profilesResponse.data

        // 3. Merge Data
        const mergedUsers = users.map(u => {
            const profile = profiles?.find(p => p.id === u.id)
            const identityProviders = u.identities?.map(id => id.provider) || []
            const appMetaProviders = u.app_metadata?.providers || []
            // Check for custom LINE auth indicator in user_metadata
            const customLineProvider = (u.user_metadata?.line_user_id || u.user_metadata?.provider === 'line') ? ['line'] : []

            const allProviders = [...identityProviders, ...appMetaProviders, ...customLineProvider].map(p => String(p).toLowerCase())
            const uniqueProviders = [...new Set(allProviders)]

            return {
                id: u.id,
                email: u.email,
                full_name: profile?.full_name || u.user_metadata?.full_name || null,
                role: profile?.role || 'user',
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at || null,
                providers: uniqueProviders,
                banned_until: u.banned_until || null
            }
        })

        // Sort by created_at desc
        mergedUsers.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        return new Response(
            JSON.stringify(mergedUsers),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('Error in get-users:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
