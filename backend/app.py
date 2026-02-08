from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import os

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("🤖 ROBOTIC ARM SIMULATOR BACKEND")
print("=" * 60)

# Simple robot configuration
ROBOT_CONFIG = {
    'num_joints': 6,
    'dh_params': [
        [0, 0.4, 0, 1.5708],
        [0, 0, 0.5, 0],
        [0, 0, 0.5, 0],
        [0, 0.3, 0, 1.5708],
        [0, 0, 0, -1.5708],
        [0, 0.2, 0, 0]
    ],
    'joint_limits': [
        [-3.14, 3.14],
        [-1.57, 1.57],
        [-1.57, 1.57],
        [-3.14, 3.14],
        [-1.57, 1.57],
        [-3.14, 3.14]
    ]
}

def simple_forward_kinematics(joint_angles):
    """Simple FK calculation"""
    x = 0.5 * np.cos(joint_angles[0]) * np.cos(joint_angles[1])
    y = 0.4 + 0.5 * np.sin(joint_angles[1])
    z = 0.5 * np.sin(joint_angles[0]) * np.cos(joint_angles[1])
    return [x, y, z]

@app.route('/')
def index():
    return jsonify({
        'message': 'Robotic Arm Simulator API',
        'version': '1.0',
        'status': 'online',
        'endpoints': [
            'GET  /',
            'GET  /api/robot-info',
            'POST /api/update-joints',
            'POST /api/forward-kinematics',
            'POST /api/inverse-kinematics',
            'POST /api/plan-trajectory'
        ]
    })

@app.route('/api/robot-info', methods=['GET'])
def get_robot_info():
    """Get robot configuration"""
    print("✓ GET /api/robot-info")
    return jsonify({
        'success': True,
        'numJoints': ROBOT_CONFIG['num_joints'],
        'dhParams': ROBOT_CONFIG['dh_params'],
        'jointLimits': ROBOT_CONFIG['joint_limits'],
        'status': 'connected'
    })

@app.route('/api/update-joints', methods=['POST'])
def update_joints():
    """Update joint positions"""
    try:
        data = request.json
        joint_angles = data.get('jointAngles', [0, 0, 0, 0, 0, 0])
        
        position = simple_forward_kinematics(joint_angles)
        
        return jsonify({
            'success': True,
            'endEffector': {
                'position': position,
                'rotation': [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
            },
            'jointPositions': [
                [0, 0, 0],
                [0, 0.4, 0],
                position
            ]
        })
    except Exception as e:
        print(f"❌ Error in update-joints: {e}")
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/forward-kinematics', methods=['POST'])
def forward_kinematics():
    """Calculate FK"""
    try:
        data = request.json
        joint_angles = data.get('jointAngles', [0, 0, 0, 0, 0, 0])
        position = simple_forward_kinematics(joint_angles)
        
        return jsonify({
            'success': True,
            'position': position,
            'rotation': [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/inverse-kinematics', methods=['POST'])
def inverse_kinematics():
    """Calculate IK (simplified)"""
    try:
        data = request.json
        target = data.get('targetPosition', [0, 0, 0])
        current = data.get('currentAngles', [0, 0, 0, 0, 0, 0])
        
        # Simple IK approximation
        angle1 = np.arctan2(target[2], target[0])
        r = np.sqrt(target[0]**2 + target[2]**2)
        angle2 = np.arctan2(target[1] - 0.4, r)
        
        result = [angle1, angle2, 0, 0, 0, 0]
        
        return jsonify({
            'success': True,
            'jointAngles': result
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/plan-trajectory', methods=['POST'])
def plan_trajectory():
    """Plan trajectory"""
    try:
        data = request.json
        start = np.array(data.get('startAngles', [0, 0, 0, 0, 0, 0]))
        end = np.array(data.get('endAngles', [0, 0, 0, 0, 0, 0]))
        points = data.get('numPoints', 50)
        
        trajectory = []
        for i in range(points):
            t = i / (points - 1)
            s = 3*t**2 - 2*t**3  # Smooth interpolation
            angles = start + s * (end - start)
            trajectory.append(angles.tolist())
        
        return jsonify({
            'success': True,
            'trajectory': trajectory
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print("✓ All routes registered")
    print("✓ CORS enabled")
    print(f"✓ Server starting on http://0.0.0.0:{port}")
    print("=" * 60)
    app.run(debug=False, port=port, host='0.0.0.0')