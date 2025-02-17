"use client";

import { Message, useChat } from "@ai-sdk/react";
import { useState } from "react";

export default function Chat({ id, initialMessages }: { id?: string; initialMessages?: Message[] }) {
  if (!id) {
    console.error("🚨 Error: Chat ID is missing in Chat component!");
    return <div>Error: Chat ID is missing.</div>;
  }

  const { input, handleInputChange, handleSubmit, messages, isLoading } = useChat({
    id,
    initialMessages,
    sendExtraMessageFields: true,
  });

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Chat with AI</h1>

      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        {messages.map((m, index) => (
          <div key={index} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
            <strong>{m.role === "user" ? "You: " : "AI: "}</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ flex: "1", padding: "10px" }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: "10px 15px" }}>
          Send
        </button>
      </form>
    </div>
  );
}
