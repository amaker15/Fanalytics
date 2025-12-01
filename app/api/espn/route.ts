/*
 * Fanalytics - ESPN API Proxy Route
 *
 * This API route proxies requests to ESPN's API to avoid CORS issues
 * when fetching data from client components.
 *
 * @author Fanalytics Team
 * @created November 29, 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';

const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    // Validate endpoint to prevent SSRF attacks
    if (!endpoint.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid endpoint format' },
        { status: 400 }
      );
    }

    const url = `${ESPN_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Fanalytics/1.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `ESPN API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    console.error('ESPN proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from ESPN API', details: error.message },
      { status: 500 }
    );
  }
}

