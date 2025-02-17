import { openai } from "@ai-sdk/openai";
import { appendResponseMessages, streamText } from "ai";
import { saveChat, loadChat } from "@/tools/chat-store";

export async function POST(req: Request) {
  try {
    // Log incoming request
    const body = await req.json();
    console.log("📝 Received API request:", JSON.stringify(body, null, 2));

    const { id, messages } = body;

    if (!id || !messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("🚨 Invalid request body:", { id, messages });
      return new Response("Invalid request: chat ID or message missing", { status: 400 });
    }

    // 🔥 Fix: Extract the last message instead of expecting `message` directly
    const message = messages[messages.length - 1];

    if (!message || !message.role || !message.content) {
      console.error("🚨 Error: Last message is invalid!", message);
      return new Response("Invalid request: last message is missing required fields", { status: 400 });
    }

    console.log("✅ Valid request received, loading chat history...");
    const previousMessages = await loadChat(id);
    const updatedMessages = [...previousMessages, message];

    console.log("🔄 Processing chat with OpenAI...");
    const result = streamText({
      model: openai("gpt-4o"),
      messages: updatedMessages,
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

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("🔥 API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
