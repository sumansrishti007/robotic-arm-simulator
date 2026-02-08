import numpy as np
from scipy.optimize import minimize
from kinematics.forward_kinematics import forward_kinematics

def inverse_kinematics(target_position, initial_angles, dh_params, max_iterations=1000):
    """
    Calculate joint angles to reach target position using numerical optimization
    target_position: desired end-effector position [x, y, z]
    initial_angles: starting joint angles
    dh_params: DH parameters matrix
    Returns: joint angles that reach target position
    """
    
    def objective(angles):
        """Objective function: distance from target"""
        current_pos, _ = forward_kinematics(angles, dh_params)
        error = np.linalg.norm(current_pos - target_position)
        return error
    
    # Joint limits
    bounds = [(-np.pi, np.pi) for _ in range(len(initial_angles))]
    
    # Optimize
    result = minimize(
        objective,
        initial_angles,
        method='SLSQP',
        bounds=bounds,
        options={'maxiter': max_iterations}
    )
    
    if result.success or result.fun < 0.01:  # Accept if error < 1cm
        return result.x
    else:
        raise ValueError(f"IK solution not found. Error: {result.fun}")

def analytical_ik_3dof(target_position, link_lengths):
    """
    Analytical inverse kinematics for 3-DOF planar arm
    Faster but limited to specific configurations
    """
    x, y, z = target_position
    l1, l2, l3 = link_lengths[:3]
    
    # Calculate angles
    r = np.sqrt(x**2 + y**2)
    
    # Joint 1 (base rotation)
    theta1 = np.arctan2(y, x)
    
    # Joint 2 and 3 (planar 2-link IK)
    d = np.sqrt(r**2 + z**2)
    
    if d > (l2 + l3):
        raise ValueError("Target position out of reach")
    
    cos_theta3 = (d**2 - l2**2 - l3**2) / (2 * l2 * l3)
    cos_theta3 = np.clip(cos_theta3, -1, 1)
    theta3 = np.arccos(cos_theta3)
    
    alpha = np.arctan2(z, r)
    beta = np.arctan2(l3 * np.sin(theta3), l2 + l3 * np.cos(theta3))
    theta2 = alpha - beta
    
    return np.array([theta1, theta2, theta3, 0, 0, 0])