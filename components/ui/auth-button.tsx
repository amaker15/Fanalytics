'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400 hidden sm:inline">
          {user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-white border-zinc-700 hover:bg-zinc-800"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Link href="/auth">
      <Button
        variant="outline"
        size="sm"
        className="text-white border-zinc-700 hover:bg-zinc-800"
      >
        Sign up/Login
      </Button>
    </Link>
  );
}

