import { sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

export const createTable = sqliteTableCreator(
  (name) => `fractal-chatbot_${name}`,
);

export const chats = createTable("chat", {
  id: text("id").primaryKey(),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const messages = createTable(
  "message",
  {
    id: text("id").primaryKey(),
    chatId: text("chat_id")
      .notNull()
      .references(() => chats.id),
    role: text("role", {
      enum: ["user", "assistant", "system", "data"],
    }).notNull(), // "user" or "assistant"
    content: text("content").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (msg) => ({
    chatIndex: index("chat_idx").on(msg.chatId),
  }),
);
