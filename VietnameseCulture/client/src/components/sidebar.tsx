import { useQuery } from "@tanstack/react-query";
import { Home, Star, Download, Clock, Folder as FolderIcon, FolderOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Folder } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  currentFolderId: number | null;
  onSelectFolder: (folderId: number | null) => void;
  onClose: () => void;
}

export default function Sidebar({ isOpen, currentFolderId, onSelectFolder, onClose }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1])); // Education folder expanded by default

  const { data: folders = [], isLoading } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });

  const { data: allDocuments = [] } = useQuery<any[]>({
    queryKey: ["/api/documents"],
  });

  const totalDocuments = allDocuments?.length || 0;

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderSelect = (folderId: number | null) => {
    onSelectFolder(folderId);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const parentFolders = folders.filter(folder => !folder.parentId);
  const getChildFolders = (parentId: number) => folders.filter(folder => folder.parentId === parentId);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white shadow-sm border-r border-gray-200 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          {/* Quick Stats */}
          <div className="mb-6">
            <div className="library-gradient p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tổng tài liệu</p>
                  <p className="text-2xl font-bold">{totalDocuments.toLocaleString()}</p>
                </div>
                <svg className="w-8 h-8 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Danh mục
              </h3>
              
              <Button
                variant={currentFolderId === null ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  currentFolderId === null ? "bg-primary text-white" : "text-gray-600 hover:text-primary"
                )}
                onClick={() => handleFolderSelect(null)}
              >
                <Home className="w-4 h-4 mr-3" />
                Tất cả tài liệu
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary">
                <Star className="w-4 h-4 mr-3" />
                Yêu thích
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary">
                <Download className="w-4 h-4 mr-3" />
                Đã tải xuống
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-primary">
                <Clock className="w-4 h-4 mr-3" />
                Gần đây
              </Button>
            </div>

            {/* Folder Structure */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Thư mục
              </h3>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {parentFolders.map((folder) => {
                    const hasChildren = getChildFolders(folder.id).length > 0;
                    const isExpanded = expandedFolders.has(folder.id);
                    const childFolders = getChildFolders(folder.id);

                    return (
                      <div key={folder.id}>
                        <div className="flex items-center">
                          {hasChildren && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto w-auto mr-1"
                              onClick={() => toggleFolder(folder.id)}
                            >
                              <ChevronRight 
                                className={cn(
                                  "w-3 h-3 transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            className={cn(
                              "flex-1 justify-start text-sm",
                              hasChildren ? "" : "ml-5",
                              currentFolderId === folder.id ? "text-primary bg-primary/10" : "text-gray-600 hover:text-primary"
                            )}
                            onClick={() => handleFolderSelect(folder.id)}
                          >
                            <FolderIcon className="w-4 h-4 mr-3 text-orange-500" />
                            <span>{folder.name}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              ({folder.documentCount})
                            </span>
                          </Button>
                        </div>
                        
                        {hasChildren && isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {childFolders.map((childFolder) => (
                              <Button
                                key={childFolder.id}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm",
                                  currentFolderId === childFolder.id ? "text-primary bg-primary/10" : "text-gray-500 hover:text-primary"
                                )}
                                onClick={() => handleFolderSelect(childFolder.id)}
                              >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                {childFolder.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Storage Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Dung lượng</span>
                <span className="text-sm text-gray-500">2.4GB / 5GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "48%" }}></div>
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
