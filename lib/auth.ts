import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

export async function getAuthenticatedUser() {
  const supabase = createRouteHandlerClient<Database>({
    cookies
  });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}
