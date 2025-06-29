// Google Drive API integration utilities
// This would contain functions to interact with Google Drive API

export interface GoogleDriveConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scopes: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink: string;
  parents?: string[];
}

export class GoogleDriveService {
  private gapi: any;
  private isInitialized = false;

  constructor(private config: GoogleDriveConfig) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load Google API
    await this.loadGoogleAPI();
    await this.gapi.load('client:auth2', this.initializeGapi.bind(this));
    this.isInitialized = true;
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined') {
        this.gapi = window.gapi;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private async initializeGapi(): Promise<void> {
    await this.gapi.client.init({
      apiKey: this.config.apiKey,
      clientId: this.config.clientId,
      discoveryDocs: [this.config.discoveryDoc],
      scope: this.config.scopes
    });
  }

  async listFiles(folderId?: string, mimeType = 'application/pdf'): Promise<DriveFile[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let query = `mimeType='${mimeType}' and trashed=false`;
    if (folderId) {
      query += ` and '${folderId}' in parents`;
    }

    const response = await this.gapi.client.drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents)',
      orderBy: 'modifiedTime desc'
    });

    return response.result.files || [];
  }

  async listFolders(parentId?: string): Promise<DriveFile[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let query = "mimeType='application/vnd.google-apps.folder' and trashed=false";
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    }

    const response = await this.gapi.client.drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,createdTime,modifiedTime,parents)',
      orderBy: 'name'
    });

    return response.result.files || [];
  }

  async getFileMetadata(fileId: string): Promise<DriveFile> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const response = await this.gapi.client.drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,parents'
    });

    return response.result;
  }

  async downloadFile(fileId: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const response = await this.gapi.client.drive.files.get({
      fileId,
      alt: 'media'
    });

    return response.body;
  }

  getDirectDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  getPreviewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  isSignedIn(): boolean {
    if (!this.isInitialized) return false;
    return this.gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    await this.gapi.auth2.getAuthInstance().signIn();
  }

  async signOut(): Promise<void> {
    if (!this.isInitialized) return;
    await this.gapi.auth2.getAuthInstance().signOut();
  }
}

// Environment variables for Google Drive API
const googleDriveConfig: GoogleDriveConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '',
  clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
  discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  scopes: 'https://www.googleapis.com/auth/drive.readonly'
};

export const googleDriveService = new GoogleDriveService(googleDriveConfig);

// Utility function to convert Google Drive file to our Document schema
export function convertDriveFileToDocument(file: DriveFile, folderId?: number): any {
  return {
    title: file.name.replace('.pdf', ''),
    description: `Tài liệu từ Google Drive - ${file.name}`,
    fileName: file.name,
    fileSize: parseInt(file.size || '0'),
    pageCount: null, // Would need to be extracted from PDF
    mimeType: file.mimeType,
    googleDriveId: file.id,
    downloadUrl: file.webContentLink,
    folderId: folderId || null,
    isFavorite: false
  };
}
