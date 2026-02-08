import React from 'react';
import { 
  Paper, 
  Typography, 
  Slider, 
  Box, 
  Button,
  Chip,
  Divider
} from '@mui/material';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const JOINT_LIMITS = [
  [-180, 180],
  [-90, 90],
  [-90, 90],
  [-180, 180],
  [-90, 90],
  [-180, 180]
];

const JOINT_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c'
];

function ControlPanel({ jointAngles, setJointAngles, disabled }) {
  const handleJointChange = (index) => (event, value) => {
    const newAngles = [...jointAngles];
    newAngles[index] = value;
    setJointAngles(newAngles);
  };

  const handleReset = () => {
    setJointAngles([0, 0, 0, 0, 0, 0]);
  };

  const handleRandomize = () => {
    const randomAngles = jointAngles.map((_, index) => {
      const [min, max] = JOINT_LIMITS[index];
      return Math.random() * (max - min) + min;
    });
    setJointAngles(randomAngles);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Joint Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            startIcon={<RotateRightIcon />}
            onClick={handleRandomize}
            disabled={disabled}
            variant="outlined"
          >
            Random
          </Button>
          <Button 
            size="small" 
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            disabled={disabled}
            variant="outlined"
            color="secondary"
          >
            Reset
          </Button>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {jointAngles.map((angle, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              Joint {index + 1}
            </Typography>
            <Chip 
              label={`${angle.toFixed(1)}°`}
              size="small"
              sx={{ 
                bgcolor: JOINT_COLORS[index],
                color: 'white',
                fontWeight: 'bold',
                minWidth: 70
              }}
            />
          </Box>
          
          <Slider
            value={angle}
            onChange={handleJointChange(index)}
            min={JOINT_LIMITS[index][0]}
            max={JOINT_LIMITS[index][1]}
            step={1}
            disabled={disabled}
            sx={{
              color: JOINT_COLORS[index],
              '& .MuiSlider-thumb': {
                width: 20,
                height: 20,
              }
            }}
            marks={[
              { value: JOINT_LIMITS[index][0], label: `${JOINT_LIMITS[index][0]}°` },
              { value: 0, label: '0°' },
              { value: JOINT_LIMITS[index][1], label: `${JOINT_LIMITS[index][1]}°` }
            ]}
          />
        </Box>
      ))}
    </Paper>
  );
}

export default ControlPanel;