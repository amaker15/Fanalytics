/*
 * Fanalytics - AI Insights API Route
 *
 * This API route handles AI-powered sports queries using the integrated
 * chatbot functionality with ESPN data and betting odds.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { runChat } from '@/lib/chatbot';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid query parameter' },
        { status: 400 }
      );
    }

    // Use the Nebius-backed chat workflow
    const answer = await runChat(query);

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
