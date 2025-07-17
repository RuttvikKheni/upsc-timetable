import { useState } from 'react';

interface UseDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDownload(options: UseDownloadOptions = {}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFile = async (
    url: string, 
    filename: string, 
    requestOptions?: RequestInit
  ) => {
    setIsDownloading(true);
    
    try {
      const response = await fetch(url, requestOptions);
      console.log("🚀 ~ useDownload ~ response:", response)
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      options.onSuccess?.();
      
    } catch (error) {
      const downloadError = error instanceof Error ? error : new Error('Download failed');
      options.onError?.(downloadError);
      throw downloadError;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    downloadFile,
    isDownloading,
  };
} 