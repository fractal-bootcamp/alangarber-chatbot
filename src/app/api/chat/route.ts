import { openai } from "@ai-sdk/openai";
import { type Message } from "@ai-sdk/react";
import { appendResponseMessages, streamText } from "ai";
import { saveChat, loadChat } from "@/tools/chat-store";

interface ChatRequestBody {
    id: string;
    messages: Message[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequestBody;
    console.log("📝 Received API request:", JSON.stringify(body, null, 2));

    const { id, messages } = body;

    if (!id || !messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("🚨 Invalid request body:", { id, messages });
      return new Response("Invalid request: chat ID or message missing", { status: 400 });
    }

    const message = messages[messages.length - 1]!;

    if (!message?.role || !message.content) {
      console.error("🚨 Error: Last message is invalid!", message);
      return new Response("Invalid request: last message is missing required fields", { status: 400 });
    }

    console.log("✅ Valid request received, loading chat history...");
    const previousMessages = await loadChat(id);
    const updatedMessages = [...previousMessages, message];

    console.log("🔄 Processing chat with OpenAI...");
    const result = streamText({
      model: openai("gpt-4o"),
      messages: updatedMessages as Message[],
      async onFinish({ response }) {
        console.log("💾 Saving chat messages...");
        await saveChat({
          id,
          messages: appendResponseMessages({
            messages: updatedMessages as Message[],
            responseMessages: response.messages,
          }),
        });
        console.log("✅ Chat saved successfully!");
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("🔥 API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
