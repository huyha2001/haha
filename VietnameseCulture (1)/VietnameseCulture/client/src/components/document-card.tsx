import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MoreVertical, Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Document } from "@shared/schema";

interface DocumentCardProps {
  document: Document;
  viewMode: "grid" | "list";
}

export default function DocumentCard({ document, viewMode }: DocumentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/documents/${document.id}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: document.isFavorite ? "Đã bỏ yêu thích" : "Đã thêm vào yêu thích",
        description: `"${document.title}" ${document.isFavorite ? "đã được bỏ khỏi" : "đã được thêm vào"} danh sách yêu thích.`,
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái yêu thích",
        variant: "destructive",
      });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/documents/${document.id}/download`),
    onSuccess: (response) => {
      response.json().then((data) => {
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Tải xuống thành công",
        description: `Đang tải "${document.title}"`,
      });
    },
    onError: () => {
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải xuống tài liệu",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const now = new Date();
    const docDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return docDate.toLocaleDateString("vi-VN");
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-red-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{document.title}</h3>
              <p className="text-sm text-gray-500 truncate">{document.description}</p>
              <div className="flex items-center text-xs text-gray-400 space-x-4 mt-1">
                <span>{formatFileSize(document.fileSize)}</span>
                {document.pageCount && <span>{document.pageCount} trang</span>}
                <span>{formatDate(document.uploadedAt)}</span>
                <span>{document.downloadCount} lượt tải</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => favoriteMutation.mutate()}
                disabled={favoriteMutation.isPending}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    document.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  )}
                />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
              >
                <Download className="h-4 w-4 mr-1" />
                Tải xuống
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="document-card-hover">
      <CardContent className="p-6">
        {/* File Type Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
            >
              <Heart 
                className={cn(
                  "h-4 w-4",
                  document.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                )}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
        
        {/* Document Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
            {document.title}
          </h3>
          {document.description && (
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">
              {document.description}
            </p>
          )}
          <div className="flex items-center text-xs text-gray-400 space-x-3">
            <span>{formatFileSize(document.fileSize)}</span>
            {document.pageCount && (
              <>
                <span>•</span>
                <span>{document.pageCount} trang</span>
              </>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 mb-4">
          <Button
            className="flex-1 text-xs"
            onClick={() => downloadMutation.mutate()}
            disabled={downloadMutation.isPending}
          >
            <Download className="h-3 w-3 mr-1" />
            {downloadMutation.isPending ? "Đang tải..." : "Tải xuống"}
          </Button>
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Meta Info */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{formatDate(document.uploadedAt)}</span>
            <span>{document.downloadCount} lượt tải</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
