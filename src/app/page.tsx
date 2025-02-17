"use client";

import { useChat } from "ai/react";
import { useEffect, useState } from "react";

export default function Page() {
  const { messages, handleSubmit, isLoading, setMessages } = useChat();
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState(""); // Separate input state

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch("/api/chat/history");
      const data = await res.json();
      setChatHistory(data);
    }
    fetchMessages();
  }, []);

  async function customHandleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Add user message immediately
    const newUserMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newUserMessage]);

    // Clear input immediately
    setUserInput("");

    // Send request to API
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...chatHistory, newUserMessage] }),
    });

    const { response } = await res.json();

    // Add assistant message immediately
    const newAssistantMessage = { role: "assistant", content: response };
    setMessages((prev) => [...prev, newAssistantMessage]);
  }

  return (
    <div>
      {[...chatHistory, ...messages].map((message, index) => (
        <div key={index}>
          <strong>{message.role}:</strong> {message.content}
        </div>
      ))}

      <form onSubmit={customHandleSubmit}>
        <input
          value={userInput} // Use custom state
          placeholder="Send a message..."
          onChange={(e) => setUserInput(e.target.value)} // Update state
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
