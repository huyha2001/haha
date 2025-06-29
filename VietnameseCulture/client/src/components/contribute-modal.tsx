import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Upload, CloudUpload, User, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { contributeDocumentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import type { Folder } from "@shared/schema";

type ContributeFormData = z.infer<typeof contributeDocumentSchema>;

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContributeModal({ isOpen, onClose }: ContributeModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
  });

  const form = useForm<ContributeFormData>({
    resolver: zodResolver(contributeDocumentSchema),
    defaultValues: {
      title: "",
      description: "",
      fileName: "",
      fileSize: 0,
      pageCount: undefined,
      mimeType: "application/pdf",
      folderId: undefined,
      isFavorite: false,
      uploaderName: "",
      uploaderEmail: "",
    },
  });

  const contributeMutation = useMutation({
    mutationFn: (data: ContributeFormData) => {
      return apiRequest("POST", "/api/contribute", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Gửi thành công!",
        description: "Tài liệu của bạn đã được gửi và đang chờ duyệt. Chúng tôi sẽ xem xét trong thời gian sớm nhất.",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi gửi tài liệu",
        description: error.message || "Không thể gửi tài liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === "application/pdf");
    
    if (pdfFile) {
      handleFileSelect(pdfFile);
    } else {
      toast({
        title: "File không hợp lệ",
        description: "Chỉ chấp nhận file PDF.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File quá lớn",
        description: "File không được vượt quá 10MB.",
        variant: "destructive",
      });
      return;
    }

    form.setValue("fileName", file.name);
    form.setValue("fileSize", file.size);
    form.setValue("title", file.name.replace(".pdf", ""));
    
    // In a real implementation, you would extract page count from PDF
    form.setValue("pageCount", Math.floor(Math.random() * 50) + 10);
  };

  const onSubmit = (data: ContributeFormData) => {
    contributeMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Đóng góp tài liệu</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Hướng dẫn đóng góp</h4>
              <p className="text-sm text-blue-700">
                Tài liệu của bạn sẽ được kiểm duyệt trước khi xuất hiện trên thư viện. 
                Vui lòng đảm bảo tài liệu có nội dung phù hợp và bổ ích cho cộng đồng.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="uploaderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Tên của bạn</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên của bạn..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uploaderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* File Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Kéo thả file PDF vào đây hoặc
              </p>
              <Button
                type="button"
                variant="link"
                className="text-primary p-0 h-auto"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "application/pdf";
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleFileSelect(file);
                  };
                  input.click();
                }}
              >
                chọn file từ máy tính
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Chỉ chấp nhận file PDF, tối đa 10MB
              </p>
              {form.watch("fileName") && (
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Đã chọn: {form.watch("fileName")}
                  </p>
                </div>
              )}
            </div>

            {/* Document Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tài liệu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên tài liệu..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả tài liệu</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả ngắn về nội dung và tác dụng của tài liệu..."
                        rows={3}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="folderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục phù hợp..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id.toString()}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={contributeMutation.isPending || !form.watch("fileName")}
                className="min-w-[120px]"
              >
                {contributeMutation.isPending ? "Đang gửi..." : "Gửi đóng góp"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}