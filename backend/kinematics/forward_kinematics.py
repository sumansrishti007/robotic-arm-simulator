import numpy as np

def dh_transform(theta, d, a, alpha):
    """
    Compute DH transformation matrix
    theta: joint angle
    d: link offset
    a: link length
    alpha: link twist
    """
    ct = np.cos(theta)
    st = np.sin(theta)
    ca = np.cos(alpha)
    sa = np.sin(alpha)
    
    T = np.array([
        [ct, -st*ca, st*sa, a*ct],
        [st, ct*ca, -ct*sa, a*st],
        [0, sa, ca, d],
        [0, 0, 0, 1]
    ])
    
    return T

def forward_kinematics(joint_angles, dh_params):
    """
    Calculate end-effector position and orientation
    joint_angles: array of joint angles in radians
    dh_params: DH parameters matrix
    Returns: (position, rotation_matrix)
    """
    T = np.eye(4)
    
    for i, (theta_offset, d, a, alpha) in enumerate(dh_params):
        theta = joint_angles[i] + theta_offset
        T = T @ dh_transform(theta, d, a, alpha)
    
    position = T[:3, 3]
    rotation = T[:3, :3]
    
    return position, rotation

def get_all_transforms(joint_angles, dh_params):
    """
    Get transformation matrices for all joints (for visualization)
    Returns: list of transformation matrices
    """
    transforms = [np.eye(4)]
    T = np.eye(4)
    
    for i, (theta_offset, d, a, alpha) in enumerate(dh_params):
        theta = joint_angles[i] + theta_offset
        T = T @ dh_transform(theta, d, a, alpha)
        transforms.append(T.copy())
    
    return transforms