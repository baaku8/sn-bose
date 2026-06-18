import { useState, useEffect } from "react";
import { dashboardAPI } from "../../utils/dashboardAPI";
import TeamCard from "../../components/dashboard/TeamCard";
import NotificationCard from "../../components/dashboard/NotificationCard";

export default function Leadership() {
  const [activeTab, setActiveTab] = useState("manage");
  
  // Data States
  const [ownedTeams, setOwnedTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, notifRes] = await Promise.all([
          dashboardAPI.getOwnedTeams(),
          dashboardAPI.getNotifications()
        ]);
        setOwnedTeams(teamsRes.data?.data || []);
        setNotifications(notifRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load leadership data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  // Handle Accepting / Rejecting Requests
  const handleResolveRequest = async (requestId, action) => {
    setProcessingId(requestId);
    try {
      await dashboardAPI.handleJoinRequest(requestId, action);
      
      // Remove the notification from the UI immediately
      setNotifications((prev) => prev.filter(n => n.requestId !== requestId));
      
      // Optionally refresh owned teams if accepted to update member count
      if (action === "accept") {
        const teamsRes = await dashboardAPI.getOwnedTeams();
        setOwnedTeams(teamsRes.data?.data || []);
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      alert(error.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  const tabStyle = (tabName) => `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium flex justify-between items-center ${
    activeTab === tabName 
      ? "bg-neutral-800 text-white border border-neutral-700/50 shadow-sm" 
      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
  }`;

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      
      {/* Sub-Sidebar Navigation */}
      <div className="w-full md:w-56 flex flex-col space-y-1.5 md:border-r border-neutral-800 md:pr-6 shrink-0">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Leadership Hub</h3>
        <button onClick={() => setActiveTab("manage")} className={tabStyle("manage")}>
          Manage Teams
        </button>
        <button onClick={() => setActiveTab("notifications")} className={tabStyle("notifications")}>
          <span>Action Center</span>
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </button>
        
        <div className="pt-4 mt-2 border-t border-neutral-800/80">
          <button onClick={() => setActiveTab("create")} className={tabStyle("create")}>
            <span className="flex items-center gap-2 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Team
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-y-auto pr-2 pb-10">
        {isFetching ? (
          <div className="flex items-center justify-center h-64">
            <span className="animate-spin h-8 w-8 border-4 border-neutral-600 border-t-neutral-300 rounded-full"></span>
          </div>
        ) : (
          <>
            {/* MANAGE TEAMS TAB */}
            {activeTab === "manage" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Teams You Manage</h2>
                {ownedTeams.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">You haven't created any teams yet.</p>
                    <button onClick={() => setActiveTab("create")} className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium">Build your first team →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ownedTeams.map(team => <TeamCard key={team.id} team={team} isLeader={true} />)}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Join Requests</h2>
                {notifications.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No pending join requests right now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {notifications.map(notif => (
                      <NotificationCard 
                        key={notif.requestId} 
                        notification={notif} 
                        onResolve={handleResolveRequest}
                        isProcessing={processingId === notif.requestId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CREATE TEAM TAB (Placeholder for future development) */}
            {activeTab === "create" && (
               <div className="max-w-2xl bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold text-white mb-2">Create a New Team</h2>
                 <p className="text-neutral-400 text-sm mb-8">Launch a new project and start recruiting talented members.</p>
                 
                 <div className="p-6 border border-dashed border-neutral-700 rounded-xl bg-[#1a1a1a] text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neutral-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-neutral-400 font-medium">Team Creation Wizard Coming Soon</p>
                    <p className="text-sm text-neutral-500 mt-1">This module will connect to your /create-team backend endpoint.</p>
                 </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}