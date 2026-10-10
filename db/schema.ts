import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rooms = sqliteTable('rooms', { code: text('code').primaryKey(), state: text('state').notNull(), version: integer('version').notNull().default(0), updatedAt: integer('updated_at').notNull() });

// One opaque guest hash per participating browser. No activity or identity fields.
export const usageBrowsers = sqliteTable('usage_browsers', {
  guestHash: text('guest_hash').primaryKey(),
});
