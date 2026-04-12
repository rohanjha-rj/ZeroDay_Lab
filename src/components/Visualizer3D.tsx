import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Text, Float, Stars, Line, QuadraticBezierLine } from '@react-three/drei';
import * as THREE from 'three';

interface NodeProps {
  position: [number, number, number];
  color: string;
  label: string;
  icon?: string;
}

const Node = ({ position, color, label }: NodeProps) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh position={position}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          toneMapped={false} 
        />
        <pointLight color={color} intensity={5} distance={5} />
      </mesh>
      <Text
        position={[position[0], position[1] - 0.7, position[2]]}
        fontSize={0.2}
        color="white"
        font="/fonts/JetBrainsMono-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>
    </Float>
  );
};

interface Visualizer3DProps {
  visualization: any;
  isRunning: boolean;
}

export default function Visualizer3D({ visualization, isRunning }: Visualizer3DProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const nodes = useMemo(() => [
    { id: 'attacker', position: [-4, 2, 0] as [number, number, number], color: '#ef4444', label: 'Attacker' },
    { id: 'cloud', position: [0, 2, 0] as [number, number, number], color: '#3b82f6', label: 'Network' },
    { id: 'app', position: [0, -1, 0] as [number, number, number], color: '#10b981', label: 'Target App' },
    { id: 'db', position: [4, -1, 0] as [number, number, number], color: '#f59e0b', label: 'Database' },
    { id: 'victim', position: [4, 2, 0] as [number, number, number], color: '#a855f7', label: 'Victim' },
  ], []);

  if (!mounted) return <div style={{ width: '100%', height: '100%', background: '#020617' }} />;

  return (
    <div style={{ width: '100%', height: '100%', background: '#020617' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <color attach="background" args={['#020617']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Connections */}
        <QuadraticBezierLine 
            start={nodes[0].position} 
            end={nodes[1].position} 
            mid={[ -2, 3, 0 ]} 
            color="#ffffff11" 
            lineWidth={0.5} 
        />
        <QuadraticBezierLine 
            start={nodes[1].position} 
            end={nodes[2].position} 
            mid={[ 0, 0.5, 0 ]} 
            color="#ffffff11" 
            lineWidth={0.5} 
        />
        <QuadraticBezierLine 
            start={nodes[2].position} 
            end={nodes[3].position} 
            mid={[ 2, -1.5, 0 ]} 
            color="#ffffff11" 
            lineWidth={0.5} 
        />

        {nodes.map(node => (
          <Node key={node.id} {...node} />
        ))}

        {isRunning && (
            <MotionPacketGroup count={10} />
        )}
      </Canvas>
    </div>
  );
}

function MotionPacketGroup({ count }: { count: number }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <Packet key={i} delay={i * 0.5} />
            ))}
        </group>
    );
}

function Packet({ delay = 0 }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        const t = (clock.getElapsedTime() * 0.5 + delay) % 1;
        // Simple linear interpolation for now
        const start = new THREE.Vector3(-4, 2, 0);
        const end = new THREE.Vector3(0, 2, 0);
        ref.current.position.lerpVectors(start, end, t);
        ref.current.scale.setScalar(Math.sin(t * Math.PI) * 0.3);
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={5} />
        </mesh>
    );
}
