import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getAccessTokenFromRequest(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

export function createSupabaseServerClient(accessToken) {
  const config = getSupabaseConfig();
  if (!config || !accessToken) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function requireSupabaseUser(request) {
  const accessToken = getAccessTokenFromRequest(request);
  const client = createSupabaseServerClient(accessToken);

  if (!client || !accessToken) {
    return { client: null, user: null, error: "Unauthorized" };
  }

  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    return { client: null, user: null, error: "Unauthorized" };
  }

  return {
    client,
    user: data.user,
    error: null
  };
}
