
const { createClient } = require('@supabase/supabase-js');
// Manually load env since we are calling from script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zxbmbbfrzbtuueysicoc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    console.log("Please run with: SUPABASE_SERVICE_ROLE_KEY=... node scripts/inspect_user.js");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectUser() {
    const email = "archerak7@gmail.com";
    console.log(`Fetching user: ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error listing users:", error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("User not found!");
        return;
    }

    console.log("User Data:");
    console.log("ID:", user.id);
    console.log("Email:", user.email);
    console.log("App Metadata:", JSON.stringify(user.app_metadata, null, 2));
    console.log("User Metadata:", JSON.stringify(user.user_metadata, null, 2));
    console.log("Identities:", JSON.stringify(user.identities, null, 2));

    // Check logic
    const isLineBound = !!(
        user.app_metadata?.provider === 'line' ||
        user.user_metadata?.line_user_id ||
        user.identities?.some((id) => id.provider === 'line')
    );
    console.log("isLineBound Check:", isLineBound);
}

inspectUser();
