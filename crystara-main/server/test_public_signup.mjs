import { createClient } from "@supabase/supabase-js";

// Use public URL and Anon key from frontend/.env
const SUPABASE_URL = "https://faebjeyibycwwlsenmzx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZWJqZXlpYnljd3dsc2VubXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDMzNjcsImV4cCI6MjA5NjAxOTM2N30.J-YsBssxRaoyJiHbUkzvxzLnSHmj5Kfq6kj0YbgRK6o";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123!";

  console.log(`Attempting standard public signUp for user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("Public signUp failed:", error);
    return;
  }

  console.log("Public signUp response:", data);
}

run();
