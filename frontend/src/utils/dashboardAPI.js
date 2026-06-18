import axiosClient from './axiosClient';

export const dashboardAPI = {
  // --- Profile Routes ---
  getProfile: () => axiosClient.get('/profile/view'), // NEW: Fetch existing profile
  updateProfile: (data) => axiosClient.put('/profile/update', data),

  // --- Leader Controls ---
  getOwnedTeams: () => axiosClient.get('/dashboard/manageMyTeams'),
  getNotifications: () => axiosClient.get('/dashboard/manageNotifications'),
  handleJoinRequest: (requestId, action) => 
    axiosClient.put(`/dashboard/manageNotifications/${requestId}`, { action }),

  // --- User Controls ---
  getJoinedTeams: () => axiosClient.get('/dashboard/user-teams/joined-teams'),
  getSentRequests: () => axiosClient.get('/dashboard/user-teams/all-requests'),
  createJoinRequest: (teamId, message) => 
    axiosClient.post('/dashboard/user-teams/create-request', { teamId, message }),
};