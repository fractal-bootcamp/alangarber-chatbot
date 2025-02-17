// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `fractal-chatbot_${name}`);

export const messages = createTable(
  "message",
  {
    id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    role: text("role").notNull(), // "user" or "assistant"
    content: text("content").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (msg) => ({
    roleIndex: index("role_idx").on(msg.role),
  })
);