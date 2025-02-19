import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

interface CompletionRequestBody {
  prompt: string;
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Define schema
const requestSchema = z.object({
  prompt: z.string(),
});

export async function POST(req: Request) {
  const body = (await req.json()) as CompletionRequestBody;
  const parsedBody = requestSchema.safeParse(body);
  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request. 'prompt' must be a non-empty string.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: openai("gpt-3.5-turbo"),
    prompt: parsedBody.data.prompt,
  });

  return result.toDataStreamResponse();
}
