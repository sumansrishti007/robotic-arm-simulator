import numpy as np

class RobotArm:
    """6-DOF Robot Arm Model"""
    
    def __init__(self, num_joints=6):
        self.num_joints = num_joints
        
        # DH Parameters [theta, d, a, alpha] for each joint
        # Modified for a typical 6-DOF robot arm
        self.dh_params = np.array([
            [0, 0.4, 0, np.pi/2],      # Joint 1
            [0, 0, 0.5, 0],            # Joint 2
            [0, 0, 0.5, 0],            # Joint 3
            [0, 0.3, 0, np.pi/2],      # Joint 4
            [0, 0, 0, -np.pi/2],       # Joint 5
            [0, 0.2, 0, 0]             # Joint 6
        ])
        
        # Joint limits in radians [min, max]
        self.joint_limits = np.array([
            [-np.pi, np.pi],           # Joint 1
            [-np.pi/2, np.pi/2],       # Joint 2
            [-np.pi/2, np.pi/2],       # Joint 3
            [-np.pi, np.pi],           # Joint 4
            [-np.pi/2, np.pi/2],       # Joint 5
            [-np.pi, np.pi]            # Joint 6
        ])
    
    def get_link_length(self, joint_index):
        """Get the length of a specific link"""
        return self.dh_params[joint_index][2]