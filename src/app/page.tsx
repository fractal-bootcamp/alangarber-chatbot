import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Welcome to the Chatbot</h1>
      <p>Start a conversation with AI</p>
      <Link
        href="/chat"
        style={{
          fontSize: "1.2rem",
          padding: "10px",
          background: "blue",
          color: "white",
          borderRadius: "5px",
          textDecoration: "none",
        }}
      >
        Start Chat
      </Link>
    </div>
  );
}
