
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PDFDocument } from '../types';

interface PDFBookProps {
  pdf: PDFDocument;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PDFBook: React.FC<PDFBookProps> = ({ pdf, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Gentle floating animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = pdf.position[1] + Math.sin(time + Number(pdf.id.slice(0, 4))) * 0.1;
    meshRef.current.rotation.y = pdf.rotation[1] + Math.cos(time * 0.5) * 0.05;
  });

  return (
    <group position={pdf.position} rotation={pdf.rotation}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(pdf.id);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        {/* Book Shape: Width, Height, Depth (Spine) */}
        <boxGeometry args={[1.5, 2, 0.3]} />
        <meshStandardMaterial 
          color={pdf.color} 
          metalness={0.2} 
          roughness={0.5}
          emissive={isSelected ? pdf.color : 'black'}
          emissiveIntensity={isSelected ? 0.5 : 0}
        />
        
        {/* Label on top of the book */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.4}
        >
          {pdf.name.length > 20 ? pdf.name.substring(0, 17) + '...' : pdf.name}
        </Text>

        {/* Highlight ring if selected or hovered */}
        {(hovered || isSelected) && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
            <ringGeometry args={[0.8, 0.9, 32]} />
            <meshBasicMaterial color={isSelected ? "#4ade80" : "white"} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
      </mesh>
    </group>
  );
};
