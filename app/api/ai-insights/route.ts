/*
 * Fanalytics - AI Insights API Route
 *
 * This API route handles AI-powered sports queries using the integrated
 * chatbot functionality with ESPN data and betting odds.
 * Requires user authentication.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { runChat } from '@/lib/chatbot';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required. Please sign in to use the chatbot.' },
        { status: 401 }
      );
    }

    const { query, history } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid query parameter' },
        { status: 400 }
      );
    }

    // Use the Nebius-backed chat workflow
    const answer = await runChat(query, history);

    return NextResponse.json({
      ok: true,
      answer,
    });

  } catch (error) {
    console.error('AI Insights API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
