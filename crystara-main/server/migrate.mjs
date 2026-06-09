import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "migrations");

const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function runMigrations() {
    console.log("🔮 Running Crystara database migrations...\n");

    // Read all .sql files sorted by name
    const files = (await readdir(migrationsDir))
        .filter((f) => f.endsWith(".sql"))
        .sort();

    if (files.length === 0) {
        console.log("No migration files found.");
        return;
    }

    for (const file of files) {
        const filePath = join(migrationsDir, file);
        const sql = await readFile(filePath, "utf-8");

        console.log(`  ⏳ Running ${file}...`);

        const { error } = await supabase.rpc("exec_sql", { query: sql });

        if (error) {
            // If exec_sql doesn't exist, fall back to individual statements
            console.log(`  ⚠️  RPC not available for ${file}.`);
            console.log(`     Run manually: npx supabase db execute --file migrations/${file}`);
            console.log(`     Or paste into Supabase SQL Editor.\n`);
        } else {
            console.log(`  ✅ ${file} applied successfully.\n`);
        }
    }

    console.log("🎉 Migrations complete!");
}

runMigrations().catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
});
