import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const email = process.argv[2];

if (!email) {
  console.error("Usage: node set_admin_role.mjs <email>");
  process.exit(1);
}

async function run() {
  console.log(`Setting role to 'admin' for user with email: ${email}`);

  // Update in user_profiles
  const { data, error } = await supabase
    .from("user_profiles")
    .update({ role: "admin", updated_at: new Date().toISOString() })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error updating user profile role:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.error(`No profile found with email ${email}`);
    return;
  }

  console.log("Successfully set user profile role to admin!", data[0]);
}

run();
