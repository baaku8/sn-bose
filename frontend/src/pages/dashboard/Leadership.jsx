import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { dashboardAPI } from "../../utils/dashboardAPI";
import TeamCard from "../../components/dashboard/TeamCard";
import NotificationCard from "../../components/dashboard/NotificationCard";

export default function Leadership() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("manage");

  const [ownedTeams, setOwnedTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Updated Form States with Category and Mode
  const [createForm, setCreateForm] = useState({
    teamName: "",
    description: "",
    maxMembers: 5,
    contactEmail: user?.email || "",
    technologies: [],
    category: "Web Development", // Default value matching backend
    mode: "Online"               // Default value matching backend
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

        // 1. Safely extract the raw data, handling the double-nested { data: { data: [...] } }
        let rawTeams = teamsRes.data?.data;
        if (rawTeams && rawTeams.data) {
          rawTeams = rawTeams.data; // Dig one level deeper if needed
        }

        let rawNotifs = notifRes.data?.data;
        if (rawNotifs && rawNotifs.data) {
          rawNotifs = rawNotifs.data;
        }

        // 2. SAFETY CHECK: Force the data to be an array
        if (rawTeams && !Array.isArray(rawTeams)) {
          rawTeams = [rawTeams];
        } else if (!rawTeams) {
          rawTeams = [];
        }

        if (rawNotifs && !Array.isArray(rawNotifs)) {
          rawNotifs = [rawNotifs];
        } else if (!rawNotifs) {
          rawNotifs = [];
        }

        // 3. Set the state
        setOwnedTeams(rawTeams);
        setNotifications(rawNotifs);

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
        setOwnedTeams(teamsRes.data?.data || []);
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
      
      // Reset form including the new fields
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
      setOwnedTeams(teamsRes.data?.data || []);
      
      setTimeout(() => setActiveTab("manage"), 1500);

    } catch (error) {
      setCreateMessage({ type: "error", text: error.response?.data?.message || "Failed to create team." });
    } finally {
      setIsCreating(false);
    }
  };

  const tabStyle = (tabName) => `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium flex justify-between items-center ${
    activeTab === tabName 
      ? "bg-neutral-800 text-white border border-neutral-700/50 shadow-sm" 
      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
  }`;

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      
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

      <div className="flex-1 relative overflow-y-auto pr-2 pb-10">
        {isFetching ? (
          <div className="flex items-center justify-center h-64">
            <span className="animate-spin h-8 w-8 border-4 border-neutral-600 border-t-neutral-300 rounded-full"></span>
          </div>
        ) : (
          <>
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

            {activeTab === "create" && (
               <div className="max-w-2xl bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold text-white mb-2">Create a New Team</h2>
                 <p className="text-neutral-400 text-sm mb-8">Launch a new project and start recruiting talented members.</p>
                 
                 {createMessage.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${createMessage.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {createMessage.text}
                    </div>
                  )}

                 <form onSubmit={handleCreateSubmit} className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-neutral-400 mb-2">Team Name</label>
                     <input 
                       type="text" 
                       required
                       value={createForm.teamName}
                       onChange={(e) => setCreateForm({...createForm, teamName: e.target.value})}
                       className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors" 
                       placeholder="e.g. AI Resume Analyzer" 
                     />
                   </div>

                   {/* NEW CATEGORY & MODE INPUTS */}
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-neutral-400 mb-2">Category</label>
                       <select 
                         required
                         value={createForm.category}
                         onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors cursor-pointer" 
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
                       <label className="block text-sm font-medium text-neutral-400 mb-2">Work Mode</label>
                       <select 
                         required
                         value={createForm.mode}
                         onChange={(e) => setCreateForm({...createForm, mode: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors cursor-pointer" 
                       >
                         <option value="Online">Online</option>
                         <option value="Offline">Offline</option>
                         <option value="Hybrid">Hybrid</option>
                       </select>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-neutral-400 mb-2">Max Members</label>
                       <input 
                         type="number" 
                         min="2"
                         required
                         value={createForm.maxMembers}
                         onChange={(e) => setCreateForm({...createForm, maxMembers: parseInt(e.target.value)})}
                         className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors" 
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-neutral-400 mb-2">Contact Email</label>
                       <input 
                         type="email" 
                         required
                         value={createForm.contactEmail}
                         onChange={(e) => setCreateForm({...createForm, contactEmail: e.target.value})}
                         className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors" 
                         placeholder="team@example.com" 
                       />
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-neutral-400 mb-2">Tech Stack</label>
                     <div className="flex gap-2 mb-3">
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
                         className="flex-1 bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors" 
                         placeholder="e.g. React, Node.js (Press Enter to add)" 
                       />
                       <button 
                         type="button" 
                         onClick={handleAddTech}
                         className="bg-neutral-800 text-white px-6 rounded-xl hover:bg-neutral-700 transition-colors border border-neutral-700"
                       >
                         Add
                       </button>
                     </div>
                     
                     {createForm.technologies.length > 0 && (
                       <div className="flex flex-wrap gap-2">
                         {createForm.technologies.map((tech, idx) => (
                           <span key={idx} className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                             {tech}
                             <button 
                               type="button" 
                               onClick={() => handleRemoveTech(idx)} 
                               className="hover:text-red-400 transition-colors"
                             >
                               &times;
                             </button>
                           </span>
                         ))}
                       </div>
                     )}
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-neutral-400 mb-2">Project Description</label>
                     <textarea 
                       required
                       value={createForm.description}
                       onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                       className="w-full h-32 bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors resize-none" 
                       placeholder="Describe your project, tech stack, and what kind of roles you are recruiting for..."
                     ></textarea>
                   </div>
                   
                   <div className="flex justify-end pt-2">
                     <button 
                       type="submit" 
                       disabled={isCreating}
                       className="bg-white hover:bg-neutral-200 text-black px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
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