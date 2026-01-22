import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window !== 'undefined' && client) {
    return client;
  }
  
  const newClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  if (typeof window !== 'undefined') {
    client = newClient;
  }
  
  return newClient;
}

export function resetClient() {
  client = null;
}

/*import { createBrowserClient } from '@supabase/ssr';

type Client = ReturnType<typeof createBrowserClient>;

let client: Client | null = null;

export function createClient(): Client {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getClient(): Client {
  if (typeof window === 'undefined') {
    return createClient();
  }
  
  if (!client) {
    client = createClient();
  }
  return client;
}*/


/*  OLD CODE 
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for client-side usage
let client: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (!client) {
    client = createClient()
  }
  return client
}
*/