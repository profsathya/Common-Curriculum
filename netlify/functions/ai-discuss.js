/**
 * AI Discussion Question Generator
 *
 * Netlify serverless function that takes a student's written response
 * and generates discussion questions for their partner to use in
 * a face-to-face conversation.
 *
 * Environment Variables Required:
 *   ANTHROPIC_API_KEY - Anthropic API key for Claude Haiku
 *
 * Request Body:
 *   {
 *     "response": "The student's written response text",
 *     "prompt": "The original question prompt",
 *     "context": "Optional additional context about the activity",
 *     "course": "CST349 or CST395",
 *     "numQuestions": 3
 *   }
 *
 * Returns:
 *   {
 *     "questions": ["Question 1?", "Question 2?", "Question 3?"],
 *     "observation": "A brief observation about the response"
 *   }
 */

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: missing API key' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON in request body' }),
    };
  }

  const { response, prompt, context, course, numQuestions } = body;

  if (!response || !prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: response, prompt' }),
    };
  }

  // Limit response length to prevent abuse
  const trimmedResponse = response.slice(0, 3000);
  const questionCount = Math.min(Math.max(numQuestions || 3, 1), 5);

  const systemPrompt = `You are a peer discussion facilitator for a university course${course ? ` (${course})` : ''}. Your role is to help students have deeper conversations about their reflections and work.

Given a student's written response to a prompt, generate exactly ${questionCount} follow-up discussion questions. These questions will be used by a PARTNER who will ask them to the AUTHOR of the response in a face-to-face conversation.

Guidelines for generating questions:
- First, check if the response actually addresses the original prompt. If it doesn't, your observation should note this and at least one question should gently redirect — e.g., "The prompt asked about X, but your response focused on Y. Can you walk me through how those connect?"
- Questions should probe deeper into the student's thinking, not quiz them
- Ask "why" and "how" questions that encourage elaboration
- Challenge assumptions gently — "What if..." or "Have you considered..."
- Connect to concrete experiences — "Can you give me an example of..."
- Avoid yes/no questions
- Each question should explore a different angle of the response
- Keep questions conversational and natural, not academic or stiff
- Questions should be ones a thoughtful peer would ask, not a professor

Also provide a brief observation (1-2 sentences) about a strength or interesting aspect of the response that the partner can use to open the conversation positively.

Respond in this exact JSON format:
{
  "questions": ["Question 1?", "Question 2?", "Question 3?"],
  "observation": "Brief positive observation about the response."
}`;

  const userMessage = `Original prompt the student was responding to:
"${prompt}"

${context ? `Activity context: ${context}\n\n` : ''}Student's written response:
"${trimmedResponse}"

Generate ${questionCount} discussion questions for the partner to ask.`;

  try {
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Anthropic API error:', apiResponse.status, errorText);
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }),
      };
    }

    const data = await apiResponse.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Empty response from AI service' }),
      };
    }

    // Parse the JSON from Claude's response
    let result;
    try {
      // Extract JSON from the response (Claude sometimes wraps in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback: use the raw text as a single question
      result = {
        questions: [content.trim()],
        observation: 'Here are some thoughts on this response.',
      };
    }

    // Validate structure
    if (!Array.isArray(result.questions) || result.questions.length === 0) {
      return {
        statusCode: 502,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid response format from AI' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
