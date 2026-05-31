/**
 * Advisory comment moderation using Anthropic Claude API.
 * Never throws - returns a safe fallback on failure.
 */

interface ModerationOutcome {
  label: string | null
  score: number | null
  reason: string | null
  action: string | null
}

export async function moderateComment(
  content: string,
  accountAgeDays: number | null,
  userId: string | null
): Promise<ModerationOutcome> {
  // Fail-open fallback
  const fallback: ModerationOutcome = {
    label: null,
    score: null,
    reason: null,
    action: "flag-for-review",
  }

  // Skip moderation if no API key configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "mimo-v2.5",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `You are a comment moderation assistant. Analyze the comment and classify it as:
- "spam": promotional, irrelevant, or low-quality content
- "toxic": harassment, hate speech, or abusive language
- "normal": acceptable comment

Provide a confidence score (0-1) and a brief reason.

Context:
- Account age: ${accountAgeDays !== null ? `${accountAgeDays} days` : "anonymous"}
- User ID: ${userId ? "logged in" : "anonymous"}

Comment to analyze:
"${content}"

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "label": "spam" | "toxic" | "normal",
  "score": 0.95,
  "reason": "Brief explanation",
  "action": "approve" | "flag-for-review" | "reject"
}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      console.error("Anthropic moderation failed:", response.status, await response.text())
      return fallback
    }

    const data = await response.json()
    const textContent = data.content[0].text

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("No JSON found in Claude response:", textContent)
      return fallback
    }

    const result = JSON.parse(jsonMatch[0])

    return {
      label: result.label || null,
      score: result.score || null,
      reason: result.reason || null,
      action: result.action || "flag-for-review",
    }
  } catch (error) {
    console.error("Comment moderation error:", error)
    return fallback
  }
}
