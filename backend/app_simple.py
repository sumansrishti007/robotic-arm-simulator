from flask import Flask, jsonify, request
import json
import math

app = Flask(__name__)

# Enable CORS manually without flask-cors
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

# Robot configuration
class SimpleRobotArm:
    def __init__(self):
        self.num_joints = 6
        self.joint_angles = [0, 0, 0, 0, 0, 0]
        self.link_lengths = [0.29, 0.27, 0.07, 0.302, 0.1, 0.072]
        
    def forward_kinematics_simple(self, angles):
        """Simple forward kinematics calculation"""
        # Simplified calculation for demonstration
        x = sum(self.link_lengths[i] * math.cos(sum(angles[:i+1])) 
                for i in range(len(angles)))
        y = sum(self.link_lengths[i] * math.sin(sum(angles[:i+1])) 
                for i in range(len(angles)))
        z = sum(self.link_lengths) * 0.5  # Simplified z calculation
        
        return [x, y, z]

# Initialize robot
robot = SimpleRobotArm()

@app.route('/api/robot/config', methods=['GET'])
def get_robot_config():
    """Get robot configuration"""
    return jsonify({
        'num_joints': robot.num_joints,
        'joint_angles': robot.joint_angles,
        'link_lengths': robot.link_lengths
    })

@app.route('/api/forward-kinematics', methods=['POST'])
def calculate_forward_kinematics():
    """Calculate end-effector position from joint angles"""
    data = request.json
    joint_angles = data.get('joint_angles', [0, 0, 0, 0, 0, 0])
    
    # Store angles
    robot.joint_angles = joint_angles
    
    # Calculate position
    position = robot.forward_kinematics_simple(joint_angles)
    
    return jsonify({
        'position': position,
        'joint_angles': joint_angles
    })

@app.route('/api/update-joints', methods=['POST'])
def update_joints():
    """Update joint angles"""
    data = request.json
    robot.joint_angles = data.get('joint_angles', [0, 0, 0, 0, 0, 0])
    
    position = robot.forward_kinematics_simple(robot.joint_angles)
    
    return jsonify({
        'success': True,
        'position': position,
        'joint_angles': robot.joint_angles
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'Server is running'})

if __name__ == '__main__':
    print("Starting Robotic Arm Simulator Backend...")
    print("Server running on http://localhost:5000")
    app.run(debug=True, port=5000)