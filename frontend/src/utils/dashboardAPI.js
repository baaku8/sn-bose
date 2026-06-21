import axiosClient from './axiosClient';

export const dashboardAPI = {
  getProfile: () => axiosClient.get('/profile/view'),
  updateProfile: (data) => axiosClient.put('/profile/update', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axiosClient.post('/profile/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPublicProfile: (userId) => axiosClient.get(`/profile/view/${userId}`),
  getOwnedTeams: () => axiosClient.get('/dashboard/manageMyTeams'),
  getNotifications: () => axiosClient.get('/dashboard/manageNotifications'),
  handleJoinRequest: (requestId, action) => 
    axiosClient.put(`/dashboard/manageNotifications/${requestId}`, { action }),
  getJoinedTeams: () => axiosClient.get('/dashboard/user-teams/joined-teams'),
  getSentRequests: () => axiosClient.get('/dashboard/user-teams/all-requests'),
  createJoinRequest: (teamId, message) => 
    axiosClient.post('/dashboard/user-teams/create-request', { teamId, message }),
  createTeam: (data) => axiosClient.post('/createTeam', data),
  
  // FIXED ENDPOINT FOR UPDATING TEAM:
  getTeamDetails: (teamId) => axiosClient.get(`/team/${teamId}`), // uses team router
  updateTeam: (teamId, data) => axiosClient.put(`/dashboard/manageMyTeams/updateTeam/${teamId}`, data),
  
  // NEW ENDPOINTS FOR REMOVING / LEAVING
  removeMember: (teamId, memberId) => axiosClient.delete(`/dashboard/manageMyTeams/${teamId}/member/${memberId}`),
  leaveTeam: (teamId) => axiosClient.delete(`/dashboard/user-teams/${teamId}/leave`),
  getAllTeams: () => axiosClient.get('/'),
};