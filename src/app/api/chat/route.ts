import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { db } from "@/server/db/index"; 
import { messages } from "@/server/db/schema"; 

export async function POST(req: Request) {
  const { messages: chatMessages } = await req.json();

  // Save user message
  const userMessage = chatMessages[chatMessages.length - 1]; // Last message is user's input
  await db.insert(messages).values({
    role: "user",
    content: userMessage.content,
  });

  // Generate AI response
  const result = await streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages: chatMessages,
  });

  // Convert stream response to text
  let responseText = "";
  for await (const chunk of result.textStream) {
    responseText += chunk;
  }  
  console.log(responseText);

  // Save assistant message
  await db.insert(messages).values({
    role: "assistant",
    content: responseText,
  });

  return Response.json({ response: responseText });
}
