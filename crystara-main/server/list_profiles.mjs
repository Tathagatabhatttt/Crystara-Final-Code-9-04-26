import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

async function run() {
  const { data, error } = await supabase.from("user_profiles").select("*");
  if (error) {
    console.error("Error fetching user profiles:", error);
    return;
  }

  console.log(`Found ${data.length} profiles:`);
  data.forEach(p => {
    console.log(`- UserID: ${p.user_id}, Email: ${p.email}, Name: ${p.name}, Role: ${p.role}`);
  });
}

run();
