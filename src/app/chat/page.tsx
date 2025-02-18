import { redirect } from "next/navigation";
import { createChat } from "@/tools/chat-store";

export default async function Page() {
  const id = await createChat(); // Create a new chat session
  redirect(`/chat/${id}`); // Redirect to that session
}
