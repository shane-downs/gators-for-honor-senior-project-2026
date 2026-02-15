import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

const EXPIRY_BUFFER_MS = 5 * 60 * 1000;         // 5 minutes buffer to proactively refresh tokens before they expire

interface TokenResult {
  accessToken: string;
  canvasUserId: number;
  canvasDomain: string;
}

export async function getValidToken(canvasUserId: number): Promise<TokenResult> {
  // first look up the user's current tokens
  const rows = await sql`
    SELECT id, canvas_user_id, canvas_domain, access_token, refresh_token, token_expires_at
    FROM users
    WHERE canvas_user_id = ${canvasUserId}
    LIMIT 1
  `;

  // if no user found with the id
  if (rows.length === 0) {      
    throw new Error(`No user found with canvas_user_id: ${canvasUserId}`);
  }

  const user = rows[0];     // user's query result row
  const expiresAt = new Date(user.token_expires_at).getTime();
  const now = Date.now();

  // if token is still valid, return it
  if (expiresAt - now > EXPIRY_BUFFER_MS) {
    return {
      accessToken: user.access_token,
      canvasUserId: user.canvas_user_id,
      canvasDomain: user.canvas_domain,
    };
  }

  // if token is expired (or about to expire) we need to refresh it
  if (!user.refresh_token) {
    throw new Error(`Token expired and no refresh_token available for user ${canvasUserId}`);
  }

  // get new token
  const tokenRes = await fetch(`${user.canvas_domain}/login/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_CANVAS_CLIENT_ID!,
      client_secret: process.env.CANVAS_CLIENT_SECRET!,
      refresh_token: user.refresh_token,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Canvas token refresh failed (${tokenRes.status}): ${errBody}`);
  }

  // since refreshes just refresh the original token, we just update the access token and expiry time
  const { access_token, expires_in } = await tokenRes.json();
  const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // now update the DB with the fresh access token
  await sql`
    UPDATE users
    SET access_token = ${access_token},
        token_expires_at = ${newExpiresAt},
        updated_at = NOW()
    WHERE canvas_user_id = ${canvasUserId}
  `;

  return {
    accessToken: access_token,
    canvasUserId: user.canvas_user_id,
    canvasDomain: user.canvas_domain,
  };
}