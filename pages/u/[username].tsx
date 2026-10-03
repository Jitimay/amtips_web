/**
 * amTips — @username redirect page
 * Handles: https://amtips.app/@SpatiumLapis
 * (next.config.js rewrites /@user → /u/user)
 *
 * Also handles truncated usernames (e.g. @brucethede… → @brucethedesigner)
 * that happen when someone copy-pastes from WhatsApp/Instagram which truncates
 * long usernames with an ellipsis (… = %E2%80%A6).
 */

import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const rawUsername = context.params?.username as string;

  if (!rawUsername) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // Normalize: strip accents so é→e, ç→c etc., then strip non-alphanumeric.
  // Also strip the ellipsis (…) that appears when apps truncate long usernames.
  const username = rawUsername
    .normalize('NFD')                    // decompose accents: é → e + combining accent
    .replace(/[\\u0300-\\u036f]/g, '')   // strip combining accent characters
    .replace(/\u2026/g, '')              // strip ellipsis character (…)
    .replace(/[^a-zA-Z0-9_.]/g, '');    // keep only safe URL chars

  if (!username) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // 1. Try exact match first
  const { data: exact } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', username)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (exact) {
    return {
      redirect: { destination: `/t/${exact.id}`, permanent: false },
    };
  }

  // 2. Fallback: startsWith match (handles truncated usernames like @brucethede…→@brucethedesigner)
  //    Only redirect if there is exactly ONE match to avoid ambiguity.
  const { data: partialMatches } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `${username}%`)
    .eq('is_active', true)
    .limit(2); // fetch 2 to detect ambiguity

  if (partialMatches && partialMatches.length === 1) {
    // Unambiguous — redirect to the one match
    return {
      redirect: { destination: `/t/${partialMatches[0].id}`, permanent: false },
    };
  }

  // 3. Nothing found — 404
  return { notFound: true };
};

export default function UsernamePage() {
  return null;
}
