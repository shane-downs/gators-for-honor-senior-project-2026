/*
 * Provides a shared database client for all API routes using Neon's serverless PostgreSQL driver (@neondatabase/serverless).
*/

import { neon } from "@neondatabase/serverless";

/*
 * Validate that DATABASE_URL is set at startup.
*/
if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL environment variable is not set. " +
        "Add it to .env.local with your Neon connection string."
    );
}

/*
 * Usage:
 *   const users = await sql`SELECT * FROM users WHERE id = ${id}`;
 *   // Returns an array of row objects directly
*/
export const sql = neon(process.env.DATABASE_URL);