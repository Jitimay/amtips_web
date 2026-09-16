/**
 * amTips — @username redirect page
 * Handles: https://amtips.app/@SpatiumLapis
 * Looks up the username in Supabase → redirects to /t/:id
 */

import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const username = context.params?.username as string;

  if (!username) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // Look up the profile by username (case-insensitive)
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    // Username not found — show 404
    return { notFound: true };
  }

  // Redirect to the tipping page
  return {
    redirect: {
      destination: `/t/${data.id}`,
      permanent: false,
    },
  };
};

// This component never renders — getServerSideProps always redirects
export default function UsernamePage() {
  return null;
}
