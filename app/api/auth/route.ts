/*
 * Fanalytics - Authentication API Route
 *
 * This API route handles user signup and login using Supabase.
 * It manages sessions server-side and sets secure HTTP-only cookies.
 *
 * @author Fanalytics Team
 * @created November 29, 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json();

    if (!action || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: action, email, password' },
        { status: 400 }
      );
    }

    if (!['signup', 'login'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "signup" or "login"' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      // If email confirmation is disabled, session will be available immediately
      if (data.session) {
        return NextResponse.json({
          success: true,
          message: 'Account created successfully!',
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          },
        });
      } else {
        // Email confirmation required
        return NextResponse.json({
          success: true,
          message: 'Account created! Please check your email to confirm your account.',
        });
      }
    } else {
      // Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }

      if (!data.session) {
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Logged in successfully!',
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      });
    }
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

