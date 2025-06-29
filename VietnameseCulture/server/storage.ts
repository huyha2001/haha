import { documents, folders, users, type Document, type Folder, type User, type InsertDocument, type InsertFolder, type InsertUser, type ContributeDocument } from "@shared/schema";

export interface IStorage {
  // Folder operations
  getFolders(): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolderDocumentCount(folderId: number, count: number): Promise<void>;

  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document operations
  getDocuments(): Promise<Document[]>;
  getDocumentsByFolder(folderId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByGoogleDriveId(googleDriveId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  searchDocuments(query: string): Promise<Document[]>;
  incrementDownloadCount(id: number): Promise<void>;
  toggleFavorite(id: number): Promise<Document | undefined>;
  
  // User contribution operations
  submitDocumentContribution(contribution: ContributeDocument): Promise<Document>;
  getPendingDocuments(): Promise<Document[]>;
  approveDocument(id: number, moderatorNotes?: string): Promise<Document | undefined>;
  rejectDocument(id: number, moderatorNotes: string): Promise<Document | undefined>;
}

export class MemStorage implements IStorage {
  private folders: Map<number, Folder>;
  private documents: Map<number, Document>;
  private users: Map<number, User>;
  private currentFolderId: number;
  private currentDocumentId: number;
  private currentUserId: number;

  constructor() {
    this.folders = new Map();
    this.documents = new Map();
    this.users = new Map();
    this.currentFolderId = 1;
    this.currentDocumentId = 1;
    this.currentUserId = 1;

    // Initialize default folders
    this.initializeDefaultFolders();
    // Initialize sample documents
    this.initializeSampleDocuments();
  }

  private initializeDefaultFolders() {
    const defaultFolders = [
      { name: "Giáo dục", parentId: null, googleDriveId: "education" },
      { name: "Toán học", parentId: 1, googleDriveId: "math" },
      { name: "Vật lý", parentId: 1, googleDriveId: "physics" },
      { name: "Công nghệ", parentId: null, googleDriveId: "technology" },
      { name: "Kinh doanh", parentId: null, googleDriveId: "business" },
      { name: "Y tế", parentId: null, googleDriveId: "health" },
    ];

    defaultFolders.forEach(folderData => {
      const folder: Folder = {
        id: this.currentFolderId++,
        name: folderData.name,
        parentId: folderData.parentId || null,
        googleDriveId: folderData.googleDriveId || null,
        documentCount: 0,
      };
      this.folders.set(folder.id, folder);
    });
  }

  private initializeSampleDocuments() {
    const sampleDocuments = [
      {
        title: "Giáo Trình Toán Học Cơ Bản",
        description: "Tài liệu học tập toán học dành cho học sinh cấp 2 và cấp 3",
        fileName: "giao-trinh-toan-hoc-co-ban.pdf",
        fileSize: 2547832,
        pageCount: 145,
        mimeType: "application/pdf",
        googleDriveId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
        downloadUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
        folderId: 2, // Toán học folder
        isFavorite: true,
      },
      {
        title: "Công Thức Vật Lý Tổng Hợp",
        description: "Tuyển tập các công thức vật lý quan trọng cho kỳ thi",
        fileName: "cong-thuc-vat-ly-tong-hop.pdf",
        fileSize: 1832156,
        pageCount: 89,
        mimeType: "application/pdf",
        googleDriveId: "1AdGjKvBdBZjgmUUqptlbs74OgvE2upms2",
        downloadUrl: "https://drive.google.com/file/d/1AdGjKvBdBZjgmUUqptlbs74OgvE2upms2/view",
        folderId: 3, // Vật lý folder
        isFavorite: false,
      },
      {
        title: "Hướng Dẫn Lập Trình Python",
        description: "Tài liệu hướng dẫn từ cơ bản đến nâng cao về Python",
        fileName: "huong-dan-lap-trinh-python.pdf",
        fileSize: 3421875,
        pageCount: 234,
        mimeType: "application/pdf",
        googleDriveId: "1BdBZjgmUUqptlbs74OgvE2upms3",
        downloadUrl: "https://drive.google.com/file/d/1BdBZjgmUUqptlbs74OgvE2upms3/view",
        folderId: 4, // Công nghệ folder
        isFavorite: true,
      },
      {
        title: "Quản Lý Dự Án Phần Mềm",
        description: "Phương pháp quản lý dự án trong phát triển phần mềm",
        fileName: "quan-ly-du-an-phan-mem.pdf",
        fileSize: 2156743,
        pageCount: 167,
        mimeType: "application/pdf",
        googleDriveId: "1UUqptlbs74OgvE2upms4",
        downloadUrl: "https://drive.google.com/file/d/1UUqptlbs74OgvE2upms4/view",
        folderId: 4, // Công nghệ folder
        isFavorite: false,
      },
      {
        title: "Kế Hoạch Kinh Doanh Hiệu Quả",
        description: "Hướng dẫn lập kế hoạch kinh doanh cho start-up",
        fileName: "ke-hoach-kinh-doanh-hieu-qua.pdf",
        fileSize: 1987654,
        pageCount: 123,
        mimeType: "application/pdf",
        googleDriveId: "1bs74OgvE2upms5",
        downloadUrl: "https://drive.google.com/file/d/1bs74OgvE2upms5/view",
        folderId: 5, // Kinh doanh folder
        isFavorite: false,
      },
      {
        title: "Y Học Cơ Sở - Tập 1",
        description: "Giáo trình y học cơ sở dành cho sinh viên năm nhất",
        fileName: "y-hoc-co-so-tap-1.pdf",
        fileSize: 4523198,
        pageCount: 298,
        mimeType: "application/pdf",
        googleDriveId: "174OgvE2upms6",
        downloadUrl: "https://drive.google.com/file/d/174OgvE2upms6/view",
        folderId: 6, // Y tế folder
        isFavorite: true,
      },
      {
        title: "Tiếng Anh Giao Tiếp Cơ Bản",
        description: "Tài liệu học tiếng Anh giao tiếp hàng ngày",
        fileName: "tieng-anh-giao-tiep-co-ban.pdf",
        fileSize: 2789432,
        pageCount: 156,
        mimeType: "application/pdf",
        googleDriveId: "1OgvE2upms7",
        downloadUrl: "https://drive.google.com/file/d/1OgvE2upms7/view",
        folderId: 1, // Giáo dục folder
        isFavorite: false,
      },
      {
        title: "Đại Số Tuyến Tính",
        description: "Giáo trình đại số tuyến tính cho sinh viên đại học",
        fileName: "dai-so-tuyen-tinh.pdf",
        fileSize: 3156789,
        pageCount: 201,
        mimeType: "application/pdf",
        googleDriveId: "1vE2upms8",
        downloadUrl: "https://drive.google.com/file/d/1vE2upms8/view",
        folderId: 2, // Toán học folder
        isFavorite: true,
      }
    ];

    sampleDocuments.forEach(docData => {
      const document: Document = {
        id: this.currentDocumentId++,
        title: docData.title,
        description: docData.description,
        fileName: docData.fileName,
        fileSize: docData.fileSize,
        pageCount: docData.pageCount,
        mimeType: docData.mimeType,
        googleDriveId: docData.googleDriveId,
        downloadUrl: docData.downloadUrl,
        folderId: docData.folderId,
        isFavorite: docData.isFavorite,
        downloadCount: Math.floor(Math.random() * 50),
        uploadedBy: null, // Admin uploaded
        uploaderName: "Admin",
        status: "approved",
        moderatorNotes: null,
        uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
      };
      this.documents.set(document.id, document);
    });

    // Update folder document counts
    this.updateAllFolderCounts();
  }

  private updateAllFolderCounts() {
    this.folders.forEach(folder => {
      const docCount = Array.from(this.documents.values()).filter(doc => doc.folderId === folder.id && doc.status === "approved").length;
      folder.documentCount = docCount;
    });
  }

  async getFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async getFolder(id: number): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const folder: Folder = {
      id: this.currentFolderId++,
      name: insertFolder.name,
      parentId: insertFolder.parentId || null,
      googleDriveId: insertFolder.googleDriveId || null,
      documentCount: 0,
    };
    this.folders.set(folder.id, folder);
    return folder;
  }

  async updateFolderDocumentCount(folderId: number, count: number): Promise<void> {
    const folder = this.folders.get(folderId);
    if (folder) {
      folder.documentCount = count;
      this.folders.set(folderId, folder);
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      name: insertUser.name,
      email: insertUser.email,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.status === "approved");
  }

  async getDocumentsByFolder(folderId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.folderId === folderId && doc.status === "approved");
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByGoogleDriveId(googleDriveId: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(doc => doc.googleDriveId === googleDriveId);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.currentDocumentId++,
      title: insertDocument.title,
      description: insertDocument.description || null,
      fileName: insertDocument.fileName,
      fileSize: insertDocument.fileSize,
      pageCount: insertDocument.pageCount || null,
      mimeType: insertDocument.mimeType || "application/pdf",
      googleDriveId: insertDocument.googleDriveId,
      downloadUrl: insertDocument.downloadUrl || "",
      folderId: insertDocument.folderId || null,
      isFavorite: insertDocument.isFavorite || false,
      uploadedBy: insertDocument.uploadedBy || null,
      uploaderName: insertDocument.uploaderName || null,
      status: "approved",
      moderatorNotes: null,
      downloadCount: 0,
      uploadedAt: new Date(),
    };
    this.documents.set(document.id, document);

    // Update folder document count
    if (document.folderId) {
      const folderDocs = await this.getDocumentsByFolder(document.folderId);
      await this.updateFolderDocumentCount(document.folderId, folderDocs.length);
    }

    return document;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      const updatedDocument = { ...document, ...updates };
      this.documents.set(id, updatedDocument);
      return updatedDocument;
    }
    return undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const document = this.documents.get(id);
    if (document) {
      this.documents.delete(id);
      
      // Update folder document count
      if (document.folderId) {
        const folderDocs = await this.getDocumentsByFolder(document.folderId);
        await this.updateFolderDocumentCount(document.folderId, folderDocs.length);
      }
      
      return true;
    }
    return false;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.documents.values()).filter(doc =>
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      (doc.description && doc.description.toLowerCase().includes(lowercaseQuery))
    );
  }

  async incrementDownloadCount(id: number): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.downloadCount = (document.downloadCount || 0) + 1;
      this.documents.set(id, document);
    }
  }

  async toggleFavorite(id: number): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      document.isFavorite = !document.isFavorite;
      this.documents.set(id, document);
      return document;
    }
    return undefined;
  }

  // User contribution operations
  async submitDocumentContribution(contribution: ContributeDocument): Promise<Document> {
    // Find or create user
    let user = await this.getUserByEmail(contribution.uploaderEmail);
    if (!user) {
      user = await this.createUser({
        name: contribution.uploaderName,
        email: contribution.uploaderEmail,
      });
    }

    const document: Document = {
      id: this.currentDocumentId++,
      title: contribution.title,
      description: contribution.description || null,
      fileName: contribution.fileName,
      fileSize: contribution.fileSize,
      pageCount: contribution.pageCount || null,
      mimeType: contribution.mimeType || "application/pdf",
      googleDriveId: `pending_${Date.now()}`, // Temporary ID until uploaded to Drive
      downloadUrl: null,
      folderId: contribution.folderId || null,
      isFavorite: false,
      uploadedBy: user.id,
      uploaderName: contribution.uploaderName,
      status: "pending",
      moderatorNotes: null,
      downloadCount: 0,
      uploadedAt: new Date(),
    };
    
    this.documents.set(document.id, document);
    return document;
  }

  async getPendingDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.status === "pending");
  }

  async approveDocument(id: number, moderatorNotes?: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      document.status = "approved";
      document.moderatorNotes = moderatorNotes || null;
      this.documents.set(id, document);
      
      // Update folder document count
      if (document.folderId) {
        const folderDocs = await this.getDocumentsByFolder(document.folderId);
        await this.updateFolderDocumentCount(document.folderId, folderDocs.length);
      }
      
      return document;
    }
    return undefined;
  }

  async rejectDocument(id: number, moderatorNotes: string): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (document) {
      document.status = "rejected";
      document.moderatorNotes = moderatorNotes;
      this.documents.set(id, document);
      return document;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
