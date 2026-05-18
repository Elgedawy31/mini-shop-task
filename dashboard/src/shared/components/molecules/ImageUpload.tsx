import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../atoms/button";
import { Card } from "../atoms/card";
import { CheckCircle2, Image as ImageIcon, Sparkles, Upload, X } from "lucide-react";
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

  const isSingleImageMode = maxFiles === 1;
  const hasImage = imageFiles.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          "group overflow-hidden border-2 border-dashed transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:bg-accent/40 hover:shadow-lg hover:shadow-primary/5",
          isDragActive && "border-primary bg-primary/5 shadow-lg shadow-primary/10",
          disabled && "cursor-not-allowed opacity-50",
          hasImage && isSingleImageMode && "border-border bg-card",
          "dark:hover:border-primary/50 dark:hover:bg-accent/50",
          isDragActive && "dark:border-primary dark:bg-primary/5"
        )}
      >
        <div className="p-6 sm:p-8 text-center">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            {hasImage && isSingleImageMode ? (
              <div className="w-full max-w-md">
                <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                  <img
                    src={imageFiles[0].preview}
                    alt="Selected product preview"
                    className="h-56 w-full object-cover"
                  />
                  {!hasPrimaryPhoto && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-md">
                        Primary image
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/38 to-transparent p-4 text-left text-white">
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ready
                      </span>
                    </div>
                    <p className="truncate text-sm font-semibold">{imageFiles[0].file.name}</p>
                    <p className="mt-1 text-xs text-white/80">
                      {formatBytes(imageFiles[0].file.size)} • Click or drop to replace
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/50 transition-transform duration-200",
                    "group-hover:scale-105 group-hover:border-primary/30 group-hover:bg-primary/5"
                  )}
                >
                  <Upload className="h-7 w-7 text-muted-foreground" />
                </div>

                <div className="max-w-sm space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Product media
                  </div>
                  <p className="text-base font-semibold leading-snug text-foreground">
                    {isDragActive
                      ? "Drop the product image here"
                      : isSingleImageMode
                        ? "Upload a clean product cover"
                        : "Upload polished product gallery images"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSingleImageMode
                      ? "Use a sharp hero image with strong lighting and minimal background distractions."
                      : "Choose clear, high-quality images that make the catalogue feel premium."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports{" "}
                    {API_CONFIG.UPLOAD.ALLOWED_EXTENSIONS.map((ex) =>
                      ex.slice(1).toUpperCase()
                    ).join(", ")}{" "}
                    • Max {maxFiles} file{maxFiles > 1 ? "s" : ""} •{" "}
                    {formatBytes(API_CONFIG.UPLOAD.MAX_FILE_SIZE)} each
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="pointer-events-none rounded-xl px-4"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {isSingleImageMode ? "Choose product image" : "Choose images"}
                </Button>
              </>
            )}
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
      {imageFiles.length > 0 && !isSingleImageMode && (
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
