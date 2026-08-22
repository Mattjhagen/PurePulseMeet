import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cucksfwkdmrkeiwmdlut.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Y2tzZndrZG1ya2Vpd21kbHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMDc5MzUsImV4cCI6MjA1NTY4MzkzNX0.0Y49eXkH7mN1K4L5P2V7X9A3Z6M8L0P2V7X9A3Z6M8L';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const signInWithGoogle = async () => {
  const redirectUrl = QueryParams.makeRedirectUri({ scheme: 'purepulse' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const { url } = result;
      const params = QueryParams.parseQueryString(url.split('#')[1] || url.split('?')[1] || '');
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token as string,
          refresh_token: params.refresh_token as string,
        });
      }
    }
  }
};

export const signInWithApple = async () => {
  const redirectUrl = QueryParams.makeRedirectUri({ scheme: 'purepulse' });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    if (result.type === 'success') {
      const { url } = result;
      const params = QueryParams.parseQueryString(url.split('#')[1] || url.split('?')[1] || '');
      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token as string,
          refresh_token: params.refresh_token as string,
        });
      }
    }
  }
};
