import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Environment, Grid } from '@react-three/drei';
import { PDFBook } from './PDFBook';
import { PDFDocument } from '../types';

interface SceneProps {
  pdfs: PDFDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const Scene: React.FC<SceneProps> = ({ pdfs, selectedId, onSelect }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [8, 8, 15], fov: 45 }}
      style={{ background: 'radial-gradient(circle at 50% 50%, #111 0%, #000 100%)' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* 核心網格系統 - 提供空間參考 */}
        <Grid
          infiniteGrid
          fadeDistance={30}
          fadeStrength={5}
          cellSize={1}
          sectionSize={5}
          sectionColor="#222"
          cellColor="#111"
          position={[0, -2, 0]}
        />

        <group position={[0, -1.8, 0]}>
          {pdfs.map((pdf) => (
            <PDFBook 
              key={pdf.id} 
              pdf={pdf} 
              isSelected={selectedId === pdf.id} 
              onSelect={onSelect} 
            />
          ))}
        </group>

        <ContactShadows 
          position={[0, -2, 0]}
          opacity={0.6} 
          scale={30} 
          blur={2.5} 
          far={5} 
          color="#000"
        />
        
        <OrbitControls 
          makeDefault 
          minPolarAngle={Math.PI / 6} 
          maxPolarAngle={Math.PI / 2.1} 
          enableDamping
          dampingFactor={0.05}
        />
        
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
};