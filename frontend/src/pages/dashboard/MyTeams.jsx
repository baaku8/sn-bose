import { useState, useEffect } from "react";
import { dashboardAPI } from "../../utils/dashboardAPI";
import TeamCard from "../../components/dashboard/TeamCard";
import RequestCard from "../../components/dashboard/RequestCard";

export default function MyTeams() {
  const [activeTab, setActiveTab] = useState("joined");
  
  // Data States
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  
  // Form State
  const [joinForm, setJoinForm] = useState({ teamId: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, requestsRes] = await Promise.all([
          dashboardAPI.getJoinedTeams(),
          dashboardAPI.getSentRequests()
        ]);
        setJoinedTeams(teamsRes.data?.data || []);
        setSentRequests(requestsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load user teams data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
      await dashboardAPI.createJoinRequest(joinForm.teamId, joinForm.message);
      setFormMessage({ type: "success", text: "Request sent successfully!" });
      setJoinForm({ teamId: "", message: "" });
      
      // Refresh requests list
      const requestsRes = await dashboardAPI.getSentRequests();
      setSentRequests(requestsRes.data?.data || []);
    } catch (error) {
      setFormMessage({ type: "error", text: error.response?.data?.message || "Failed to send request." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormMessage({ type: "", text: "" }), 4000);
    }
  };

  const tabStyle = (tabName) => `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
    activeTab === tabName 
      ? "bg-neutral-800 text-white border border-neutral-700/50 shadow-sm" 
      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
  }`;

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      
      {/* Sub-Sidebar Navigation */}
      <div className="w-full md:w-56 flex flex-col space-y-1.5 md:border-r border-neutral-800 md:pr-6 shrink-0">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Team Hub</h3>
        <button onClick={() => setActiveTab("joined")} className={tabStyle("joined")}>Teams You're In</button>
        <button onClick={() => setActiveTab("requests")} className={tabStyle("requests")}>Your Requests</button>
        
        <div className="pt-4 mt-2 border-t border-neutral-800/80">
          <button onClick={() => setActiveTab("create")} className={tabStyle("create")}>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Join New Team
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
            {/* JOINED TEAMS TAB */}
            {activeTab === "joined" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Active Teams</h2>
                {joinedTeams.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">You haven't joined any teams yet.</p>
                    <button onClick={() => setActiveTab("create")} className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium">Find a team to join →</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {joinedTeams.map(team => <TeamCard key={team.teamId} team={team} isLeader={false} />)}
                  </div>
                )}
              </div>
            )}

            {/* SENT REQUESTS TAB */}
            {activeTab === "requests" && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Application Status</h2>
                {sentRequests.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No pending or past requests.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {sentRequests.map(req => <RequestCard key={req.requestId} request={req} />)}
                  </div>
                )}
              </div>
            )}

            {/* CREATE REQUEST TAB */}
            {activeTab === "create" && (
               <div className="max-w-2xl bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold text-white mb-2">Send Join Request</h2>
                 <p className="text-neutral-400 text-sm mb-8">Found a team you like? Drop their ID below and introduce yourself.</p>
                 
                 {formMessage.text && (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${formMessage.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {formMessage.text}
                    </div>
                  )}

                 <form onSubmit={handleJoinSubmit} className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-neutral-400 mb-2">Target Team ID</label>
                     <input 
                       type="text" 
                       required
                       value={joinForm.teamId}
                       onChange={(e) => setJoinForm({...joinForm, teamId: e.target.value})}
                       className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors" 
                       placeholder="e.g. 64f1a2b3c4d5..." 
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-neutral-400 mb-2">Cover Letter / Pitch</label>
                     <textarea 
                       required
                       value={joinForm.message}
                       onChange={(e) => setJoinForm({...joinForm, message: e.target.value})}
                       className="w-full h-32 bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none transition-colors resize-none" 
                       placeholder="Why are you a great fit for this project?"
                     ></textarea>
                   </div>
                   
                   <div className="flex justify-end pt-2">
                     <button 
                       type="submit" 
                       disabled={isSubmitting}
                       className="bg-white hover:bg-neutral-200 text-black px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                     >
                       {isSubmitting ? "Sending..." : "Send Application"}
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