import { useQuery } from "@tanstack/react-query";
import { Grid, List, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DocumentCard from "./document-card";
import type { Document } from "@shared/schema";

interface DocumentGridProps {
  searchQuery: string;
  folderId: number | null;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function DocumentGrid({ 
  searchQuery, 
  folderId, 
  viewMode, 
  onViewModeChange 
}: DocumentGridProps) {
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (folderId) queryParams.append("folderId", folderId.toString());

  const { data: documents = [], isLoading, error } = useQuery<Document[]>({
    queryKey: ["/api/documents", queryParams.toString()],
  });

  const getBreadcrumb = () => {
    if (folderId) {
      // This would be enhanced with actual folder data
      return ["Trang chủ", "Giáo dục", "Toán học"];
    }
    return ["Trang chủ", "Tất cả tài liệu"];
  };

  const getTitle = () => {
    if (searchQuery) {
      return `Kết quả tìm kiếm: "${searchQuery}"`;
    }
    if (folderId) {
      return "Tài liệu Toán học"; // This would come from folder data
    }
    return "Tất cả tài liệu";
  };

  const breadcrumb = getBreadcrumb();

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Lỗi tải dữ liệu</h3>
          <p className="text-gray-500">Không thể tải danh sách tài liệu. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          {breadcrumb.map((item, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">/</span>}
              <span className={index === breadcrumb.length - 1 ? "text-gray-700 font-medium" : "hover:text-primary cursor-pointer"}>
                {item}
              </span>
            </div>
          ))}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
          <p className="text-gray-600 mt-1">
            {isLoading ? "Đang tải..." : `${documents.length} tài liệu được tìm thấy`}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2",
                viewMode === "grid" ? "bg-primary text-white" : "text-gray-400 hover:text-primary"
              )}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-2",
                viewMode === "list" ? "bg-primary text-white" : "text-gray-400 hover:text-primary"
              )}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sort Dropdown */}
          <Button variant="outline" className="flex items-center">
            <MoreVertical className="h-4 w-4 mr-2" />
            Sắp xếp
          </Button>
        </div>
      </div>

      {/* Documents */}
      {isLoading ? (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        )}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? `Không có tài liệu nào khớp với "${searchQuery}"`
              : "Chưa có tài liệu nào trong thư mục này"
            }
          </p>
        </div>
      ) : (
        <div className={cn(
          "grid gap-6",
          viewMode === "grid" 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        )}>
          {documents.map((document) => (
            <DocumentCard 
              key={document.id} 
              document={document} 
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {documents.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">1-{documents.length}</span> trong{" "}
            <span className="font-medium">{documents.length}</span> tài liệu
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              Trước
            </Button>
            <Button variant="default">1</Button>
            <Button variant="outline">
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
