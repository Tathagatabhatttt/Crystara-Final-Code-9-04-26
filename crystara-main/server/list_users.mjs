import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("Error listing users:", error);
    return;
  }

  const users = data.users;
  console.log(`Found ${users.length} users:`);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, Confirmed: ${!!u.email_confirmed_at}, CreatedAt: ${u.created_at}`);
  });
}

run();
