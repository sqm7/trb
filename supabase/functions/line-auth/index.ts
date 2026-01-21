import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    // Health Check
    if (req.method === 'GET') {
        const hasChannelId = !!Deno.env.get('LINE_CHANNEL_ID');
        const hasJwtSecret = !!Deno.env.get('LINE_JWT_SECRET');
        return new Response(JSON.stringify({
            status: 'ok',
            checks: { hasChannelId, hasJwtSecret }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    try {
        const body = await req.json().catch(() => ({}));
        const { idToken } = body;

        console.log('[Line Auth] Request received');

        if (!idToken) {
            throw new Error('Missing idToken in body');
        }

        const channelId = Deno.env.get('LINE_CHANNEL_ID')
        console.log('[Line Auth] Channel ID configured:', !!channelId);

        const jwtSecret = Deno.env.get('LINE_JWT_SECRET')
        if (!jwtSecret) {
            console.error('[Line Auth] Config Error: LINE_JWT_SECRET missing');
            throw new Error('Server Config Error: LINE_JWT_SECRET missing');
        }

        // 1. Verify Line Token
        let lineUser: any = {};
        if (channelId) {
            const params = new URLSearchParams()
            params.append('id_token', idToken)
            params.append('client_id', channelId)

            console.log('[Line Auth] Verifying with Line API...');
            const lineResponse = await fetch('https://api.line.me/oauth2/v2.1/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params,
            })

            if (!lineResponse.ok) {
                const err = await lineResponse.json()
                console.error('[Line Auth] Verification Error:', err)
                throw new Error(`Line API Error: ${err.error_description || err.error || 'Verification failed'}`)
            }
            lineUser = await lineResponse.json()
            console.log('[Line Auth] Verified user:', lineUser.sub);
        } else {
            throw new Error('Server Config Error: LINE_CHANNEL_ID not set')
        }

        const { sub: lineUserId, name, picture, email } = lineUser

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Find or Create User
        const userEmail = email || `${lineUserId}@line.workaround`
        let userId = null

        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) console.error('[Line Auth] List Users Error:', listError);

        let targetUser = users?.find(u => u.user_metadata?.line_user_id === lineUserId)
        if (!targetUser && email) {
            targetUser = users?.find(u => u.email === email)
        }

        if (targetUser) {
            userId = targetUser.id
            console.log('[Line Auth] Found existing user:', userId);
            await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: { ...targetUser.user_metadata, full_name: name, avatar_url: picture, line_user_id: lineUserId }
            })
        } else {
            console.log('[Line Auth] Creating new user...');
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: userEmail,
                email_confirm: true,
                user_metadata: {
                    full_name: name,
                    avatar_url: picture,
                    line_user_id: lineUserId,
                    provider: 'line'
                },
                password: crypto.randomUUID()
            })
            if (createError) {
                console.error('[Line Auth] Create User Error:', createError);
                throw createError
            }
            userId = newUser.user!.id
        }

        // 3. Mint Supabase JWT
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(jwtSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"]
        )

        const payload = {
            aud: "authenticated",
            exp: getNumericDate(60 * 60 * 24 * 30), // 30 days
            sub: userId,
            email: userEmail,
            role: "authenticated",
            app_metadata: { provider: "line", providers: ["line"] },
            user_metadata: { full_name: name, avatar_url: picture }
        }

        const token = await create({ alg: "HS256", typ: "JWT" }, payload, key)
        console.log('[Line Auth] JWT Minted Successfully');

        // Note: We cannot easily generate a valid Supabase refresh token without direct DB access.
        // We provide a dummy one to satisfy specific client-side requirements (setSession).
        // The long JWT expiry (30 days) compensates for the lack of working refresh logic.
        return new Response(
            JSON.stringify({
                token,
                refresh_token: "dummy-refresh-token",
                user: { id: userId, email: userEmail }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('[Line Auth] Critical Error:', error);
        return new Response(JSON.stringify({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
