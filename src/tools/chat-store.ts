import { db } from "@/server/db/index";
import { chats, messages as dbMessages } from "@/server/db/schema";
import { generateId, type Message } from "ai";
import { eq } from "drizzle-orm";

type chatId = string;

export async function createChat(): Promise<string> {
  const id = generateId(); // Generate a unique chat ID
  await db.insert(chats).values({ id });
  return id;
}

export async function loadChat(id: string) {
  return await db.select().from(dbMessages).where(eq(dbMessages.chatId, id)).orderBy(dbMessages.createdAt);
}

export async function saveChat({ id, messages }: { id: chatId; messages: Message[] }) {
  console.log("✅ saveChat() called with:", { id, messages });

  if (!id) {
    console.error("🚨 Error: Chat ID is undefined in saveChat()");
    throw new Error("Chat ID cannot be undefined");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    console.error("🚨 Error: Messages are undefined or empty in saveChat()");
    throw new Error("Messages cannot be undefined or empty");
  }

  messages.forEach((msg, index) => {
    if (!msg) {
      console.error(`🚨 Message at index ${index} is undefined!`);
    }
    if (!msg?.role || !msg?.content) {
      console.error(`🚨 Message at index ${index} is missing required fields:`, msg);
    }
  });

  console.log("💾 Preparing to insert messages into database:", messages);

  try {
    await db.insert(dbMessages).values(
      messages.map((msg) => ({
        chatId: id,
        role: msg.role,
        content: msg.content,
      }))
    );
  } catch (error) {
    console.error("🔥 Database Insertion Error:", error);
    throw error;
  }

  console.log("✅ Messages saved successfully!");
}
