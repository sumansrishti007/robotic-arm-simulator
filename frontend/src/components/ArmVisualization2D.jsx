import React, { useEffect, useRef } from 'react';
import { Paper, Typography, Box } from '@mui/material';

function ArmVisualization2D({ jointAngles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Transform to center origin
    ctx.translate(width / 2, height - 50);
    ctx.scale(1, -1); // Flip Y axis

    const scale = 80; // pixels per meter

    // Calculate positions (simplified 2D projection)
    const rad = jointAngles.map(a => a * Math.PI / 180);
    
    const positions = [[0, 0]];
    
    // Link 1
    positions.push([0, 0.4 * scale]);
    
    // Link 2
    const angle1 = rad[1];
    positions.push([
      positions[1][0] + 0.5 * scale * Math.cos(angle1 + Math.PI/2),
      positions[1][1] + 0.5 * scale * Math.sin(angle1 + Math.PI/2)
    ]);
    
    // Link 3
    const angle2 = angle1 + rad[2];
    positions.push([
      positions[2][0] + 0.5 * scale * Math.cos(angle2 + Math.PI/2),
      positions[2][1] + 0.5 * scale * Math.sin(angle2 + Math.PI/2)
    ]);
    
    // Link 4
    positions.push([
      positions[3][0] + 0.2 * scale * Math.cos(angle2 + Math.PI/2),
      positions[3][1] + 0.2 * scale * Math.sin(angle2 + Math.PI/2)
    ]);

    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];

    // Draw links
    positions.slice(0, -1).forEach((pos, i) => {
      const nextPos = positions[i + 1];
      
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pos[0], pos[1]);
      ctx.lineTo(nextPos[0], nextPos[1]);
      ctx.stroke();
    });

    // Draw joints
    positions.forEach((pos, i) => {
      ctx.fillStyle = colors[i] || '#95a5a6';
      ctx.beginPath();
      ctx.arc(pos[0], pos[1], 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw end effector
    const endPos = positions[positions.length - 1];
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(endPos[0], endPos[1], 15, 0, Math.PI * 2);
    ctx.fill();

    // Reset transform for text
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Draw labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('2D Side View', 10, 20);
    ctx.fillText(`Angles: [${jointAngles.map(a => a.toFixed(0)).join(', ')}]`, 10, 40);

  }, [jointAngles]);

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🤖 Robot Arm Visualization (2D)
        </Typography>
      </Box>
      
      <Box sx={{ p: 2, bgcolor: '#0a0e27' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600}
          style={{ 
            width: '100%', 
            height: 'auto',
            border: '2px solid #667eea',
            borderRadius: '8px'
          }}
        />
      </Box>
      
      <Box sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          2D Projection View - Move sliders to see arm motion
        </Typography>
      </Box>
    </Paper>
  );
}

export default ArmVisualization2D;