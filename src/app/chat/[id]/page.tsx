import { loadChat } from "@/tools/chat-store";
import { type Message } from "ai";
import Chat from "@/ui/chat";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await loadChat(id); 

  return <Chat id={id} initialMessages={messages as unknown as Message[]} />; 
}
