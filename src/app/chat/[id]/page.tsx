import { loadChat } from "@/tools/chat-store";
import Chat from "@/ui/chat";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await loadChat(id); 

  return <Chat id={id} initialMessages={messages} />; 
}
