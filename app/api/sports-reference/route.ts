/*
 * Fanalytics - Sports Reference API Route
 *
 * This API route handles requests for historical sports data from
 * Baseball-Reference and Basketball-Reference using Python scraping scripts.
 *
 * @author Fanalytics Team
 * @created November 24, 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Type declarations for Node.js globals (workaround for missing @types/node)
declare const process: {
  cwd: () => string;
  platform: string;
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  new (data: string | ArrayBuffer): { toString(): string };
  isBuffer(value: unknown): boolean;
};

// Ensure this route uses Node.js runtime (required for child_process)
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { sport, year, statType } = await request.json();

    if (!sport || !year || !statType) {
      return NextResponse.json(
        { error: 'Missing required parameters: sport, year, statType' },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!['baseball', 'basketball'].includes(sport)) {
      return NextResponse.json(
        { error: 'Sport must be "baseball" or "basketball"' },
        { status: 400 }
      );
    }

    if (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Call the Python scraper
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_sports_refs.py');
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    const data = await runPythonScript(pythonCmd, scriptPath, sport, year.toString(), statType);

    return NextResponse.json({
      sport,
      year,
      statType,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sports reference API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports reference data' },
      { status: 500 }
    );
  }
}

function runPythonScript(pythonCmd: string, scriptPath: string, sport: string, year: string, statType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [
      scriptPath,
      '--sport', sport,
      '--year', year,
      '--stat-type', statType,
      '--qwen-format'
    ];

    const python = spawn(pythonCmd, args, {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data: string | { toString(): string }) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data: string | { toString(): string }) => {
      stderr += data.toString();
    });

    python.on('close', (code: number | null) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    python.on('error', (error: Error) => {
      reject(error);
    });

    // Set timeout (30 seconds)
    setTimeout(() => {
      python.kill();
      reject(new Error('Python script timeout'));
    }, 30000);
  });
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Sports Reference API',
    endpoints: [
      'POST /api/sports-reference',
      'Body: { sport: "baseball"|"basketball", year: number, statType: string }'
    ],
    examples: [
      {
        sport: 'baseball',
        year: 2023,
        statType: 'batting',
        description: 'Get 2023 MLB batting leaders'
      },
      {
        sport: 'basketball',
        year: 2023,
        statType: 'per_game',
        description: 'Get 2023 NBA per-game stats'
      }
    ]
  });
}
