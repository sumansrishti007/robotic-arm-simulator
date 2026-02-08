import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Alert,
  Chip,
  Button,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArmVisualization2D from './components/ArmVisualization2D';
import ControlPanel from './components/ControlPanel';
import TrajectoryPlanner from './components/TrajectoryPlanner';
import KinematicsDisplay from './components/KinematicsDisplay';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [jointAngles, setJointAngles] = useState([0, 0, 0, 0, 0, 0]);
  const [endEffectorPos, setEndEffectorPos] = useState([0, 0, 0]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    updateForwardKinematics();
  }, [jointAngles]);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/robot-info`);
      setIsConnected(true);
      setError(null);
      console.log('✅ Connected to backend');
    } catch (err) {
      setIsConnected(false);
      setError('Backend not connected. Start: python app.py');
      console.error('❌ Backend connection failed');
    }
  };

  const updateForwardKinematics = async () => {
    if (!isConnected) return;
    
    try {
      const response = await axios.post(`${API_URL}/update-joints`, {
        jointAngles: jointAngles.map(angle => angle * Math.PI / 180)
      });
      
      if (response.data.success) {
        setEndEffectorPos(response.data.endEffector.position);
      }
    } catch (err) {
      console.error('FK error:', err);
    }
  };

  const handleInverseKinematics = async (targetPosition) => {
    if (!isConnected) {
      setError('Backend not connected');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/inverse-kinematics`, {
        targetPosition,
        currentAngles: jointAngles.map(angle => angle * Math.PI / 180)
      });
      
      if (response.data.success) {
        const newAngles = response.data.jointAngles.map(angle => angle * 180 / Math.PI);
        setJointAngles(newAngles);
        setError(null);
        console.log('✅ IK solution found');
      }
    } catch (err) {
      setError('IK solution not found');
      console.error('IK error:', err);
    }
  };

  const handleTrajectoryPlan = async (targetAngles) => {
    if (!isConnected) return;

    try {
      const response = await axios.post(`${API_URL}/plan-trajectory`, {
        startAngles: jointAngles.map(angle => angle * Math.PI / 180),
        endAngles: targetAngles.map(angle => angle * Math.PI / 180),
        numPoints: 50
      });
      
      if (response.data.success) {
        const traj = response.data.trajectory.map(angles => 
          angles.map(angle => angle * 180 / Math.PI)
        );
        animateTrajectory(traj);
      }
    } catch (err) {
      setError('Trajectory planning failed');
    }
  };

  const animateTrajectory = (trajectory) => {
    setIsAnimating(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < trajectory.length) {
        setJointAngles(trajectory[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        console.log('✅ Animation complete');
      }
    }, 50);
  };

  return (
    <div className="App">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                🤖 6-DOF Robotic Arm Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Interactive Forward & Inverse Kinematics with Trajectory Planning
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={isConnected ? "✓ Connected" : "✗ Disconnected"}
                color={isConnected ? "success" : "error"}
                size="small"
              />
              <Chip 
                label={isAnimating ? "▶ Animating" : "⏸ Ready"}
                color={isAnimating ? "warning" : "default"}
                size="small"
              />
              <Button 
                size="small" 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={checkConnection}
              >
                Reconnect
              </Button>
            </Box>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Main Content */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Visualization Section */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <ArmVisualization2D jointAngles={jointAngles} />
            
            <KinematicsDisplay 
              jointAngles={jointAngles}
              endEffectorPos={endEffectorPos}
            />
          </Box>

          {/* Controls Section */}
          <Box sx={{ width: 400 }}>
            <ControlPanel 
              jointAngles={jointAngles} 
              setJointAngles={setJointAngles}
              disabled={isAnimating}
            />
            
            <TrajectoryPlanner 
              currentAngles={jointAngles}
              onInverseKinematics={handleInverseKinematics}
              onTrajectoryPlan={handleTrajectoryPlan}
              disabled={isAnimating || !isConnected}
            />
          </Box>
        </Box>

        {/* Footer */}
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            💡 <strong>Controls:</strong> Use the sliders to move joints | 
            Enter target position for IK | 
            Plan trajectories for smooth motion
            {!isConnected && ' | ⚠️ Start backend: python app.py'}
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}

export default App;