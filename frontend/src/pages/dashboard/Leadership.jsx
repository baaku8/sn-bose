import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { dashboardAPI } from "../../utils/dashboardAPI";
import TeamCard from "../../components/dashboard/TeamCard";
import NotificationCard from "../../components/dashboard/NotificationCard";

const safelyExtractArray = (res) => {
  let rawData = res?.data?.data || res?.data; 
  if (rawData && rawData.data) {
    rawData = rawData.data;
  }
  if (Array.isArray(rawData)) return rawData;
  if (rawData) return [rawData]; 
  return [];
};

export default function Leadership() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("manage");

  const [ownedTeams, setOwnedTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [createForm, setCreateForm] = useState({
    teamName: "",
    description: "",
    maxMembers: 5,
    contactEmail: user?.email || "",
    technologies: [],
    category: "Web Development",
    mode: "Online"
  });
  const [techInput, setTechInput] = useState(""); 
  
  const [isCreating, setIsCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState({ type: "", text: "" });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, notifRes] = await Promise.all([
          dashboardAPI.getOwnedTeams(),
          dashboardAPI.getNotifications()
        ]);

        setOwnedTeams(safelyExtractArray(teamsRes));
        setNotifications(safelyExtractArray(notifRes));

      } catch (error) {
        console.error("Failed to load leadership data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleResolveRequest = async (requestId, action) => {
    setProcessingId(requestId);
    try {
      await dashboardAPI.handleJoinRequest(requestId, action);
      setNotifications((prev) => prev.filter(n => n.requestId !== requestId));
      
      if (action === "accept") {
        const teamsRes = await dashboardAPI.getOwnedTeams();
        setOwnedTeams(safelyExtractArray(teamsRes));
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
      alert(error.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddTech = (e) => {
    e.preventDefault();
    if (techInput.trim() && !createForm.technologies.includes(techInput.trim())) {
      setCreateForm({ 
        ...createForm, 
        technologies: [...createForm.technologies, techInput.trim()] 
      });
      setTechInput("");
    }
  };

  const handleRemoveTech = (indexToRemove) => {
    setCreateForm({
      ...createForm,
      technologies: createForm.technologies.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateMessage({ type: "", text: "" });

    try {
      const payload = { 
        ...createForm, 
        leader: user?._id || user?.id 
      };
      
      await dashboardAPI.createTeam(payload);
      setCreateMessage({ type: "success", text: "Team created successfully!" });
      
      setCreateForm({
        teamName: "",
        description: "",
        maxMembers: 5,
        contactEmail: user?.email || "",
        technologies: [],
        category: "Web Development",
        mode: "Online"
      });
      setTechInput("");

      const teamsRes = await dashboardAPI.getOwnedTeams();
      setOwnedTeams(safelyExtractArray(teamsRes)); 
      
      setTimeout(() => setActiveTab("manage"), 1500);

    } catch (error) {
      setCreateMessage({ type: "error", text: error.response?.data?.message || "Failed to create team." });
    } finally {
      setIsCreating(false);
    }
  };

  const tabStyle = (tabName) => `w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium flex justify-between items-center ${
    activeTab === tabName 
      ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm" 
      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
  }`;

  const inputStyle = "w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 focus:bg-neutral-900 outline-none transition-all";
  const labelStyle = "block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2";

  return (
    <div className="flex flex-col md:flex-row h-full gap-8 max-w-7xl mx-auto">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 flex flex-col space-y-1.5 md:border-r border-neutral-800/60 md:pr-6 shrink-0">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Leadership Hub</h3>
        
        <button onClick={() => setActiveTab("manage")} className={tabStyle("manage")}>
          Manage Teams
        </button>
        
        <button onClick={() => setActiveTab("notifications")} className={tabStyle("notifications")}>
          <span>Action Center</span>
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm shadow-red-500/20">
              {notifications.length}
            </span>
          )}
        </button>
        
        <div className="pt-4 mt-2 border-t border-neutral-800/60">
          <button onClick={() => setActiveTab("create")} className={tabStyle("create")}>
            <span className="flex items-center gap-2 text-green-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Team
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-y-auto pr-2 pb-10">
        {isFetching ? (
          <div className="flex items-center justify-center h-64">
            <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-green-500 rounded-full"></span>
          </div>
        ) : (
          <>
            {/* MANAGE TEAMS TAB */}
            {activeTab === "manage" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Teams You Manage</h2>
                {ownedTeams.length === 0 ? (
                  <div className="text-center p-12 border border-dashed border-neutral-800/60 bg-neutral-900/20 rounded-3xl">
                    <p className="text-neutral-400 mb-4">You haven't created any teams yet.</p>
                    <button 
                      onClick={() => setActiveTab("create")} 
                      className="px-6 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors border border-neutral-700 hover:border-neutral-600"
                    >
                      Build your first team &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {ownedTeams.map(team => <TeamCard key={team._id || team.id} team={team} isLeader={true} />)}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Join Requests</h2>
                {notifications.length === 0 ? (
                  <div className="text-center p-12 border border-dashed border-neutral-800/60 bg-neutral-900/20 rounded-3xl">
                    <p className="text-neutral-400">No pending join requests right now.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* CREATE TEAM TAB */}
            {activeTab === "create" && (
               <div className="max-w-3xl bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 p-8 md:p-10 rounded-3xl shadow-2xl animate-fade-in">
                 <div className="mb-8">
                   <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create a New Team</h2>
                   <p className="text-neutral-400 text-sm">Launch a new project and start recruiting talented members.</p>
                 </div>
                 
                 {createMessage.text && (
                    <div className={`p-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3 animate-fade-in-up ${createMessage.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {createMessage.type === "success" ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                      {createMessage.text}
                    </div>
                  )}

                 <form onSubmit={handleCreateSubmit} className="space-y-6">
                   <div>
                     <label className={labelStyle}>Team Name</label>
                     <input 
                       type="text" 
                       required
                       value={createForm.teamName}
                       onChange={(e) => setCreateForm({...createForm, teamName: e.target.value})}
                       className={inputStyle} 
                       placeholder="e.g. AI Resume Analyzer" 
                     />
                   </div>

                   {/* CATEGORY & MODE INPUTS */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className={labelStyle}>Category</label>
                       <select 
                         required
                         value={createForm.category}
                         onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                         className={`${inputStyle} cursor-pointer appearance-none`} 
                       >
                         <option value="Web Development">Web Development</option>
                         <option value="Mobile Development">Mobile Development</option>
                         <option value="AI/ML">AI/ML</option>
                         <option value="Blockchain">Blockchain</option>
                         <option value="Cyber Security">Cyber Security</option>
                         <option value="Open Source">Open Source</option>
                         <option value="Research">Research</option>
                         <option value="Hackathon">Hackathon</option>
                         <option value="Other">Other</option>
                       </select>
                     </div>
                     <div>
                       <label className={labelStyle}>Work Mode</label>
                       <select 
                         required
                         value={createForm.mode}
                         onChange={(e) => setCreateForm({...createForm, mode: e.target.value})}
                         className={`${inputStyle} cursor-pointer appearance-none`} 
                       >
                         <option value="Online">Online</option>
                         <option value="Offline">Offline</option>
                         <option value="Hybrid">Hybrid</option>
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className={labelStyle}>Max Members</label>
                       <input 
                         type="number" 
                         min="2"
                         required
                         value={createForm.maxMembers}
                         onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value)})}
                         className={inputStyle} 
                       />
                     </div>
                     <div>
                       <label className={labelStyle}>Contact Email</label>
                       <input 
                         type="email" 
                         required
                         value={createForm.contactEmail}
                         onChange={(e) => setCreateForm({...createForm, contactEmail: e.target.value})}
                         className={inputStyle} 
                         placeholder="team@example.com" 
                       />
                     </div>
                   </div>

                   <div>
                     <label className={labelStyle}>Tech Stack</label>
                     <div className="flex gap-3 mb-4">
                       <input 
                         type="text" 
                         value={techInput}
                         onChange={(e) => setTechInput(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault(); 
                             handleAddTech(e);
                           }
                         }}
                         className={inputStyle} 
                         placeholder="e.g. React, Node.js (Press Enter to add)" 
                       />
                       <button 
                         type="button" 
                         onClick={handleAddTech}
                         className="bg-neutral-800 text-white px-6 rounded-xl hover:bg-neutral-700 transition-colors border border-neutral-700 shadow-sm font-medium"
                       >
                         Add
                       </button>
                     </div>
                     
                     {createForm.technologies.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {createForm.technologies.map((tech, idx) => (
                           <span key={idx} className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                             {tech}
                             <button 
                               type="button" 
                               onClick={() => handleRemoveTech(idx)} 
                               className="text-green-500 hover:text-green-300 focus:outline-none transition-colors"
                             >
                               &times;
                             </button>
                           </span>
                         ))}
                       </div>
                     )}
                   </div>
                   
                   <div>
                     <label className={labelStyle}>Project Description</label>
                     <textarea 
                       required
                       value={createForm.description}
                       onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                       className={`${inputStyle} h-32 resize-none`} 
                       placeholder="Describe your project, tech stack, and what kind of roles you are recruiting for..."
                     ></textarea>
                   </div>
                   
                   <div className="flex justify-end pt-4 mt-2 border-t border-neutral-800/60">
                     <button 
                       type="submit" 
                       disabled={isCreating}
                       className="bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-full font-bold transition-all disabled:opacity-70 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                     >
                       {isCreating ? "Creating..." : "Launch Team"}
                     </button>
                   </div>
                 </form>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}