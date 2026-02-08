import numpy as np

def plan_trajectory(start_angles, end_angles, num_points=50):
    """
    Generate smooth trajectory using cubic interpolation
    start_angles: starting joint configuration
    end_angles: target joint configuration
    num_points: number of waypoints
    Returns: trajectory as array of joint angles
    """
    trajectory = []
    
    for i in range(num_points):
        t = i / (num_points - 1)
        # Cubic interpolation for smooth motion
        s = 3*t**2 - 2*t**3
        
        angles = start_angles + s * (end_angles - start_angles)
        trajectory.append(angles)
    
    return np.array(trajectory)

def plan_cartesian_trajectory(start_pos, end_pos, num_points=50):
    """
    Generate linear trajectory in Cartesian space
    start_pos: starting position [x, y, z]
    end_pos: target position [x, y, z]
    num_points: number of waypoints
    Returns: trajectory as array of positions
    """
    trajectory = []
    
    for i in range(num_points):
        t = i / (num_points - 1)
        pos = start_pos + t * (end_pos - start_pos)
        trajectory.append(pos)
    
    return np.array(trajectory)

def quintic_trajectory(start_angles, end_angles, num_points=50):
    """
    Generate trajectory using quintic (5th order) polynomial
    Provides zero velocity and acceleration at endpoints
    """
    trajectory = []
    
    for i in range(num_points):
        t = i / (num_points - 1)
        # Quintic interpolation
        s = 6*t**5 - 15*t**4 + 10*t**3
        
        angles = start_angles + s * (end_angles - start_angles)
        trajectory.append(angles)
    
    return np.array(trajectory)