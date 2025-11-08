// Nebius API integration for AI-powered sports analysis

const NEBIUS_API_KEY = 'v1.CmQKHHN0YXRpY2tleS1lMDB4NTgxZnk1Z2phejU0cGMSIXNlcnZpY2VhY2NvdW50LWUwMGgzbXhudGpzbWo5NjVwNTIMCJiDs8gGEKr4l80COgwIl4bLkwcQwPe3iANAAloDZTAw.AAAAAAAAAAHfj9qOAVhhg9NtkSOOFCTlM7q1qAm8J1EtpY006UA629hnxlCPc_4Iu9ApUKs_BGuso6sZ_grpk2hochdo738J';
const NEBIUS_BASE_URL = 'https://api.tokenfactory.nebius.com/v1';

// Test function to check Nebius API connectivity
export async function testNebiusConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${NEBIUS_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error('Nebius API connection test failed:', response.status, response.statusText);
      return false;
    }

    const data: ModelsResponse = await response.json();
    console.log('Nebius API connection successful. Available models:', data.data?.length || 0);

    // Log all Qwen models
    const qwenModels = data.data?.filter((model: ModelInfo) =>
      model.id?.toLowerCase().includes('qwen') ||
      model.name?.toLowerCase().includes('qwen')
    ) || [];

    console.log('Available Qwen models:', qwenModels.map((m: ModelInfo) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length
    })));

    return true;
  } catch (error) {
    console.error('Nebius API connection test error:', error);
    return false;
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ModelInfo {
  id: string;
  name: string;
  context_length?: number;
}

interface ModelsResponse {
  data: ModelInfo[];
}

type StatValue = string | number | undefined;
type StatsRecord = Record<string, StatValue>;

// Qwen model to use
const QWEN_MODEL = 'Qwen/Qwen3-235B-A22B-Thinking-2507';

export async function getAISportsAnalysis(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord
): Promise<string> {
  try {
    const systemPrompt = `You are a professional sports analyst providing expert analysis for ${sport}. Compare the two ${type} provided and give detailed insights about their performance, strengths, weaknesses, and prediction for a matchup. Keep the analysis concise but informative, around 200-300 words. Use plain text only - no markdown, no bold, no special formatting, no asterisks. Structure your response with clear section labels like "Performance Comparison:", "Key Strengths:", "Critical Weaknesses:", and "Prediction:".`;

    const userPrompt = generateComparisonPrompt(sport, type, selection1, selection2, stats1, stats2);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log(`Using Qwen model: ${QWEN_MODEL}`);

    const response = await fetch(`${NEBIUS_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEBIUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages,
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nebius API Error:', {
        status: response.status,
        statusText: response.statusText,
        response: errorText
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Nebius API response format');
      throw new Error('Invalid API response format');
    }

    console.log(`Success with Qwen model: ${QWEN_MODEL}`);
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Qwen AI Analysis Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      sport,
      type,
      selection1,
      selection2
    });

    // Log to user-visible console for debugging
    if (typeof window !== 'undefined') {
      console.warn('AI Analysis failed - using fallback analysis. Check console for details.');
    }

    // Fallback to basic comparison if API fails
    return generateFallbackAnalysis(sport, type, selection1, selection2, stats1, stats2);
  }
}

function generateComparisonPrompt(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord
): string {
  let prompt = `Compare ${selection1} vs ${selection2} in ${sport}:\n\n`;

  if (type === 'teams') {
    prompt += `${selection1} Stats:\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      prompt += `${key}: ${value}\n`;
    });

    prompt += `\n${selection2} Stats:\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      prompt += `${key}: ${value}\n`;
    });
  } else {
    // Player comparison
    prompt += `${selection1} (${stats1.team}):\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      if (key !== 'team') {
        prompt += `${key}: ${value}\n`;
      }
    });

    prompt += `\n${selection2} (${stats2.team}):\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      if (key !== 'team') {
        prompt += `${key}: ${value}\n`;
      }
    });
  }

  prompt += '\nProvide a detailed analysis comparing their performance, strengths, weaknesses, and prediction for a head-to-head matchup.';

  return prompt;
}

function generateFallbackAnalysis(
  sport: string,
  type: 'teams' | 'players',
  selection1: string,
  selection2: string,
  stats1: StatsRecord,
  stats2: StatsRecord
): string {
  // Generate a more detailed fallback analysis using the actual stats
  let analysis = `**AI Analysis: ${selection1} vs ${selection2}**\n\n`;

  if (type === 'teams') {
    analysis += `*AI service temporarily unavailable. Here's a data-driven comparison:*\n\n`;
    analysis += `**${selection1} Stats:**\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      analysis += `- ${key}: ${value}\n`;
    });

    analysis += `\n**${selection2} Stats:**\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      analysis += `- ${key}: ${value}\n`;
    });
  } else {
    analysis += `*AI service temporarily unavailable. Here's a player comparison:*\n\n`;
    analysis += `**${selection1}:**\n`;
    Object.entries(stats1).forEach(([key, value]) => {
      if (key !== 'team') {
        analysis += `- ${key}: ${value}\n`;
      }
    });

    analysis += `\n**${selection2}:**\n`;
    Object.entries(stats2).forEach(([key, value]) => {
      if (key !== 'team') {
        analysis += `- ${key}: ${value}\n`;
      }
    });
  }

  analysis += `\n*Please try again later for AI-powered insights.*`;

  return analysis;
}
