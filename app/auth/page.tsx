'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import SportsNavigation from '@/components/sports-navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    // Client-side validation
    if (!email || !password) {
      setMessage('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          action: isSignup ? 'signup' : 'login',
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isSignup) {
          // If session is returned, user can be logged in immediately
          if (data.session) {
            // User is automatically logged in (email confirmation disabled)
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            setMessage('Account created successfully! Redirecting...');
            setTimeout(() => {
              router.push('/');
              router.refresh();
            }, 1500);
          } else {
            // Email confirmation required
            setMessage(data.message || 'Account created! Please check your email to confirm your account.');
          }
        } else {
          // Login successful
          if (data.session) {
            // Set session on client
            await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
          } else {
            // Refresh session from cookies
            await supabase.auth.refreshSession();
          }
          setMessage('Logged in successfully! Redirecting...');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 1000);
        }
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  fanalytics
                </div>
              </Link>
              <SportsNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-zinc-900 border border-zinc-800 rounded-lg">
          <h2 className="text-3xl font-bold text-center">
            {isSignup ? 'Create Account' : 'Log In'}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          {message && (
            <p className={`text-center text-sm ${
              message.includes('success') || message.includes('Check your email')
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}