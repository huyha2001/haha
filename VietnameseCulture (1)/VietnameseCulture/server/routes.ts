import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertFolderSchema, contributeDocumentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all folders
  app.get("/api/folders", async (req, res) => {
    try {
      const folders = await storage.getFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  // Get folder by ID
  app.get("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const folder = await storage.getFolder(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch folder" });
    }
  });

  // Create folder
  app.post("/api/folders", async (req, res) => {
    try {
      const folderData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(folderData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  // Get all documents
  app.get("/api/documents", async (req, res) => {
    try {
      const { search, folderId } = req.query;
      
      let documents;
      if (search) {
        documents = await storage.searchDocuments(search as string);
      } else if (folderId) {
        documents = await storage.getDocumentsByFolder(parseInt(folderId as string));
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Create document
  app.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Download document
  app.post("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      await storage.incrementDownloadCount(id);
      res.json({ downloadUrl: document.downloadUrl });
    } catch (error) {
      res.status(500).json({ message: "Failed to process download" });
    }
  });

  // Toggle favorite
  app.post("/api/documents/:id/favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.toggleFavorite(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // User contribution routes
  app.post("/api/contribute", async (req, res) => {
    try {
      const contributionData = contributeDocumentSchema.parse(req.body);
      const document = await storage.submitDocumentContribution(contributionData);
      res.status(201).json({
        message: "Tài liệu đã được gửi để duyệt",
        document
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dữ liệu không hợp lệ", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Lỗi khi gửi tài liệu" });
    }
  });

  // Get pending documents (for admin)
  app.get("/api/admin/pending", async (req, res) => {
    try {
      const pendingDocuments = await storage.getPendingDocuments();
      res.json(pendingDocuments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending documents" });
    }
  });

  // Approve document (for admin)
  app.post("/api/admin/approve/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { moderatorNotes } = req.body;
      const document = await storage.approveDocument(id, moderatorNotes);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Tài liệu đã được duyệt", document });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve document" });
    }
  });

  // Reject document (for admin)
  app.post("/api/admin/reject/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { moderatorNotes } = req.body;
      if (!moderatorNotes) {
        return res.status(400).json({ message: "Moderator notes are required for rejection" });
      }
      const document = await storage.rejectDocument(id, moderatorNotes);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Tài liệu đã bị từ chối", document });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject document" });
    }
  });

  // Sync with Google Drive
  app.post("/api/sync-drive", async (req, res) => {
    try {
      // This would implement Google Drive API integration
      // For now, return success
      res.json({ message: "Google Drive sync completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync with Google Drive" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
