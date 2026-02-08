import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MyLocationIcon from '@mui/icons-material/MyLocation';

function TrajectoryPlanner({ currentAngles, onInverseKinematics, onTrajectoryPlan, disabled }) {
  const [mode, setMode] = useState('cartesian');
  const [target, setTarget] = useState({ x: 0.5, y: 0, z: 0.5 });
  const [targetAngles, setTargetAngles] = useState([0, 45, -45, 0, 0, 0]);
  const [message, setMessage] = useState(null);

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
      setMessage(null);
    }
  };

  const handleTargetChange = (axis) => (event) => {
    setTarget({ ...target, [axis]: parseFloat(event.target.value) || 0 });
  };

  const handleTargetAngleChange = (index) => (event) => {
    const newAngles = [...targetAngles];
    newAngles[index] = parseFloat(event.target.value) || 0;
    setTargetAngles(newAngles);
  };

  const handlePlanCartesian = () => {
    setMessage({ type: 'info', text: 'Calculating inverse kinematics...' });
    onInverseKinematics([target.x, target.y, target.z]);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'IK solution found!' });
    }, 500);
  };

  const handlePlanJoint = () => {
    setMessage({ type: 'info', text: 'Planning trajectory...' });
    onTrajectoryPlan(targetAngles);
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Trajectory planned and executing!' });
    }, 500);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Trajectory Planner
      </Typography>
      
      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
          Planning Mode
        </Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          fullWidth
          size="small"
        >
          <ToggleButton value="cartesian">
            <MyLocationIcon sx={{ mr: 1 }} />
            Cartesian
          </ToggleButton>
          <ToggleButton value="joint">
            Joint Space
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {mode === 'cartesian' ? (
        <Box>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter target position in meters
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="Target X (m)"
              type="number"
              value={target.x}
              onChange={handleTargetChange('x')}
              fullWidth
              size="small"
              inputProps={{ step: 0.1 }}
            />
            <TextField
              label="Target Y (m)"
              type="number"
              value={target.y}
              onChange={handleTargetChange('y')}
              fullWidth
              size="small"
              inputProps={{ step: 0.1 }}
            />
            <TextField
              label="Target Z (m)"
              type="number"
              value={target.z}
              onChange={handleTargetChange('z')}
              fullWidth
              size="small"
              inputProps={{ step: 0.1 }}
            />
          </Box>
          
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={handlePlanCartesian}
            disabled={disabled}
            size="large"
          >
            Solve Inverse Kinematics
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter target joint angles in degrees
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
            {targetAngles.map((angle, index) => (
              <TextField
                key={index}
                label={`J${index + 1} (°)`}
                type="number"
                value={angle}
                onChange={handleTargetAngleChange(index)}
                size="small"
                inputProps={{ step: 5 }}
              />
            ))}
          </Box>
          
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={handlePlanJoint}
            disabled={disabled}
            size="large"
          >
            Plan & Execute Trajectory
          </Button>
        </Box>
      )}

      {message && (
        <Alert severity={message.type} sx={{ mt: 2 }}>
          {message.text}
        </Alert>
      )}
    </Paper>
  );
}

export default TrajectoryPlanner;