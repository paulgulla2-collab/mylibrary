import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { PDFPreview } from './components/PDFPreview';
import { PDFDocument, AppState } from './types';
import { savePDF, getAllPDFs, deletePDF } from './services/db';
import { Upload, Plus, Book, Sparkles, FolderOpen, Info, Github, HardDrive } from 'lucide-react';

const COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
];

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
      setState(prev => ({ ...prev, pdfs: all, showWelcome: all.length === 0 }));
    } catch (e) {
      console.error("Failed to load PDFs", e);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleFileDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragging: false }));

    const files = 'dataTransfer' in e ? e.dataTransfer.files : (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    setState(prev => ({ ...prev, isSaving: true }));
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
          (Math.random() - 0.5) * 12,
          0,
          (Math.random() - 0.5) * 12
        ],
        rotation: [
          0,
          (Math.random() - 0.5) * Math.PI * 0.5,
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
    try {
      // @ts-ignore
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        alert(`Spatial Cosmos connected to: ${handle.name}\nLocal indexing is simulated in this version.`);
      } else {
        alert("The File System Access API is not supported in your browser yet.");
      }
    } catch (e) {
      console.warn("User cancelled or API failed", e);
    }
  };

  const selectedPDF = state.pdfs.find(p => p.id === state.selectedId);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-black selection:bg-blue-500/30"
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
          <div className="group">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tighter">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-blue-600/20">
                <Book size={24} />
              </div>
              PDF <span className="text-zinc-600 font-light">COSMOS</span>
            </h1>
            <p className="text-zinc-500 text-[10px] font-mono mt-1 uppercase tracking-widest opacity-70">Spatial Document Universe v1.0</p>
          </div>

          <div className="flex gap-2">
             <button 
              onClick={handleFileSystemAccess}
              className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-xl transition-all hover:border-white/20 active:scale-95 shadow-xl"
            >
              <HardDrive size={18} className="text-zinc-500" />
              <span className="hidden sm:inline font-medium">Desktop Link</span>
            </button>
            <label className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-xl shadow-2xl cursor-pointer transition-all hover:bg-zinc-200 active:scale-95">
              <Plus size={20} />
              <span className="font-bold">Import</span>
              <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileDrop} />
            </label>
          </div>
        </header>

        {/* Library Sidebar (Left) */}
        <div className="absolute bottom-10 left-6 pointer-events-auto">
           <div className="bg-black/40 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 w-72 shadow-2xl">
              <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Spatial Index</span>
                <Sparkles size={12} className="text-blue-500" />
              </h4>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {state.pdfs.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-xl">
                    <p className="text-zinc-600 text-xs italic">No objects found in orbit</p>
                  </div>
                ) : (
                  state.pdfs.map(pdf => (
                    <button
                      key={pdf.id}
                      onClick={() => setState(prev => ({ ...prev, selectedId: pdf.id }))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 group/item ${
                        state.selectedId === pdf.id 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div 
                        className={`w-2 h-4 rounded-sm transition-all ${state.selectedId === pdf.id ? 'bg-white' : ''}`} 
                        style={{ backgroundColor: state.selectedId === pdf.id ? undefined : pdf.color }} 
                      />
                      <span className="truncate flex-1 font-medium">{pdf.name}</span>
                    </button>
                  ))
                )}
              </div>
           </div>
        </div>

        {/* Onboarding Overlay */}
        {state.showWelcome && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-md text-center p-10 bg-zinc-950/40 backdrop-blur-3xl border border-white/5 rounded-[40px] animate-in fade-in zoom-in-95 duration-1000">
               <div className="relative w-24 h-24 mx-auto mb-8">
                 <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 animate-pulse"></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                   <Upload className="text-white animate-bounce" size={40} />
                 </div>
               </div>
               <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Expand Your Library</h2>
               <p className="text-zinc-500 leading-relaxed mb-8">
                 Drag PDF files into this 3D cosmos to create persistent spatial objects. Your files remain yours, stored locally in your browser's core.
               </p>
               <div className="grid grid-cols-2 gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                 <div className="p-3 border border-white/5 rounded-2xl bg-white/5">IndexedDB Persistent</div>
                 <div className="p-3 border border-white/5 rounded-2xl bg-white/5">Native WebGL</div>
               </div>
            </div>
          </div>
        )}

        {/* Global Stats */}
        <footer className="absolute bottom-6 right-6 pointer-events-auto flex items-center gap-6">
           <div className="flex -space-x-2">
             {state.pdfs.slice(0, 5).map(p => (
               <div key={p.id} className="w-6 h-6 rounded-full border-2 border-black" style={{ backgroundColor: p.color }} />
             ))}
           </div>
           <p className="text-zinc-600 text-[10px] font-mono tracking-tighter">
             MEMORY_USE: { (state.pdfs.reduce((acc, p) => acc + p.size, 0) / 1024 / 1024).toFixed(1) }MB | OBJECTS: {state.pdfs.length}
           </p>
           <a href="https://github.com" target="_blank" className="p-2.5 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 rounded-full text-zinc-500 hover:text-white transition-all">
              <Github size={18} />
           </a>
        </footer>
      </div>

      {/* Dragging State Mask */}
      {state.isDragging && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-blue-600/5 backdrop-blur-md pointer-events-none m-6 rounded-[50px] animate-in fade-in duration-300">
          <div className="text-center">
            <div className="w-32 h-32 border-4 border-dashed border-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin-slow">
               <Plus size={48} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-black text-blue-500 uppercase tracking-[0.3em]">Release to Import</h3>
          </div>
        </div>
      )}

      {/* Saving State */}
      {state.isSaving && (
        <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
               <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-white font-bold tracking-[0.2em] uppercase text-[10px]">Materializing Space Objects...</p>
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