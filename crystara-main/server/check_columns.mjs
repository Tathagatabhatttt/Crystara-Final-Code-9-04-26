import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

async function check() {
  console.log("Checking columns...");
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .limit(1);
    
  if (error) {
    console.error("Error fetching products:", error);
  } else {
    console.log("Product record keys:", data.length > 0 ? Object.keys(data[0]) : "No products in table");
    console.log("Product records:", data);
  }
}
check();
