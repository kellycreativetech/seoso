// Publishable values only — safe to import from client components.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
export const apiVersion = "2026-10-01";
// Where click-to-edit links open. The hosted Studio in production, the local one in dev.
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";
