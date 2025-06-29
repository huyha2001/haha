import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  documentCount: integer("document_count").default(0),
  googleDriveId: text("google_drive_id"),
});

// User table for contributors
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  pageCount: integer("page_count"),
  mimeType: text("mime_type").default("application/pdf"),
  googleDriveId: text("google_drive_id").notNull().unique(),
  downloadUrl: text("download_url"),
  folderId: integer("folder_id"),
  isFavorite: boolean("is_favorite").default(false),
  downloadCount: integer("download_count").default(0),
  uploadedBy: integer("uploaded_by"), // Reference to users table
  uploaderName: text("uploader_name"), // For display purposes
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  status: text("status").default("pending"), // pending, approved, rejected
  moderatorNotes: text("moderator_notes"),
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  documentCount: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  downloadCount: true,
  uploadedAt: true,
  status: true,
  moderatorNotes: true,
});

// Schema for user contribution form
export const contributeDocumentSchema = insertDocumentSchema.extend({
  uploaderName: z.string().min(1, "Tên người đóng góp là bắt buộc"),
  uploaderEmail: z.string().email("Email không hợp lệ"),
}).omit({
  uploadedBy: true,
  googleDriveId: true,
  downloadUrl: true,
});

export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Folder = typeof folders.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type ContributeDocument = z.infer<typeof contributeDocumentSchema>;
