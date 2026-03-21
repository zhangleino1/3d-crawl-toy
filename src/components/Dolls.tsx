import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Color } from 'three';

const DOLL_COLORS = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a29bfe', '#fab1a0'];

function Doll({ 
  id, 
  position, 
  color, 
  heldDollId, 
  clawPos, 
  clawY,
  dollPositions
}: { 
  id: number, 
  position: [number, number, number], 
  color: string,
  heldDollId: number | null,
  clawPos: { x: number, z: number },
  clawY: number,
  dollPositions: React.MutableRefObject<Map<number, [number, number, number]>>
}) {
  const [ref, api] = useSphere(() => ({
    mass: 0.5,
    position,
    args: [0.4],
    friction: 0.8,
    restitution: 0.2,
    linearDamping: 0.5,
    angularDamping: 0.5,
  }));

  const isHeld = heldDollId === id;

  // Use a ref to store the latest props for useFrame to avoid stale closures
  const propsRef = React.useRef({ clawPos, clawY, isHeld });
  propsRef.current = { clawPos, clawY, isHeld };

  useFrame(() => {
    if (propsRef.current.isHeld) {
      // Offset the doll slightly below the claw hub
      api.position.set(propsRef.current.clawPos.x, propsRef.current.clawY - 0.5, propsRef.current.clawPos.z);
      api.velocity.set(0, 0, 0);
    }
  });

  // Toggle mass to make it kinematic when held
  React.useEffect(() => {
    if (isHeld) {
      api.mass.set(0);
    } else {
      api.mass.set(0.5);
    }
  }, [isHeld, api]);

  // Subscribe to position to report it back for grab detection
  React.useEffect(() => {
    const unsubscribe = api.position.subscribe((p) => {
      dollPositions.current.set(id, p);
    });
    return unsubscribe;
  }, [api, id, dollPositions]);

  return (
    <group ref={ref as any}>
      {/* Body - Slightly squashed for more "doll" look */}
      <mesh castShadow scale={[1, 0.9, 1]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Ears */}
      <mesh position={[0.15, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[-0.15, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.08, 0.35, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.08, 0.35, 0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Blush */}
      <mesh position={[0.15, 0.25, 0.18]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.15, 0.25, 0.18]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export function Dolls({ 
  dolls,
  heldDollId, 
  clawPos, 
  clawY,
  dollPositions
}: { 
  dolls: any[],
  heldDollId: number | null,
  clawPos: { x: number, z: number },
  clawY: number,
  dollPositions: React.MutableRefObject<Map<number, [number, number, number]>>
}) {
  return (
    <group>
      {dolls.map(doll => (
        <Doll 
          key={doll.id} 
          id={doll.id}
          position={doll.position} 
          color={doll.color} 
          heldDollId={heldDollId}
          clawPos={clawPos}
          clawY={clawY}
          dollPositions={dollPositions}
        />
      ))}
    </group>
  );
}
