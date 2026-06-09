import { createClient } from "@sanity/client";

export const sanityClient = createClient({
    projectId:
        import.meta.env.VITE_SANITY_ID ||
        import.meta.env.VITE_SANITY_PROJECT_ID ||
        "24b9t1zn",
    dataset: import.meta.env.VITE_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
    token: import.meta.env.VITE_SANITY_TOKEN,
});
