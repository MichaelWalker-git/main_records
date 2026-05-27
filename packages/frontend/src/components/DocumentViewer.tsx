import { useState } from 'react';
import { DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DocumentViewerProps {
  url: string;
  filename?: string;
  className?: string;
}

function getFileType(url: string, filename?: string): 'pdf' | 'image' | 'unknown' {
  const name = (filename || url).toLowerCase();
  if (name.endsWith('.pdf') || name.includes('application/pdf')) return 'pdf';
  if (/\.(png|jpg|jpeg|gif|webp|bmp|tiff?)$/i.test(name)) return 'image';
  if (url.includes('.pdf') || url.includes('pdf')) return 'pdf';
  return 'unknown';
}

export function DocumentViewer({ url, filename, className = '' }: DocumentViewerProps) {
  const [error, setError] = useState(false);
  const type = getFileType(url, filename);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-md ${className}`}>
        <ExclamationTriangleIcon className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-500">Unable to preview this document</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-navy-500 hover:underline">
          Download instead
        </a>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`border border-slate-200 rounded-md overflow-hidden bg-slate-50 ${className}`} data-testid="document-viewer">
        <img
          src={url}
          alt={filename || 'Document preview'}
          className="w-full h-auto max-h-[600px] object-contain"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  if (type === 'pdf') {
    return (
      <div className={`border border-slate-200 rounded-md overflow-hidden ${className}`} data-testid="document-viewer">
        <object data={url} type="application/pdf" className="w-full h-[600px]">
          <div className="flex flex-col items-center justify-center p-8">
            <DocumentIcon className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">PDF preview not available in this browser</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-navy-500 hover:underline">
              Open PDF
            </a>
          </div>
        </object>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-md ${className}`} data-testid="document-viewer">
      <DocumentIcon className="w-8 h-8 text-slate-400 mb-2" />
      <p className="text-sm text-slate-500">{filename || 'Document'}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 text-sm text-navy-500 hover:underline">
        Download file
      </a>
    </div>
  );
}
