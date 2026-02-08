import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Paper, Typography, Box } from '@mui/material';
import * as THREE from 'three';

// Simple robot link component
function Link({ start, end, color = "#3498db" }) {
  const ref = useRef();
  
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  
  // Calculate position and rotation
  const position = startVec.clone().add(direction.clone().multiplyScalar(0.5));
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    axis,
    direction.clone().normalize()
  );
  
  return (
    <mesh ref={ref} position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, length, 8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Simple joint component
function Joint({ position, color = "#e74c3c" }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// Main robot arm
function SimpleRobotArm({ jointAngles }) {
  // Convert degrees to radians
  const rad = jointAngles.map(a => a * Math.PI / 180);
  
  // Calculate positions using simple forward kinematics
  const positions = [];
  
  // Base
  positions.push([0, 0, 0]);
  
  // Joint 1 - Base rotation
  positions.push([0, 0.4, 0]);
  
  // Joint 2 - First arm segment
  const angle1 = rad[1];
  positions.push([
    0.5 * Math.sin(rad[0]) * Math.cos(angle1),
    0.4 + 0.5 * Math.sin(angle1),
    0.5 * Math.cos(rad[0]) * Math.cos(angle1)
  ]);
  
  // Joint 3 - Second arm segment
  const angle2 = angle1 + rad[2];
  const prev2 = positions[2];
  positions.push([
    prev2[0] + 0.5 * Math.sin(rad[0]) * Math.cos(angle2),
    prev2[1] + 0.5 * Math.sin(angle2),
    prev2[2] + 0.5 * Math.cos(rad[0]) * Math.cos(angle2)
  ]);
  
  // Joint 4 - Wrist
  const prev3 = positions[3];
  positions.push([
    prev3[0] + 0.2 * Math.sin(rad[0]),
    prev3[1] + 0.2,
    prev3[2] + 0.2 * Math.cos(rad[0])
  ]);
  
  // Joint 5 & 6 - End effector
  const prev4 = positions[4];
  positions.push([
    prev4[0] + 0.15 * Math.sin(rad[0]),
    prev4[1] + 0.1,
    prev4[2] + 0.15 * Math.cos(rad[0])
  ]);
  
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  
  return (
    <group>
      {/* Base Platform */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Joints */}
      {positions.map((pos, i) => (
        <Joint key={`joint-${i}`} position={pos} color={colors[i] || '#95a5a6'} />
      ))}
      
      {/* Links */}
      {positions.slice(0, -1).map((pos, i) => (
        <Link 
          key={`link-${i}`} 
          start={pos} 
          end={positions[i + 1]} 
          color={colors[i] || '#bdc3c7'}
        />
      ))}
      
      {/* End Effector */}
      <mesh position={positions[positions.length - 1]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#ffd700" emissive="#ff9800" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function ArmVisualization({ jointAngles }) {
  const [angles, setAngles] = useState(jointAngles);
  
  useEffect(() => {
    setAngles(jointAngles);
    console.log('Joint Angles Updated:', jointAngles);
  }, [jointAngles]);

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🤖 3D Robot Arm Visualization
        </Typography>
        <Typography variant="caption">
          Angles: [{angles.map(a => a.toFixed(0)).join(', ')}]
        </Typography>
      </Box>
      
      <Box sx={{ height: 600, background: '#0a0e27' }}>
        <Canvas>
          <PerspectiveCamera makeDefault position={[2.5, 2.5, 2.5]} fov={60} />
          
          {/* Lights */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, 3, -5]} intensity={0.5} color="#4fc3f7" />
          
          {/* Robot */}
          <SimpleRobotArm jointAngles={angles} />
          
          {/* Grid */}
          <gridHelper args={[10, 20, '#444', '#222']} />
          
          {/* Axes */}
          <axesHelper args={[1.5]} />
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.21, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#1a1a2e" opacity={0.8} transparent />
          </mesh>
          
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={6}
          />
        </Canvas>
      </Box>
      
      <Box sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          🖱️ Left-click to rotate | Right-click to pan | Scroll to zoom
        </Typography>
      </Box>
    </Paper>
  );
}

export default ArmVisualization;