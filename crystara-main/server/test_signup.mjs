import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123!";

  console.log(`Attempting to sign up user: ${email}`);

  // We sign up the user using the auth API (same as client-side but with service role client)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Sign up failed:", error);
    return;
  }

  console.log("Sign up succeeded!", data);
  console.log(`User ID: ${data.user?.id}, Confirmed: ${data.user?.email_confirmed_at}`);
}

run();
