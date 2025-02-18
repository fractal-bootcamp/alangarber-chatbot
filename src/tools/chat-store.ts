import { db } from "@/server/db/index";
import { chats, messages as dbMessages } from "@/server/db/schema";
import { generateId, type Message } from "ai";
import { eq } from "drizzle-orm";

export async function createChat(): Promise<string> {
  const id = generateId(); // Generate a unique chat ID
  await db.insert(chats).values({ id });
  return id;
}

export async function loadChat(id: string): Promise<Message[]> {
 return await db.select().from(dbMessages).where(eq(dbMessages.chatId, id)).orderBy(dbMessages.createdAt);
}

type ChatID = string;

export async function saveChat({ id, messages }: { id: ChatID; messages: Message[] }) {
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
    // for each message, append to the database IF it does not yet exist.
    try {
    } catch (error) {
      console.error("🔥 Database Insertion Error:", error);
      throw error;
    }
  });

  const messagesWithChatID = messages.map((msg) => {return {...msg, chatId: id}})

  // add all messages to db, except the ones that were already there.
  try {
    await db.insert(dbMessages).values(messagesWithChatID).onConflictDoNothing()
  } catch(e){
    console.error("failed to add to db: ", e)
  }

  console.log("💾 Preparing to insert messages into database:", messages);


  console.log("✅ Messages saved successfully!");
}
