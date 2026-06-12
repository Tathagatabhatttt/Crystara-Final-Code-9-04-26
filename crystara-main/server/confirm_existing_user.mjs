import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

const email = process.argv[2];

if (!email) {
  console.error("Usage: node confirm_existing_user.mjs <email>");
  process.exit(1);
}

async function run() {
  console.log(`Searching for user with email: ${email}`);
  
  // List users to find the correct ID
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.error(`No user found with email ${email}`);
    return;
  }

  console.log(`Found user: ${user.id}. Current confirmation status: ${!!user.email_confirmed_at}`);

  // Confirm email status
  const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { email_confirm: true }
  );

  if (updateError) {
    console.error("Failed to confirm user:", updateError);
    return;
  }

  console.log("Successfully confirmed user:", updateData.user.email);
}

run();
