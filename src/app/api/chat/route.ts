import { openai } from "@ai-sdk/openai";
import {
  appendClientMessage,
  appendResponseMessages,
  type Message,
  streamText,
} from "ai";
import { saveChat, loadChat } from "@/tools/chat-store";
import { z } from "zod";

interface ChatRequestBody {
  id: string;
  messages: Message[];
}

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  console.log("📝 Received API request:", JSON.stringify(body, null, 2));

  const { id, messages } = body;

  if (!id || !messages || !Array.isArray(messages) || messages.length === 0) {
    console.error("🚨 Invalid request body:", { id, messages });
    return new Response("Invalid request: chat ID or message missing", {
      status: 400,
    });
  }

  const message = messages[messages.length - 1];

  if (!message?.role || !message.content) {
    console.error("🚨 Error: Last message is invalid!", message);
    return new Response(
      "Invalid request: last message is missing required fields",
      { status: 400 },
    );
  }

  console.log("✅ Valid request received, loading chat history...");
  const previousMessages = await loadChat(id);
  const updatedMessages = appendClientMessage({
    messages: previousMessages,
    message,
  });

  console.log("🔄 Processing chat with OpenAI...");
  const result = streamText({
    model: openai("gpt-4o"),
    messages: updatedMessages,
    tools: {
      // server-side tool with execute function:
      getWeatherInformation: {
        description: "show the weather in a given city to the user",
        parameters: z.object({ city: z.string() }),
        execute: async ({}: { city: string }) => {
          const weatherOptions = ["sunny", "cloudy", "rainy", "snowy", "windy"];
          return weatherOptions[
            Math.floor(Math.random() * weatherOptions.length)
          ];
        },
      },
      // client-side tool that starts user interaction:
      askForConfirmation: {
        description: "Ask the user for confirmation.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
      },
      // client-side tool that is automatically executed on the client:
      getLocation: {
        description:
          "Get the user location. Always ask for confirmation before using this tool.",
        parameters: z.object({}),
      },
    },
    toolCallStreaming: true,
    maxSteps: 5,
    async onError({ error }) {
      console.error(error);
    },
    async onFinish({ response }) {
      console.log("💾 Saving chat messages...");
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages: updatedMessages,
          responseMessages: response.messages,
        }),
      });
      console.log("✅ Chat saved successfully!");
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}
