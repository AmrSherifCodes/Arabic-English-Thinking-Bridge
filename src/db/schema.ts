import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const userState = sqliteTable("user_state", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
