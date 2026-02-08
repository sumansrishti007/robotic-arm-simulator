import React from 'react';
import { Paper, Typography, Box, Chip, Divider } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import RotateRightIcon from '@mui/icons-material/RotateRight';

function KinematicsDisplay({ jointAngles, endEffectorPos }) {
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Kinematics Data
      </Typography>
      
      <Divider sx={{ my: 2 }} />

      {/* End Effector Position */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PlaceIcon sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            End Effector Position
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`X: ${endEffectorPos[0].toFixed(3)} m`}
            size="small"
            sx={{ bgcolor: '#e74c3c', color: 'white' }}
          />
          <Chip 
            label={`Y: ${endEffectorPos[1].toFixed(3)} m`}
            size="small"
            sx={{ bgcolor: '#2ecc71', color: 'white' }}
          />
          <Chip 
            label={`Z: ${endEffectorPos[2].toFixed(3)} m`}
            size="small"
            sx={{ bgcolor: '#3498db', color: 'white' }}
          />
        </Box>
      </Box>

      {/* Joint Angles Summary */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <RotateRightIcon sx={{ mr: 1, color: '#ff9800' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
            Joint Configuration
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {jointAngles.map((angle, index) => (
            <Chip 
              key={index}
              label={`J${index + 1}: ${angle.toFixed(0)}°`}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      {/* Reach Distance */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Reach Distance: {Math.sqrt(
            endEffectorPos[0]**2 + 
            endEffectorPos[1]**2 + 
            endEffectorPos[2]**2
          ).toFixed(3)} m
        </Typography>
      </Box>
    </Paper>
  );
}

export default KinematicsDisplay;