"use client";

import { useChat, useCompletion } from "@ai-sdk/react";
import { type Message } from "ai";
import { Weather } from "@/app/components/weather";
import { Stock } from "@/app/components/stock";
import Spinner from "react-bootstrap/Spinner";

export default function Chat({
  id,
  initialMessages,
}: {
  id?: string;
  initialMessages?: Message[];
}) {
  const {
    input: chatInput,
    handleInputChange: handleChatInputChange,
    handleSubmit: handleChatSubmit,
    messages,
    status: chatStatus,
    addToolResult,
  } = useChat({
    id,
    initialMessages,
    sendExtraMessageFields: true,
    maxSteps: 5,

    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getLocation") {
        const cities = ["New York", "Los Angeles", "Chicago", "San Francisco"];
        return cities[Math.floor(Math.random() * cities.length)];
      }
    },
  });

  const {
    completion,
    input: completionInput,
    handleInputChange: handleCompletionInputChange,
    handleSubmit: handleCompletionSubmit,
    isLoading,
  } = useCompletion({
    api: "/api/completion",
    experimental_throttle: 50,
  })

  if (!id) {
    console.error("🚨 Error: Chat ID is missing in Chat component!");
    return <div>Error: Chat ID is missing.</div>;
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Chat with AI</h1>

      <div
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((m, index) => (
          <div
            key={index}
            style={{ textAlign: m.role === "user" ? "right" : "left" }}
          >
            <strong>{m.role === "user" ? "You: " : "AI: "}</strong>{" "}
            {m.parts
              ? m.parts.map((part) => {
                  switch (part.type) {
                    case "text":
                      return part.text;
                    case "tool-invocation": {
                      const callId = part.toolInvocation.toolCallId;
                      switch (part.toolInvocation.toolName) {
                        case "askForConfirmation": {
                          const args = part.toolInvocation.args as {
                            message?: string;
                          };
                          switch (part.toolInvocation.state) {
                            case "call":
                              return (
                                <div key={callId} className="text-gray-500">
                                  {args?.message}
                                  <div className="flex gap-2">
                                    <button
                                      className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                                      onClick={() =>
                                        addToolResult({
                                          toolCallId: callId,
                                          result: "Yes, confirmed.",
                                        })
                                      }
                                    >
                                      Yes
                                    </button>
                                    <button
                                      className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
                                      onClick={() =>
                                        addToolResult({
                                          toolCallId: callId,
                                          result: "No, denied",
                                        })
                                      }
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              );
                            case "result":
                              return (
                                <div key={callId} className="text-gray-500">
                                  Location access allowed:{" "}
                                  {part.toolInvocation.result}
                                </div>
                              );
                          }
                          break;
                        }

                        case "getLocation": {
                          switch (part.toolInvocation.state) {
                            case "call":
                              return (
                                <div key={callId} className="text-gray-500">
                                  Getting location...
                                </div>
                              );
                            case "result":
                              return (
                                <div key={callId} className="text-gray-500">
                                  Location: {part.toolInvocation.result}
                                </div>
                              );
                          }
                          break;
                        }

                        case "getWeatherInformation": {
                          const args = part.toolInvocation.args as {
                            city?: string;
                          };
                          switch (part.toolInvocation.state) {
                            case "partial-call":
                              return (
                                <pre key={callId}>
                                  {JSON.stringify(part.toolInvocation, null, 2)}
                                </pre>
                              );
                            case "call":
                              return (
                                <div key={callId} className="text-gray-500">
                                  Getting weather information for{" "}
                                  {args?.city ?? "unknown city"}...
                                </div>
                              );
                            case "result":
                              return (
                                <div key={callId} className="text-gray-500">
                                  <Weather {...part.toolInvocation.result} />
                                </div>
                              );
                          }
                          break;
                        }

                        case "getStockInformation": {
                          const args = part.toolInvocation.args as {
                            symbol?: string;
                            price?: number;
                          };
                          switch (part.toolInvocation.state) {
                            case "partial-call":
                              return (
                                <pre key={callId}>
                                  {JSON.stringify(part.toolInvocation, null, 2)}
                                </pre>
                              );
                            case "call":
                              return (
                                <div key={callId} className="text-gray-500">
                                  Getting price information for{" "}
                                  {args?.symbol ?? "unknown symbol"}...
                                </div>
                              );
                            case "result":
                              return (
                                <div key={callId} className="text-gray-500">
                                  <Stock {...part.toolInvocation.result} />
                                </div>
                              );
                          }
                          break;
                        }
                      }
                    }
                  }
                })
              : m.content}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleChatSubmit}
        style={{ display: "flex", gap: "10px", justifyContent: "center" }}
      >
        <input
          type="text"
          value={chatInput}
          onChange={handleChatInputChange}
          placeholder="Type your message..."
          style={{ flex: "1", padding: "10px" }}
        />
        <button
          type="submit"
          disabled={chatStatus !== "ready"}
          style={{ padding: "10px 15px" }}
        >
          Send
        </button>
      </form>

      {/* Completion Input */}
            <h2 style={{ marginTop: "20px" }}>AI Completion</h2>
      <form onSubmit={handleCompletionSubmit}>
        <input
          type="text"
          name="prompt"
          value={completionInput}
          onChange={handleCompletionInputChange}
          placeholder="Get AI-powered suggestions..."
          style={{ padding: "10px", width: "100%" }}
        />
        <button type="submit" style={{ padding: "10px", marginTop: "10px" }}>
          Generate
        </button>
      </form>

        {isLoading ? <Spinner style={{ marginTop: "10px" }} /> : null}
     <div style={{ marginTop: "10px", fontStyle: "italic" }}>{completion}</div>
    </div>
  );
}
