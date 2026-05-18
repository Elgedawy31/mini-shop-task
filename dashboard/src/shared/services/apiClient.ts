import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api";
import Cookies from "js-cookie";

// Types for API responses - Backend returns data directly, not wrapped in 'data'
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  [key: string]: any;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Create the main API client
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS.DEFAULT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get(API_CONFIG.AUTH_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    const apiError: ApiError = {
      message: "An unexpected error occurred",
      status: error.response?.status,
      errors: [],
    };

    if (error.response) {
      // Server responded with error status
      apiError.message =
        error.response.data?.error || error.response.data?.message || error.message;
      apiError.errors = error.response.data?.errors || [];
      apiError.status = error.response.status;
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = "Network error - please check your connection";
    } else {
      // Something else happened
      apiError.message = error.message;
    }

    console.error("API Error:", apiError);
    return apiError;
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Specialized method for file uploads with progress tracking
  async uploadFiles(
    files: File[],
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<{ names: string[] }>> {
    const formData = new FormData();

    // Append all files to FormData
    files.forEach((file) => {
      formData.append("photos", file);
    });

    const response = await this.client.post(API_CONFIG.ENDPOINTS.FILES.BULK_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          };
          onProgress(progress);
        }
      },
    });

    // Transform the API response to match our expected format
    const apiResponse = response.data;

    // Handle the actual API response structure: { success: true, files: [...] }
    if (apiResponse.success && apiResponse.files) {
      const names = apiResponse.files
        .filter((file: any) => file.success && file.name)
        .map((file: any) => file.name);
      return {
        success: true,
        data: { names },
        message: apiResponse.message,
      };
    }

    // If the response doesn't match expected format, return error
    return {
      success: false,
      message: apiResponse.message || "Upload failed",
      errors: ["Invalid response format from upload service"],
    };
  }

  // Method for replacing a single file
  async replaceFile(
    fileName: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<{ url: string; originalName: string }>> {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await this.client.patch(
      API_CONFIG.ENDPOINTS.FILES.REPLACE_FILE(fileName),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      }
    );

    // Transform the API response
    const apiResponse = response.data;

    if (apiResponse.success) {
      return {
        success: true,
        data: {
          url: apiResponse.url,
          originalName: apiResponse.originalName,
        },
        message: apiResponse.message || "File replaced successfully",
      };
    }

    return {
      success: false,
      message: apiResponse.message || "File replacement failed",
      errors: ["Failed to replace file"],
    };
  }

  // Get the raw axios instance for advanced use cases
  getRawClient(): AxiosInstance {
    return this.client;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or advanced use cases
export { ApiClient };
