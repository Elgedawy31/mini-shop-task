import { API_CONFIG } from "../config/api";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileValidationResult extends ValidationResult {
  file?: File;
}

export interface FilesValidationResult extends ValidationResult {
  validFiles: File[];
  invalidFiles: { file: File; errors: string[] }[];
}

/**
 * Validates a single file against the configured rules
 */
export const validateFile = (file: File): FileValidationResult => {
  const errors: string[] = [];

  // Check file type
  if (!API_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type as any)) {
    errors.push(`Invalid file type. Allowed types: ${API_CONFIG.UPLOAD.ALLOWED_TYPES.join(", ")}`);
  }

  // Check file size
  if (file.size > API_CONFIG.UPLOAD.MAX_FILE_SIZE) {
    const maxSizeMB = API_CONFIG.UPLOAD.MAX_FILE_SIZE / (1024 * 1024);
    errors.push(`File size exceeds ${maxSizeMB}MB limit`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("File is empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
    file: errors.length === 0 ? file : undefined,
  };
};

/**
 * Validates multiple files against the configured rules
 */
export const validateFiles = (files: File[]): FilesValidationResult => {
  const errors: string[] = [];
  const validFiles: File[] = [];
  const invalidFiles: { file: File; errors: string[] }[] = [];

  // Check total number of files
  if (files.length > API_CONFIG.UPLOAD.MAX_FILES) {
    errors.push(`Maximum ${API_CONFIG.UPLOAD.MAX_FILES} files allowed`);
  }

  // Check if no files provided
  if (files.length === 0) {
    errors.push("No files provided");
  }

  // Validate each file individually
  files.forEach((file, index) => {
    const fileValidation = validateFile(file);

    if (fileValidation.isValid && fileValidation.file) {
      validFiles.push(fileValidation.file);
    } else {
      invalidFiles.push({
        file,
        errors: fileValidation.errors.map((error) => `File ${index + 1}: ${error}`),
      });
      errors.push(...fileValidation.errors.map((error) => `File ${index + 1}: ${error}`));
    }
  });

  return {
    isValid: errors.length === 0 && validFiles.length > 0,
    errors,
    validFiles,
    invalidFiles,
  };
};

/**
 * Generates a preview URL for a file (for images)
 */
export const generatePreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes a preview URL to free up memory
 */
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Gets file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

/**
 * Checks if a file is an image based on its type
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith("image/");
};
