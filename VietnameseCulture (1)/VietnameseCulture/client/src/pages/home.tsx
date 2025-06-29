import { useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import DocumentGrid from "@/components/document-grid";
import UploadModal from "@/components/upload-modal";
import ContributeModal from "@/components/contribute-modal";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onShowUpload={() => setUploadModalOpen(true)}
        onShowContribute={() => setContributeModalOpen(true)}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          currentFolderId={currentFolderId}
          onSelectFolder={setCurrentFolderId}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 min-h-screen overflow-y-auto">
          <DocumentGrid
            searchQuery={searchQuery}
            folderId={currentFolderId}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </main>
      </div>

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

      <ContributeModal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
      />
    </div>
  );
}
