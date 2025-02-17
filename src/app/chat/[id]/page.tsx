import { loadChat } from "@/tools/chat-store";
import { type Message } from "@ai-sdk/react";
import Chat from "@/ui/chat";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ Fix: Await `params` before using `id`
  const messages = await loadChat(id); // ✅ Load chat messages

  return <Chat id={id} initialMessages={messages as unknown as Message[]} />; // ✅ Pass correct data to UI
}
