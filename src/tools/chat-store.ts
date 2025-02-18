import { db } from "@/server/db/index";
import { chats, messages } from "@/server/db/schema";
import { generateId } from "ai";
import { eq } from "drizzle-orm";

export async function createChat(): Promise<string> {
  const id = generateId(); // Generate a unique chat ID
  await db.insert(chats).values({ id });
  return id;
}

export async function loadChat(id: string) {
  return db.select().from(messages).where(eq(messages.chatId, id)).orderBy(messages.createdAt);
}

export async function saveChat({ id, messages: chatMessages }: { id: string; messages: { role?: string; content?: string }[] }) {
  console.log("✅ saveChat() called with:", { id, messages: chatMessages });

  if (!id) {
    console.error("🚨 Error: Chat ID is undefined in saveChat()");
    throw new Error("Chat ID cannot be undefined");
  }
  if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
    console.error("🚨 Error: Messages are undefined or empty in saveChat()");
    throw new Error("Messages cannot be undefined or empty");
  }

  chatMessages.forEach((msg, index) => {
    if (!msg) {
      console.error(`🚨 Message at index ${index} is undefined!`);
    }
    if (!msg?.role || !msg?.content) {
      console.error(`🚨 Message at index ${index} is missing required fields:`, msg);
    }
  });

  console.log("💾 Preparing to insert messages into database:", chatMessages);

  try {
    await db.insert(messages).values(
      chatMessages.map((msg) => ({
        chatId: id,
        role: msg.role!,
        content: msg.content!,
      }))
    );
  } catch (error) {
    console.error("🔥 Database Insertion Error:", error);
    throw error;
  }

  console.log("✅ Messages saved successfully!");
}
