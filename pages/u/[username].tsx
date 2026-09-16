/**
 * amTips — @username redirect page
 * Handles: https://amtips.app/@SpatiumLapis
 * (Cloudflare Page Rule / next.config.js rewrites /@user → /u/user)
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

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { notFound: true };
  }

  return {
    redirect: {
      destination: `/t/${data.id}`,
      permanent: false,
    },
  };
};

export default function UsernamePage() {
  return null;
}
