import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Alert,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import GridOnIcon from '@mui/icons-material/GridOn';
import BugReportIcon from '@mui/icons-material/BugReport';

// Import both visualization components
import ArmVisualization from './components/ArmVisualization';
import ArmVisualization2D from './components/ArmVisualization2D';
import TestCanvas from './components/TestCanvas';
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
  const [visualizationMode, setVisualizationMode] = useState('2d'); // '2d', '3d', or 'test'

  // Check backend connection
  useEffect(() => {
    checkConnection();
  }, []);

  // Update forward kinematics when joints change
  useEffect(() => {
    updateForwardKinematics();
  }, [jointAngles]);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_URL}/robot-info`);
      setIsConnected(true);
      setError(null);
      console.log('✅ Connected to backend:', response.data);
    } catch (err) {
      setIsConnected(false);
      setError('Backend not connected. Start Flask server: python app.py');
      console.error('❌ Backend connection failed:', err);
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
        console.log('📍 End effector:', response.data.endEffector.position);
      }
    } catch (err) {
      console.error('Forward kinematics error:', err);
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
        console.log('✅ IK Solution found:', newAngles);
      }
    } catch (err) {
      setError('Could not solve inverse kinematics for target position');
      console.error('❌ IK error:', err);
    }
  };

  const handleTrajectoryPlan = async (targetAngles) => {
    if (!isConnected) {
      setError('Backend not connected');
      return;
    }

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
      console.error('❌ Trajectory error:', err);
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
        console.log('✅ Trajectory animation complete');
      }
    }, 50);
  };

  const handleVisualizationModeChange = (event, newMode) => {
    if (newMode !== null) {
      setVisualizationMode(newMode);
      console.log('🎨 Visualization mode changed to:', newMode);
    }
  };

  return (
    <div className="App">
      <Container maxWidth="xl" className="app-container">
        {/* Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.95)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                🤖 6-DOF Robotic Arm Simulator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Interactive Forward & Inverse Kinematics with Trajectory Planning
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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

          {/* Visualization Mode Selector */}
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                Visualization Mode:
              </Typography>
              <ToggleButtonGroup
                value={visualizationMode}
                exclusive
                onChange={handleVisualizationModeChange}
                size="small"
                color="primary"
              >
                <ToggleButton value="2d">
                  <GridOnIcon sx={{ mr: 1 }} />
                  2D Canvas
                </ToggleButton>
                <ToggleButton value="3d">
                  <ViewInArIcon sx={{ mr: 1 }} />
                  3D WebGL
                </ToggleButton>
                <ToggleButton value="test">
                  <BugReportIcon sx={{ mr: 1 }} />
                  Test Canvas
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                {visualizationMode === '2d' && '📊 2D side-view projection using HTML5 Canvas'}
                {visualizationMode === '3d' && '🎮 3D interactive view using Three.js & WebGL'}
                {visualizationMode === 'test' && '🧪 WebGL compatibility test (orange cube)'}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box className="main-content">
          {/* Visualization Section */}
          <Box className="visualization-section">
            {/* Conditional Rendering based on mode */}
            {visualizationMode === '2d' && (
              <ArmVisualization2D jointAngles={jointAngles} />
            )}
            
            {visualizationMode === '3d' && (
              <ArmVisualization jointAngles={jointAngles} />
            )}
            
            {visualizationMode === 'test' && (
              <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    🧪 WebGL Test Canvas
                  </Typography>
                  <Typography variant="caption">
                    If you see an orange rotating cube, WebGL is working!
                  </Typography>
                </Box>
                <TestCanvas />
                <Box sx={{ p: 2, bgcolor: '#fff3cd', borderTop: '2px solid #ffc107' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>✓ Cube visible:</strong> WebGL works, 3D mode should work<br/>
                    <strong>✗ Black screen:</strong> WebGL issue, use 2D mode instead
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {/* Kinematics Display */}
            <KinematicsDisplay 
              jointAngles={jointAngles}
              endEffectorPos={endEffectorPos}
            />
          </Box>

          {/* Control Panels */}
          <Box className="controls-section">
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

        {/* Footer Info */}
        <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            💡 <strong>Tip:</strong> Move the joint sliders to control the robot arm. 
            Try different visualization modes to find what works best for your system.
            {!isConnected && ' Remember to start the backend: python app.py'}
          </Typography>
        </Paper>
      </Container>
    </div>
  );
}

export default App;