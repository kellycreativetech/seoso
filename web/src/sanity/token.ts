import "server-only";

// Viewer token used to read drafts in draft mode / the Presentation tool.
// Set in web/.env.local locally and in Netlify environment variables in production.
export const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}
