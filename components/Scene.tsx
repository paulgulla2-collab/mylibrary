
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, ContactShadows, Environment, Float } from '@react-three/drei';
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
      camera={{ position: [0, 5, 12], fov: 50 }}
      style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group position={[0, -2, 0]}>
          {pdfs.map((pdf) => (
            <PDFBook 
              key={pdf.id} 
              pdf={pdf} 
              isSelected={selectedId === pdf.id} 
              onSelect={onSelect} 
            />
          ))}
        </group>

        <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} />
        
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};
