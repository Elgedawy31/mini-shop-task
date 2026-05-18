import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../atoms/button";
import { Card } from "../atoms/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { validateFiles, generatePreviewUrl, revokePreviewUrl } from "../../services/fileValidation";
import { formatBytes } from "@/shared/utils/helper";
import { API_CONFIG } from "@/shared/config/api";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  hasPrimaryPhoto?: boolean; // NEW: Indicates if a primary photo already exists
}

export function ImageUpload({
  onFilesChange,
  maxFiles = 10,
  className,
  disabled = false,
  hasPrimaryPhoto = false, // NEW: Default to false
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".webp"],
  },
}: ImageUploadProps) {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const imageFilesRef = useRef<ImageFile[]>([]);

  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validation = validateFiles(acceptedFiles);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setErrors([]);

      const newImageFiles: ImageFile[] = acceptedFiles.map((file) => ({
        file,
        preview: generatePreviewUrl(file),
        id: Math.random().toString(36).substr(2, 9),
      }));

      setImageFiles((prev) => {
        const combined = [...prev, ...newImageFiles];
        const limited = combined.slice(0, maxFiles);

        // Clean up excess previews
        combined.slice(maxFiles).forEach((img) => revokePreviewUrl(img.preview));

        return limited;
      });

      // Notify parent of file changes
      const allFiles = [...imageFiles.map((img) => img.file), ...acceptedFiles].slice(0, maxFiles);
      onFilesChange?.(allFiles);
    },
    [imageFiles, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    disabled,
    maxFiles,
    multiple: true,
  });

  const removeImage = useCallback(
    (id: string) => {
      setImageFiles((prev) => {
        const updated = prev.filter((img) => {
          if (img.id === id) {
            revokePreviewUrl(img.preview);
            return false;
          }
          return true;
        });

        // Notify parent of file changes
        onFilesChange?.(updated.map((img) => img.file));

        return updated;
      });
    },
    [onFilesChange]
  );

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      imageFilesRef.current.forEach((img) => revokePreviewUrl(img.preview));
    };
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          "hover:border-primary/50 hover:bg-accent/50",
          isDragActive && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          "dark:hover:border-primary/50 dark:hover:bg-accent/50",
          isDragActive && "dark:border-primary dark:bg-primary/5"
        )}
      >
        <div className="p-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-muted dark:bg-muted"
              )}
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? "Drop images here" : "Drop your images here or Browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports:{" "}
                {API_CONFIG.UPLOAD.ALLOWED_EXTENSIONS.map((ex) => ex.slice(1).toUpperCase()).join(
                  ", "
                )}{" "}
                (Max {maxFiles} files, {formatBytes(API_CONFIG.UPLOAD.MAX_FILE_SIZE)} each)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="pointer-events-none"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose Images
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-xs text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {imageFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Selected Images ({imageFiles.length}/{maxFiles})
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {imageFiles.map((imageFile, index) => (
              <div key={imageFile.id} className="relative group aspect-square">
                <img
                  src={imageFile.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-border"
                />

                {/* Primary Badge - Only show on first image if no existing primary photo */}
                {index === 0 && !hasPrimaryPhoto && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                      Primary
                    </span>
                  </div>
                )}

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(imageFile.id)}
                >
                  <X className="w-3 h-3" />
                </Button>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-primary-foreground p-2 rounded-b-lg">
                  <p className="text-xs truncate">{imageFile.file.name}</p>
                  <p className="text-xs text-primary-foreground/80">
                    {(imageFile.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
