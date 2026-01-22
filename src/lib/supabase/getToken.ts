export function getSupabaseToken(): string | null {
  const authData = getSupabaseAuthData();
  return authData?.access_token || null;
}

export function getSupabaseAuthData(): { access_token: string; user: { id: string; email?: string } } | null {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace('https://', '')
    ?.split('.')[0];
  
  if (!projectRef) return null;
  
  const cookieName = `sb-${projectRef}-auth-token`;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    const value = valueParts.join('=');
    
    if (name === cookieName) {
      const decoded = decodeURIComponent(value);
      
      // Handle "base64-" prefix format (Supabase SSR)
      if (decoded.startsWith('base64-')) {
        try {
          const base64Part = decoded.substring(7);
          const jsonString = atob(base64Part);
          const parsed = JSON.parse(jsonString);
          return {
            access_token: parsed.access_token,
            user: parsed.user,
          };
        } catch {
          return null;
        }
      }
      
      // Handle plain JSON format
      try {
        const parsed = JSON.parse(decoded);
        return {
          access_token: parsed.access_token,
          user: parsed.user,
        };
      } catch {
        return null;
      }
    }
  }
  
  return null;
}