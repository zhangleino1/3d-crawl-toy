/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import confetti from 'canvas-confetti';
import { GameUI } from './components/GameUI';
import { Cabinet } from './components/Cabinet';
import { Dolls } from './components/Dolls';
import { Claw } from './components/Claw';

const DOLL_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a29bfe', '#fab1a0'];

export default function App() {
  const [clawPos, setClawPos] = useState({ x: 0, z: 0 });
  const [isDropping, setIsDropping] = useState(false);
  const [score, setScore] = useState(0);
  const [heldDollId, setHeldDollId] = useState<number | null>(null);
  const [clawY, setClawY] = useState(7.5);
  const dollPositions = React.useRef<Map<number, [number, number, number]>>(new Map());

  const dolls = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 3.5,
        3 + Math.random() * 5,
        (Math.random() - 0.5) * 3.5
      ] as [number, number, number],
      color: DOLL_COLORS[Math.floor(Math.random() * DOLL_COLORS.length)]
    }));
  }, []);

  const handleMove = (dx: number, dz: number) => {
    if (isDropping) return;
    setClawPos(prev => ({
      x: Math.max(-1.5, Math.min(1.5, prev.x + dx)),
      z: Math.max(-1.5, Math.min(1.5, prev.z + dz))
    }));
  };

  const handleDrop = () => {
    if (isDropping) return;
    setIsDropping(true);
    setTimeout(() => {
      setIsDropping(false);
      setHeldDollId(null); // Ensure released
    }, 8000);
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDropping) return;
      
      const step = 0.1;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleMove(0, -step);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleMove(0, step);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMove(-step, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMove(step, 0);
          break;
        case ' ':
        case 'Enter':
          handleDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropping, clawPos]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 6, 10]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          minDistance={6} 
          maxDistance={15} 
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 3, 0]}
        />
        
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Environment preset="city" />
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} castShadow intensity={1} />
          <spotLight 
            position={[0, 12, 0]} 
            angle={0.4} 
            penumbra={1} 
            intensity={3} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />

          <Physics gravity={[0, -9.81, 0]}>
            <Cabinet />
            <Dolls dolls={dolls} heldDollId={heldDollId} clawPos={clawPos} clawY={clawY} dollPositions={dollPositions} />
            <Claw 
              position={clawPos} 
              isDropping={isDropping} 
              onCatch={() => {
                setScore(s => s + 1);
                
                // Fireworks effect
                const duration = 3000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000, colors: DOLL_COLORS };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(function() {
                  const timeLeft = animationEnd - Date.now();

                  if (timeLeft <= 0) {
                    return clearInterval(interval);
                  }

                  const particleCount = 50 * (timeLeft / duration);
                  confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                  });
                  confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                  });
                }, 250);
              }} 
              onGrab={(id) => setHeldDollId(id)}
              onRelease={() => setHeldDollId(null)}
              onYChange={setClawY}
              onPositionChange={setClawPos}
              dollPositions={dollPositions}
            />
          </Physics>
        </Suspense>
      </Canvas>

      <GameUI 
        score={score} 
        onMove={handleMove} 
        onDrop={handleDrop} 
        isDropping={isDropping}
      />
    </div>
  );
}
