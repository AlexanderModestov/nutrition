'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

export function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Disable right-click context menu on PDF viewer
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pdf-viewer-container')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Block print, save keyboard shortcuts when viewing PDF
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.pdf-viewer-container')) return;

      // Block Ctrl+P (Print), Ctrl+S (Save), PrintScreen
      if (
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <div className="pdf-viewer-container select-none" style={{ userSelect: 'none' }}>
      {/* Desktop PDF Viewer */}
      {!isMobile ? (
        <div
          className="w-full rounded-lg overflow-hidden bg-secondary/20"
          style={{ height: '75vh' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={title}
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          />

          {/* Watermark overlay */}
          <div className="absolute bottom-4 right-4 opacity-30 text-xs pointer-events-none">
            © Защищено авторским правом
          </div>
        </div>
      ) : (
        /* Mobile PDF Viewer - Use Google Docs Viewer */
        <div className="w-full">
          <div
            className="w-full rounded-lg overflow-hidden bg-secondary/20"
            style={{ height: '70vh' }}
          >
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + pdfUrl)}&embedded=true`}
              className="w-full h-full border-0"
              title={title}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            />
          </div>

          {/* Mobile notice */}
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Защищенный просмотр</p>
                <p>Этот документ защищен от скачивания и копирования. Доступен только для чтения.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .pdf-viewer-container {
          position: relative;
        }
      `}</style>
    </div>
  );
}
