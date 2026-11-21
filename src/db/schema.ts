import {
  date,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { BriefContent, BriefStats, EntryAnalysis, SymptomItem } from "@/lib/types";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 of the session token
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const entries = pgTable("entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  entryDate: date("entry_date", { mode: "string" }).notNull(),
  symptoms: jsonb("symptoms").$type<SymptomItem[]>().notNull(),
  bodyParts: jsonb("body_parts").$type<string[]>().notNull().default([]),
  overallSeverity: integer("overall_severity").notNull(),
  mood: integer("mood").notNull(),
  sleepHours: real("sleep_hours").notNull(),
  sleepQuality: integer("sleep_quality").notNull(),
  stress: integer("stress").notNull(),
  energy: integer("energy").notNull(),
  duration: text("duration").notNull().default(""),
  triggers: text("triggers").notNull().default(""),
  medications: text("medications").notNull().default(""),
  notes: text("notes").notNull().default(""),
  analysis: jsonb("analysis").$type<EntryAnalysis>(),
  analysisError: text("analysis_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }).notNull(),
  entryCount: integer("entry_count").notNull(),
  content: jsonb("content").$type<BriefContent>().notNull(),
  stats: jsonb("stats").$type<BriefStats>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Entry = typeof entries.$inferSelect;
export type Brief = typeof briefs.$inferSelect;
