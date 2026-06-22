import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { dashboardAPI } from "../../utils/dashboardAPI";
import TeamCard from "../../components/dashboard/TeamCard";
import RequestCard from "../../components/dashboard/RequestCard";
import JoinedTeamDashboard from "../../components/dashboard/JoinedTeamDashboard";
import ExploreTeamCard from "../../components/dashboard/ExploreTeamCard";

const safelyExtractArray = (res) => {
  let rawData = res?.data?.data || res?.data;
  if (rawData && rawData.data) rawData = rawData.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData) return [rawData];
  return [];
};

export default function MyTeams() {
  // const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "joined");

  // Data States
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allTeams, setAllTeams] = useState([]); 
  const [isFetching, setIsFetching] = useState(true);
  
  // Joined Flow States
  const [joinedView, setJoinedView] = useState("list"); 
  const [joinedTeamDetails, setJoinedTeamDetails] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (location.state?.activeTab) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, requestsRes, allTeamsRes] = await Promise.all([
          dashboardAPI.getJoinedTeams(),
          dashboardAPI.getSentRequests(),
          dashboardAPI.getAllTeams() 
        ]);
        
        setJoinedTeams(safelyExtractArray(teamsRes));
        setSentRequests(safelyExtractArray(requestsRes));
        setAllTeams(safelyExtractArray(allTeamsRes));
      } catch (error) {
        console.error("Failed to load user teams data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleViewJoinedTeam = async (teamId) => {
    setJoinedView("dashboard");
    setIsFetchingDetails(true);
    try {
      const res = await dashboardAPI.getTeamDetails(teamId);
      setJoinedTeamDetails(res.data?.data || res.data); 
    } catch (error) {
      console.error("Failed to fetch team details", error);
      setJoinedView("list"); 
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const tabStyle = (tabName) => `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
    activeTab === tabName 
      ? "bg-neutral-800 text-white border border-neutral-700/50 shadow-sm" 
      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
  }`;

  const filteredTeams = allTeams.filter(team => {
    const matchesSearch = (team.name || team.teamName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (team.technologies || []).some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || team.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col md:flex-row h-full gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 flex flex-col space-y-1.5 md:border-r border-neutral-800 md:pr-6 shrink-0">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 px-2">Team Hub</h3>
        <button onClick={() => { setActiveTab("joined"); setJoinedView("list"); setJoinedTeamDetails(null); }} className={tabStyle("joined")}>
          Teams You're In
        </button>
        <button onClick={() => { setActiveTab("requests"); }} className={tabStyle("requests")}>
          Your Applications
        </button>
        
        <div className="pt-4 mt-2 border-t border-neutral-800/80">
          <button onClick={() => setActiveTab("explore")} className={tabStyle("explore")}>
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Explore Teams
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
            {/* JOINED TEAMS TAB */}
            {activeTab === "joined" && (
              <div>
                {joinedView === "list" && (
                  <>
                    <h2 className="text-2xl font-bold text-white mb-6">Active Teams</h2>
                    {joinedTeams.length === 0 ? (
                      <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                        <p className="text-neutral-400">You haven't joined any teams yet.</p>
                        <button onClick={() => setActiveTab("explore")} className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium">Find a team to join →</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {joinedTeams.map(team => (
                          <div key={team._id || team.teamId} onClick={() => handleViewJoinedTeam(team._id || team.teamId)} className="cursor-pointer group relative">
                            <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                            <TeamCard team={team} isLeader={false} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {joinedView === "dashboard" && (
                  <JoinedTeamDashboard teamDetails={joinedTeamDetails} isLoading={isFetchingDetails} onBack={() => { setJoinedView("list"); setJoinedTeamDetails(null); }} />
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

            {/* EXPLORE TEAMS TAB */}
            {activeTab === "explore" && (
              <div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Explore Projects</h2>
                    <p className="text-neutral-400 text-sm">Browse open projects and apply to join forces.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input type="text" placeholder="Search by name or tech..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-neutral-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-colors" />
                    </div>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full sm:w-48 px-4 py-2 bg-[#1a1a1a] border border-neutral-700 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-colors cursor-pointer appearance-none">
                      <option value="All">All Categories</option>
                      <option value="Web Development">Web Dev</option>
                      <option value="AI/ML">AI / ML</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                {allTeams.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No open teams available right now.</p>
                  </div>
                ) : filteredTeams.length === 0 ? (
                  <div className="text-center p-10 border border-dashed border-neutral-800 rounded-2xl">
                    <p className="text-neutral-400">No teams match your search criteria.</p>
                    <button onClick={() => { setSearchQuery(""); setCategoryFilter("All"); }} className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium">Clear Filters</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                    {/* 🚨 MODULAR CARD COMPONENT INSERTED HERE 🚨 */}
                    {filteredTeams.map(team => (
                      <ExploreTeamCard key={team._id || team.id} team={team} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}