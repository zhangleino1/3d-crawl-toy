import React from 'react';
import { useBox, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

export function Cabinet() {
  // Ground floor (visual only or catch-all)
  const [groundRef] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0] 
  }));

  // Cabinet Floor with a hole for the chute
  // Total area is 5x5 (from -2.5 to 2.5)
  // Hole at bottom-left: x: [-2.5, -1.2], z: [1.2, 2.5]
  
  // Section 1: Right side (covers x from -1.2 to 2.5)
  const [floorRight] = useBox(() => ({ position: [0.65, 2, 0], args: [3.7, 0.2, 5] }));
  // Section 2: Top-left (covers x from -2.5 to -1.2, z from -2.5 to 1.2)
  const [floorTopLeft] = useBox(() => ({ position: [-1.85, 2, -0.65], args: [1.3, 0.2, 3.7] }));

  // Walls (Physics)
  const [backWall] = useBox(() => ({ position: [0, 5, -2.5], args: [5, 6, 0.2] }));
  const [leftWall] = useBox(() => ({ position: [-2.5, 5, 0], args: [0.2, 6, 5] }));
  const [rightWall] = useBox(() => ({ position: [2.5, 5, 0], args: [0.2, 6, 5] }));
  const [frontWall] = useBox(() => ({ position: [0, 5, 2.5], args: [5, 6, 0.2] }));

  return (
    <group>
      {/* Ground */}
      <mesh ref={groundRef as any} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Cabinet Floor Sections (Visual) */}
      <group position={[0, 2, 0]}>
        <mesh position={[0.65, 0, 0]} receiveShadow>
          <boxGeometry args={[3.7, 0.2, 5]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
        <mesh position={[-1.85, 0, -0.65]} receiveShadow>
          <boxGeometry args={[1.3, 0.2, 3.7]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </group>

      {/* Glass Walls (Visual) */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[5, 6, 5]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.15} 
          roughness={0.05} 
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Frame Pillars */}
      {[-2.4, 2.4].map(x => [-2.4, 2.4].map(z => (
        <mesh key={`${x}-${z}`} position={[x, 5, z]} castShadow>
          <boxGeometry args={[0.2, 6, 0.2]} />
          <meshStandardMaterial color="#be123c" />
        </mesh>
      )))}
      
      {/* Top Frame (4 beams) */}
      <group position={[0, 8, 0]}>
        <mesh position={[0, 0, -2.5]} castShadow><boxGeometry args={[5.2, 0.4, 0.2]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[0, 0, 2.5]} castShadow><boxGeometry args={[5.2, 0.4, 0.2]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[-2.5, 0, 0]} castShadow><boxGeometry args={[0.2, 0.4, 4.8]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[2.5, 0, 0]} castShadow><boxGeometry args={[0.2, 0.4, 4.8]} /><meshStandardMaterial color="#be123c" /></mesh>
      </group>
      
      {/* Bottom Frame (4 beams) */}
      <group position={[0, 2, 0]}>
        <mesh position={[0, 0, -2.5]}><boxGeometry args={[5.2, 0.2, 0.2]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[0, 0, 2.5]}><boxGeometry args={[5.2, 0.2, 0.2]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[-2.5, 0, 0]}><boxGeometry args={[0.2, 0.2, 4.8]} /><meshStandardMaterial color="#be123c" /></mesh>
        <mesh position={[2.5, 0, 0]}><boxGeometry args={[0.2, 0.2, 4.8]} /><meshStandardMaterial color="#be123c" /></mesh>
      </group>

      {/* Cabinet Legs */}
      {[-2.4, 2.4].map(x => [-2.4, 2.4].map(z => (
        <mesh key={`leg-${x}-${z}`} position={[x, 1, z]} castShadow>
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshStandardMaterial color="#be123c" />
        </mesh>
      )))}

      {/* Prize Chute Hole Rim (Black) */}
      <group position={[-1.85, 2.11, 1.85]}>
        <mesh position={[0, 0, -0.7]}><boxGeometry args={[1.5, 0.02, 0.1]} /><meshStandardMaterial color="#000000" /></mesh>
        <mesh position={[0, 0, 0.7]}><boxGeometry args={[1.5, 0.02, 0.1]} /><meshStandardMaterial color="#000000" /></mesh>
        <mesh position={[-0.7, 0, 0]}><boxGeometry args={[0.1, 0.02, 1.3]} /><meshStandardMaterial color="#000000" /></mesh>
        <mesh position={[0.7, 0, 0]}><boxGeometry args={[0.1, 0.02, 1.3]} /><meshStandardMaterial color="#000000" /></mesh>
      </group>

      {/* Prize Chute Internal Box (Visual) */}
      {/* Positioned below the hole */}
      <mesh position={[-1.85, 1, 1.85]}>
        <boxGeometry args={[1.3, 2, 1.3]} />
        <meshStandardMaterial color="#000000" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Light inside the chute to make it not black */}
      <pointLight position={[-1.85, 1.8, 1.85]} intensity={2} color="#44ff44" distance={3} />
      
      {/* Chute Exit (Front) */}
      <mesh position={[-1.85, 0.5, 2.4]} castShadow>
        <boxGeometry args={[1.5, 1, 0.2]} />
        <meshStandardMaterial color="#be123c" />
      </mesh>
    </group>
  );
}
