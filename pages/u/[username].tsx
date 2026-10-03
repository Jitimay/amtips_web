/**
 * amTips — @username redirect page
 * Handles: https://amtips.app/@SpatiumLapis
 * (next.config.js rewrites /@user → /u/user)
 */

import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawUsername = context.params?.username as string;

  if (!rawUsername) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // Normalize: strip accents, ellipsis (...), and non-alphanumeric chars.
  // Handles truncated usernames like @brucethede… → brucethede (finds brucethedesigner)
  const username = rawUsername
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining accent characters
    .replace(/[\u2026\u22EF]/g, '')     // strip ellipsis characters (… ⋯)
    .replace(/[^a-zA-Z0-9_.]/g, '');   // keep only safe URL chars

  if (!username) {
    return { redirect: { destination: '/', permanent: false } };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[username page] Missing Supabase env vars!');
    return { notFound: true };
  }

  // Create client inside getServerSideProps so env vars are always fresh
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Exact match
    const { data: exact, error: e1 } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (e1) console.error('[username page] exact query error:', e1.message);

    if (exact?.id) {
      return { redirect: { destination: `/t/${exact.id}`, permanent: false } };
    }

    // 2. Fallback: startsWith match (handles truncated usernames like @brucethede…)
    //    Only redirect if exactly ONE match to avoid ambiguity.
    const { data: partialMatches, error: e2 } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', `${username}%`)
      .eq('is_active', true)
      .limit(2);

    if (e2) console.error('[username page] partial query error:', e2.message);

    if (partialMatches && partialMatches.length === 1 && partialMatches[0].id) {
      return {
        redirect: { destination: `/t/${partialMatches[0].id}`, permanent: false },
      };
    }
  } catch (err) {
    console.error('[username page] exception:', err);
  }

  return { notFound: true };
};

export default function UsernamePage() {
  return null;
}
