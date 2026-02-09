
import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { PDFPreview } from './components/PDFPreview';
import { PDFDocument, AppState } from './types';
import { savePDF, getAllPDFs, deletePDF } from './services/db';
import { Upload, Plus, Book, Sparkles, FolderOpen, Info, Github } from 'lucide-react';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c'];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    pdfs: [],
    selectedId: null,
    isDragging: false,
    isSaving: false,
    showWelcome: true,
  });

  const loadAll = useCallback(async () => {
    try {
      const all = await getAllPDFs();
      setState(prev => ({ ...prev, pdfs: all }));
    } catch (e) {
      console.error("Failed to load PDFs", e);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleFileDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false, isSaving: true }));

    const files = 'dataTransfer' in e ? e.dataTransfer.files : (e.target as HTMLInputElement).files;
    if (!files) return;

    const newPDFs: PDFDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf') continue;

      const pdf: PDFDocument = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        data: file,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: [
          (Math.random() - 0.5) * 8,
          0,
          (Math.random() - 0.5) * 8
        ],
        rotation: [
          0,
          (Math.random() - 0.5) * Math.PI,
          0
        ]
      };

      await savePDF(pdf);
      newPDFs.push(pdf);
    }

    setState(prev => ({
      ...prev,
      pdfs: [...prev.pdfs, ...newPDFs],
      isSaving: false,
      showWelcome: false
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this book from your cosmos?')) return;
    await deletePDF(id);
    setState(prev => ({
      ...prev,
      pdfs: prev.pdfs.filter(p => p.id !== id),
      selectedId: null
    }));
  };

  const handleFileSystemAccess = async () => {
    // Advanced feature: Native File System Access API
    try {
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        alert(`Successfully connected to: ${handle.name}. Spatial organization is now synced locally (conceptual).`);
      } else {
        alert("Your browser doesn't support the File System Access API yet.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedPDF = state.pdfs.find(p => p.id === state.selectedId);

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden ${state.isDragging ? 'bg-blue-500/20' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setState(prev => ({ ...prev, isDragging: true })); }}
      onDragLeave={() => setState(prev => ({ ...prev, isDragging: false }))}
      onDrop={handleFileDrop}
    >
      {/* 3D World */}
      <Scene 
        pdfs={state.pdfs} 
        selectedId={state.selectedId} 
        onSelect={(id) => setState(prev => ({ ...prev, selectedId: id }))} 
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Navigation / Header */}
        <header className="p-6 flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
              <Book className="text-blue-500" />
              PDF <span className="text-zinc-500 font-light">Cosmos</span>
            </h1>
            <p className="text-zinc-500 text-sm mt-1">A spatial playground for your documents.</p>
          </div>

          <div className="flex gap-3">
             <button 
              onClick={handleFileSystemAccess}
              className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 text-white px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95"
            >
              <FolderOpen size={18} />
              <span className="hidden sm:inline">Desktop Sync</span>
            </button>
            <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95">
              <Plus size={20} />
              <span className="font-semibold">Add PDF</span>
              <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileDrop} />
            </label>
          </div>
        </header>

        {/* Floating Sidebar (Left) */}
        <div className="absolute bottom-10 left-6 pointer-events-auto">
           <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-4 w-64 shadow-2xl">
              <h4 className="text-zinc-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-500" />
                Your Library
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {state.pdfs.length === 0 ? (
                  <p className="text-zinc-600 text-sm italic">Drag PDFs here to start...</p>
                ) : (
                  state.pdfs.map(pdf => (
                    <button
                      key={pdf.id}
                      onClick={() => setState(prev => ({ ...prev, selectedId: pdf.id }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ${
                        state.selectedId === pdf.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pdf.color }} />
                      <span className="truncate">{pdf.name}</span>
                    </button>
                  ))
                )}
              </div>
           </div>
        </div>

        {/* Onboarding Overlay */}
        {state.showWelcome && state.pdfs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-md text-center p-8 bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Upload className="text-blue-500 animate-bounce" size={40} />
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">Populate Your Cosmos</h2>
               <p className="text-zinc-400 mb-6">Drag and drop any PDF files directly into this window to create your 3D spatial library. Everything is stored locally in your browser.</p>
               <div className="flex justify-center gap-4 text-xs text-zinc-500 font-medium uppercase tracking-tighter">
                 <span className="flex items-center gap-1"><Info size={12} /> IndexedDB Storage</span>
                 <span className="flex items-center gap-1"><Sparkles size={12} /> Three.js Visuals</span>
               </div>
            </div>
          </div>
        )}

        {/* Bottom Bar Info */}
        <footer className="absolute bottom-6 right-6 pointer-events-auto flex gap-4 items-center">
           <a href="https://github.com" target="_blank" className="p-2 bg-zinc-900/80 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
              <Github size={20} />
           </a>
           <p className="text-zinc-500 text-xs font-mono">
             {state.pdfs.length} OBJECTS LOADED | SYSTEM READY
           </p>
        </footer>
      </div>

      {/* Dragging State Mask */}
      {state.isDragging && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-blue-600/10 backdrop-blur-sm pointer-events-none border-4 border-dashed border-blue-500/50 m-4 rounded-3xl animate-pulse">
          <div className="text-center text-blue-500">
            <Plus size={80} className="mx-auto" />
            <h3 className="text-4xl font-bold mt-4">Drop to Import</h3>
          </div>
        </div>
      )}

      {/* Loading State */}
      {state.isSaving && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-medium tracking-widest uppercase text-xs">Processing Documents...</p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedPDF && (
        <PDFPreview 
          pdf={selectedPDF} 
          onClose={() => setState(prev => ({ ...prev, selectedId: null }))} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default App;
