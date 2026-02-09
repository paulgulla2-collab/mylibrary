
import React, { useEffect, useState } from 'react';
import { PDFDocument } from '../types';
import { X, ExternalLink, Trash2, Download } from 'lucide-react';

interface PDFPreviewProps {
  pdf: PDFDocument;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ pdf, onClose, onDelete }) => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(pdf.data);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pdf]);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = pdf.name;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl h-[90vh] bg-zinc-900 rounded-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-10 rounded shadow-lg flex items-center justify-center" style={{ backgroundColor: pdf.color }}>
              <span className="text-[10px] font-bold text-white">PDF</span>
            </div>
            <div>
              <h3 className="text-white font-semibold truncate max-w-md">{pdf.name}</h3>
              <p className="text-zinc-400 text-xs">{(pdf.size / 1024 / 1024).toFixed(2)} MB • Added recently</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={() => onDelete(pdf.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-950 relative">
          {url ? (
            <iframe 
              src={`${url}#toolbar=1`} 
              className="w-full h-full border-none" 
              title={pdf.name}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              Loading document...
            </div>
          )}
        </div>
        
        {/* Footer/Actions */}
        <div className="p-3 bg-zinc-900 border-t border-white/10 flex justify-end">
           <button 
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
           >
             <ExternalLink size={16} />
             Open in New Tab
           </button>
        </div>
      </div>
    </div>
  );
};
