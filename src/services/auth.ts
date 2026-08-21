import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session';
import { Constants } from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
