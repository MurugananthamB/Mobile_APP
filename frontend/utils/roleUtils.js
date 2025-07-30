/**
 * Utility functions for role-based access control
 */

/**
 * Check if user has management or staff privileges
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user can perform administrative actions
 */
export const canPerformAdminActions = (userData) => {
  if (!userData || !userData.role) return false;
  const userRole = userData.role.toLowerCase();
  return userRole === 'management' || userRole === 'staff';
};

/**
 * Check if user is a student
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user is a student
 */
export const isStudent = (userData) => {
  if (!userData || !userData.role) return false;
  return userData.role.toLowerCase() === 'student';
};

/**
 * Check if user is management
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user is management
 */
export const isManagement = (userData) => {
  if (!userData || !userData.role) return false;
  return userData.role.toLowerCase() === 'management';
};

/**
 * Check if user is staff
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user is staff
 */
export const isStaff = (userData) => {
  if (!userData || !userData.role) return false;
  return userData.role.toLowerCase() === 'staff';
};

/**
 * Check if user can add homework
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user can add homework
 */
export const canAddHomework = (userData) => {
  if (!userData || !userData.role) return false;
  const userRole = userData.role.toLowerCase();
  return userRole === 'management' || userRole === 'staff';
};

/**
 * Check if user can add notices
 * @param {object} userData - User data object with role property
 * @returns {boolean} - True if user can add notices
 */
export const canAddNotice = (userData) => {
  if (!userData || !userData.role) return false;
  const userRole = userData.role.toLowerCase();
  return userRole === 'management' || userRole === 'staff';
};

/**
 * Get user role display name
 * @param {object} userData - User data object with role property
 * @returns {string} - Formatted role name
 */
export const getUserRoleDisplay = (userData) => {
  if (!userData || !userData.role) return 'Unknown';
  return userData.role.charAt(0).toUpperCase() + userData.role.slice(1).toLowerCase();
}; 