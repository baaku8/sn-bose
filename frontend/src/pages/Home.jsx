import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../authSlice"; 
import { dashboardAPI } from "../utils/dashboardAPI";

const safelyExtractArray = (res) => {
  let rawData = res?.data?.data || res?.data;
  if (rawData && rawData.data) rawData = rawData.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData) return [rawData];
  return [];
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // --- Public Feed States ---
  const [allTeams, setAllTeams] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // --- View & Details States ---
  const [view, setView] = useState("feed"); // "feed" | "details"
  const [selectedTeamDetails, setSelectedTeamDetails] = useState(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Fetch all open teams on mount
  useEffect(() => {
    const fetchPublicTeams = async () => {
      try {
        const res = await dashboardAPI.getAllTeams();
        setAllTeams(safelyExtractArray(res));
      } catch (error) {
        console.error("Failed to load public teams data:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPublicTeams();
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Fetch Single Team Details
  const handleViewTeamDetails = async (teamId) => {
    setView("details");
    setIsFetchingDetails(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    
    try {
      const res = await dashboardAPI.getTeamDetails(teamId);
      setSelectedTeamDetails(res.data?.data || res.data);
    } catch (error) {
      console.error("Failed to fetch team details", error);
      setView("feed"); 
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Handle Apply Routing
  const handleRequestToJoin = () => {
    if (isAuthenticated && selectedTeamDetails) {
      const teamId = selectedTeamDetails._id || selectedTeamDetails.id;
      navigate(`/dashboard/explore/${teamId}?apply=true`); 
    } else {
      navigate("/login");
    }
  };

  const filteredTeams = allTeams.filter(team => {
    const matchesSearch = 
      (team.name || team.teamName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.technologies || []).some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = categoryFilter === "All" || team.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-50 selection:bg-green-500/30 selection:text-green-200 pb-20 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/40 via-transparent to-transparent blur-3xl"></div>

      {/* --- MODERN NAVBAR --- */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
          <div 
            onClick={() => { setView("feed"); setSelectedTeamDetails(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:shadow-green-500/40 transition-shadow">
              <span className="text-black font-bold text-lg leading-none">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SyncUP<span className="text-green-500">.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-5">
                <button 
                  onClick={handleLogout} 
                  className="text-sm font-medium text-neutral-400 hover:text-red-400 transition-colors"
                >
                  Log out
                </button>
                <button 
                  onClick={() => navigate("/dashboard")} 
                  className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 hover:scale-105 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigate("/login")} 
                  className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => navigate("/signup")} 
                  className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-neutral-200 hover:scale-105 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* --- CONDITIONAL RENDERING BASED ON VIEW STATE --- */}
      {view === "feed" ? (
        <>
          {/* --- MODERN HERO SECTION --- */}
          <main className="relative flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 max-w-5xl mx-auto">
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-neutral-300 tracking-wide uppercase">Live Projects Available</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
              Finding teams <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 drop-shadow-sm">
                is easy now.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl font-light mb-10">
              Connect with developers, designers, AI enthusiasts, and builders for your next project. Stop searching and start shipping.
            </p>

            <button
              onClick={() => {
                document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 bg-neutral-900 border border-neutral-700 rounded-full hover:bg-neutral-800 hover:border-neutral-600 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] hover:-translate-y-1"
            >
              Explore Live Projects
              <svg 
                className="w-4 h-4 text-green-400 transition-transform duration-300 group-hover:translate-y-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </main>

          {/* Live Projects Feed */}
          <section id="explore-section" className="max-w-7xl mx-auto px-6 md:px-12 pt-10">
            
            {/* Feed Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-neutral-900">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Project Directory</h2>
                <p className="text-neutral-500 text-sm">Browse actively recruiting teams and jump right in.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or tech..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white text-sm focus:border-green-500/50 focus:bg-neutral-900 outline-none transition-all"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl text-white text-sm focus:border-green-500/50 focus:bg-neutral-900 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Web Development">Web Dev</option>
                  <option value="Mobile Development">Mobile Dev</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Feed Grid */}
            {isFetching ? (
              <div className="flex items-center justify-center h-64">
                <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-green-500 rounded-full"></span>
              </div>
            ) : allTeams.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/50">
                <p className="text-neutral-500">No open teams available right now.</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-neutral-900 rounded-3xl bg-neutral-950/50">
                <p className="text-neutral-500 mb-4">No teams match your search criteria.</p>
                <button onClick={() => { setSearchQuery(""); setCategoryFilter("All"); }} className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 text-sm font-medium transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map(team => (
                  <div 
                    key={team._id} 
                    onClick={() => handleViewTeamDetails(team._id || team.id)} 
                    className="bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 hover:border-neutral-600 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group shadow-xl shadow-black/50 hover:shadow-green-900/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-green-400 transition-colors">
                        {team.name || team.teamName}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-neutral-800/50 text-neutral-400 border border-neutral-700/50 whitespace-nowrap">
                        {team.category === "Web Development" ? "Web" : team.category || "General"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-400 line-clamp-3 mb-6 flex-1 font-light leading-relaxed">
                      {team.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(team.technologies || []).slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[11px] font-medium bg-neutral-950 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-800">
                          {tech}
                        </span>
                      ))}
                      {(team.technologies?.length > 3) && (
                        <span className="text-[11px] font-medium text-neutral-500 px-1 py-1">
                          +{team.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-5 border-t border-neutral-800/50 flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
                        {team.members?.length || 1} / {team.maxMembers} Members
                      </span>
                      <span className="text-sm text-white font-medium group-hover:text-green-400 transition-colors flex items-center gap-1">
                        View Details <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        
        /* --- TEAM DETAILS VIEW --- */
        <section className="max-w-4xl mx-auto px-6 md:px-12 mt-12 pt-8">
          <button 
            onClick={() => { setView("feed"); setSelectedTeamDetails(null); }}
            className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors px-4 py-2 rounded-full bg-neutral-900/50 border border-neutral-800 w-fit"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Directory
          </button>

          {isFetchingDetails ? (
            <div className="flex items-center justify-center h-64">
              <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-green-500 rounded-full"></span>
            </div>
          ) : selectedTeamDetails ? (
            <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-3xl p-8 md:p-12 shadow-2xl">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-neutral-800/60 pb-8 mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    {selectedTeamDetails.name || selectedTeamDetails.teamName}
                  </h2>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-950 text-neutral-300 border border-neutral-800">
                      {selectedTeamDetails.category || "General"}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {selectedTeamDetails.mode || "Online"}
                    </span>
                    <span className="text-xs font-medium text-green-400 flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {selectedTeamDetails.status || "Recruiting"}
                    </span>
                  </div>
                </div>
                
                <div className="text-left md:text-right bg-neutral-950/50 px-6 py-4 rounded-2xl border border-neutral-800 min-w-[140px]">
                  <p className="text-xs text-neutral-500 uppercase font-bold mb-1 tracking-wider">Capacity</p>
                  <p className="text-2xl text-white font-bold">
                    {selectedTeamDetails.members?.length || 1} <span className="text-neutral-600 text-lg">/ {selectedTeamDetails.maxMembers}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">About the Project</h3>
                  <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap font-light">
                    {selectedTeamDetails.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Required Technologies</h3>
                  {selectedTeamDetails.technologies?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedTeamDetails.technologies.map((tech, i) => (
                        <span key={i} className="text-sm font-medium bg-neutral-950 text-neutral-300 px-4 py-2.5 rounded-xl border border-neutral-800 shadow-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 italic">No specific stack mentioned.</p>
                  )}
                </div>

                {/* Call to Action Box */}
                <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-10 text-center mt-12">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-green-500/5 blur-[80px] pointer-events-none"></div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Think you're a good fit?</h3>
                  <p className="text-neutral-400 text-sm mb-8 max-w-md mx-auto relative z-10">Join the team to access the private workspace, connect with the leader, and view the source code.</p>
                  
                  <button 
                    onClick={handleRequestToJoin}
                    className="relative z-10 w-full md:w-auto px-10 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                  >
                    Request to Join Team
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center p-10 text-red-400">Failed to load team details.</div>
          )}
        </section>
      )}

    </div>
  );
}