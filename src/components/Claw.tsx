import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox, useCompoundBody } from '@react-three/cannon';
import * as THREE from 'three';

export function Claw({ position, isDropping, onCatch, onGrab, onRelease, onYChange, onPositionChange, dollPositions }: { 
  position: { x: number, z: number }, 
  isDropping: boolean,
  onCatch: () => void,
  onGrab: (id: number) => void,
  onRelease: () => void,
  onYChange: (y: number) => void,
  onPositionChange: (pos: { x: number, z: number }) => void,
  dollPositions: React.MutableRefObject<Map<number, [number, number, number]>>
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [yPos, setYPos] = useState(7.5);
  const [xPos, setXPos] = useState(position.x);
  const [zPos, setZPos] = useState(position.z);
  const [clawOpen, setClawOpen] = useState(false);
  
  // Animation state
  const animationState = useRef({
    startTime: 0,
    isAnimating: false,
    caughtId: null as number | null,
    startX: 0,
    startZ: 0
  });

  const [, api] = useBox(() => ({
    type: 'Kinematic',
    args: [0.6, 0.4, 0.6],
    position: [xPos, yPos, zPos],
  }));

  // Sync internal state with prop when not dropping
  useEffect(() => {
    if (!isDropping) {
      setXPos(position.x);
      setZPos(position.z);
      animationState.current.isAnimating = false;
    } else if (!animationState.current.isAnimating) {
      animationState.current.isAnimating = true;
      animationState.current.startTime = Date.now();
      animationState.current.caughtId = null;
      animationState.current.startX = position.x;
      animationState.current.startZ = position.z;
    }
  }, [position, isDropping]);

  useFrame(() => {
    if (animationState.current.isAnimating) {
      const elapsed = (Date.now() - animationState.current.startTime) / 1000;
      const { startX, startZ } = animationState.current;
      const chuteX = -1.85;
      const chuteZ = 1.85;

      if (elapsed < 1.5) {
        // 1. Dropping & Opening
        setYPos(7.5 - (elapsed / 1.5) * 5.3);
        setClawOpen(true);
      } else if (elapsed < 2.2) {
        // 2. Closing at bottom
        setYPos(2.2);
        setClawOpen(false);
        // Actual grab detection: check distance to dolls using real-time positions
        if (animationState.current.caughtId === null) {
          let closestId: number | null = null;
          let minDistance = 0.8;

          dollPositions.current.forEach((pos, id) => {
            const dx = pos[0] - xPos;
            const dz = pos[2] - zPos;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < minDistance && pos[1] < 3) { // Only grab dolls near the bottom
              minDistance = dist;
              closestId = id;
            }
          });

          if (closestId !== null) {
            animationState.current.caughtId = closestId;
            onGrab(closestId);
          }
        }
      } else if (elapsed < 3.7) {
        // 3. Lifting
        setYPos(2.2 + ((elapsed - 2.2) / 1.5) * 5.3);
        setClawOpen(false);
      } else if (elapsed < 5.2) {
        // 4. Moving to Chute
        const t = (elapsed - 3.7) / 1.5;
        setXPos(startX + (chuteX - startX) * t);
        setZPos(startZ + (chuteZ - startZ) * t);
        setYPos(7.5);
        setClawOpen(false);
      } else if (elapsed < 6.0) {
        // 5. Opening at Chute
        setXPos(chuteX);
        setZPos(chuteZ);
        setClawOpen(true);
        if (animationState.current.caughtId !== null) {
          onRelease();
          onCatch();
          animationState.current.caughtId = null;
        }
      } else if (elapsed < 7.5) {
        // 6. Returning to original position
        const t = (elapsed - 6.0) / 1.5;
        setXPos(chuteX + (startX - chuteX) * t);
        setZPos(chuteZ + (startZ - chuteZ) * t);
        setClawOpen(false);
      } else {
        setXPos(startX);
        setZPos(startZ);
        setClawOpen(false);
        animationState.current.isAnimating = false;
      }
    }

    api.position.set(xPos, yPos, zPos);
    onYChange(yPos);
    if (isDropping) {
      onPositionChange({ x: xPos, z: zPos });
    }
  });

  return (
    <>
      {/* Gantry System */}
      <group position={[0, 7.8, 0]}>
        {/* Fixed Z-Rails */}
        <mesh position={[-2.3, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[2.3, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Moving X-Rail (Bridge) */}
        <mesh position={[0, 0.2, zPos]} castShadow>
          <boxGeometry args={[4.8, 0.2, 0.2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Moving Trolley */}
        <mesh position={[xPos, 0.35, zPos]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.4]} />
          <meshStandardMaterial color="#ef4444" metalness={0.3} roughness={0.7} />
        </mesh>
      </group>

      <group ref={groupRef} position={[xPos, yPos, zPos]}>
        {/* Cable */}
        <mesh position={[0, (8.15 - yPos) / 2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, Math.max(0.01, 8.15 - yPos)]} />
          <meshStandardMaterial color="#111" />
        </mesh>

      {/* Claw Hub */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.4, 0.4, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Decorative Hub Top */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      {/* Claw Fingers */}
      {[0, 120, 240].map((angle, i) => (
        <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <group 
            position={[0.35, -0.1, 0]} 
            rotation={[0, 0, clawOpen ? -1.2 : 0.1]} // More dramatic open
          >
            {/* Upper Finger - Slightly angled */}
            <mesh castShadow position={[0, -0.3, 0]} rotation={[0, 0, 0.2]}>
              <boxGeometry args={[0.08, 0.6, 0.12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Lower Finger / Tip - Curved Inward */}
            <mesh castShadow position={[0.12, -0.7, 0]} rotation={[0, 0, 1.2]}>
              <boxGeometry args={[0.08, 0.5, 0.12]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      ))}
      </group>
    </>
  );
}

