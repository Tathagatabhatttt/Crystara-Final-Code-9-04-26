import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const role = process.argv[4] || "user"; // 'user' or 'admin'

if (!email || !password) {
  console.error("Usage: node create_confirmed_user.mjs <email> <password> [role]");
  process.exit(1);
}

async function run() {
  console.log(`Creating user ${email} with password...`);

  // Create the user using Supabase Admin API which auto-confirms email and bypasses rate limits
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email!
    user_metadata: { role }
  });

  if (error) {
    console.error("Failed to create user:", error);
    return;
  }

  console.log("Successfully created auto-confirmed user in auth.users:", data.user.id);

  // Now insert a corresponding profile in public.user_profiles
  const { error: profileError } = await supabase
    .from("user_profiles")
    .upsert({
      user_id: data.user.id,
      email,
      role,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (profileError) {
    console.error("Warning: Failed to create profile record:", profileError);
  } else {
    console.log("Successfully created user profile in public.user_profiles!");
  }
}

run();
