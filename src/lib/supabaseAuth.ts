import { createClient } from '@supabase/supabase-js';

const AUTH_DB_URL = 'https://qfitpwdrswvnbmzvkoyd.supabase.co';
const AUTH_DB_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaXRwd2Ryc3d2bmJtenZrb3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjA1MDAwMDAwMH0.placeholder';

export const authDb = createClient(AUTH_DB_URL, AUTH_DB_ANON_KEY);

export interface UserLogin {
  id: string;
  username: string;
  password: string;
}

export const fetchUsernames = async (): Promise<string[]> => {
  const { data, error } = await authDb
    .from('users_login')
    .select('username')
    .order('username');

  if (error) throw error;
  return (data ?? []).map((row: { username: string }) => row.username);
};

export const validateLogin = async (
  username: string,
  password: string
): Promise<boolean> => {
  const { data, error } = await authDb
    .from('users_login')
    .select('id')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
};

export const fetchOpenAIKey = async (): Promise<string | null> => {
  const { data, error } = await authDb
    .from('secrets')
    .select('key_value')
    .eq('key_name', 'OPEN_AI_KEY')
    .maybeSingle();

  if (error) return null;
  return data?.key_value ?? null;
};
