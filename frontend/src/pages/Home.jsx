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

  // --- NEW: View & Details States ---
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

  // --- NEW: Fetch Single Team Details ---
  const handleViewTeamDetails = async (teamId) => {
    setView("details");
    setIsFetchingDetails(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when opening details
    
    try {
      const res = await dashboardAPI.getTeamDetails(teamId);
      setSelectedTeamDetails(res.data?.data || res.data);
    } catch (error) {
      console.error("Failed to fetch team details", error);
      setView("feed"); // Go back to feed if it fails
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // --- NEW: Handle Apply Routing ---
  const handleRequestToJoin = () => {
    if (isAuthenticated && selectedTeamDetails) {
      const teamId = selectedTeamDetails._id || selectedTeamDetails.id;
      // 🚨 Redirect directly to the dedicated page, instantly opening the apply form!
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
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-neutral-800 pb-20">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <h1 
          onClick={() => { setView("feed"); setSelectedTeamDetails(null); }}
          className="text-2xl font-bold tracking-tighter cursor-pointer"
        >
          SyncUP<span className="text-neutral-600">.</span>
        </h1>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Go to Dashboard
              </button>
              <button onClick={handleLogout} className="px-5 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium hover:bg-red-500/20 transition-colors">
                Log out
              </button>
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Log in
              </button>
              <button onClick={() => navigate("/signup")} className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors">
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* --- CONDITIONAL RENDERING BASED ON VIEW STATE --- */}
      {view === "feed" ? (
        <>
          {/* Hero Section */}
          <main className="flex flex-col items-center justify-center text-center px-6 mt-24 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white leading-[1.1]">
              Finding teams <br className="hidden md:block" />
              <span className="text-neutral-500">is easy now.</span>
            </h1>

            <p className="mt-6 md:mt-8 text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl font-light">
              Connect with developers, designers, AI enthusiasts, and builders for your next project. Stop searching and start shipping.
            </p>

            <button
              onClick={() => {
                document.getElementById('explore-section').scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-12 px-8 py-3.5 rounded-full border border-neutral-800 bg-neutral-900 text-white text-sm font-medium shadow-sm hover:border-neutral-700 hover:bg-neutral-800 transition-all mb-24"
            >
              Explore Teams &darr;
            </button>
          </main>

          {/* Live Projects Feed */}
          <section id="explore-section" className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Feed Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-neutral-900">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Explore Live Projects</h2>
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-neutral-800 rounded-xl text-white text-sm focus:border-green-500/50 outline-none transition-colors"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 bg-[#121212] border border-neutral-800 rounded-xl text-white text-sm focus:border-green-500/50 outline-none transition-colors cursor-pointer appearance-none"
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
                <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-neutral-400 rounded-full"></span>
              </div>
            ) : allTeams.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-neutral-900 rounded-3xl">
                <p className="text-neutral-500">No open teams available right now.</p>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center p-16 border border-dashed border-neutral-900 rounded-3xl">
                <p className="text-neutral-500">No teams match your search criteria.</p>
                <button onClick={() => { setSearchQuery(""); setCategoryFilter("All"); }} className="mt-4 text-neutral-300 hover:text-white text-sm font-medium">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map(team => (
                  <div 
                    key={team._id} 
                    onClick={() => handleViewTeamDetails(team._id || team.id)} // 🚨 FIX: Now fetches details
                    className="bg-[#0a0a0a] border border-neutral-900 rounded-2xl p-6 hover:border-neutral-700 hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group shadow-xl shadow-black/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-neutral-300 transition-colors">
                        {team.name || team.teamName}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800 whitespace-nowrap">
                        {team.category === "Web Development" ? "Web" : team.category || "General"}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-500 line-clamp-3 mb-6 flex-1">
                      {team.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(team.technologies || []).slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[11px] bg-[#121212] text-neutral-400 px-2.5 py-1 rounded-md border border-neutral-800">
                          {tech}
                        </span>
                      ))}
                      {(team.technologies?.length > 3) && (
                        <span className="text-[11px] text-neutral-600 px-1 py-1">
                          +{team.technologies.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-5 border-t border-neutral-900/50 flex items-center justify-between">
                      <span className="text-xs text-neutral-600 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500/50"></span>
                        {team.members?.length || 1} / {team.maxMembers} Members
                      </span>
                      <span className="text-sm text-white font-medium group-hover:underline decoration-neutral-600 underline-offset-4 transition-all">
                        View Details &rarr;
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
        <section className="max-w-4xl mx-auto px-6 md:px-12 mt-12">
          <button 
            onClick={() => { setView("feed"); setSelectedTeamDetails(null); }}
            className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-8 transition-colors"
          >
            <span>&larr;</span> Back to Projects
          </button>

          {isFetchingDetails ? (
            <div className="flex items-center justify-center h-64">
              <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-neutral-400 rounded-full"></span>
            </div>
          ) : selectedTeamDetails ? (
            <div className="bg-[#0a0a0a] border border-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-neutral-900 pb-8 mb-8">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                    {selectedTeamDetails.name || selectedTeamDetails.teamName}
                  </h2>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {selectedTeamDetails.category || "General"}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {selectedTeamDetails.mode || "Online"}
                    </span>
                    <span className="text-xs font-medium text-green-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {selectedTeamDetails.status || "Recruiting"}
                    </span>
                  </div>
                </div>
                
                <div className="text-left md:text-right bg-[#121212] px-6 py-4 rounded-2xl border border-neutral-900 min-w-[140px]">
                  <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Capacity</p>
                  <p className="text-2xl text-white font-bold">
                    {selectedTeamDetails.members?.length || 1} <span className="text-neutral-500 text-lg">/ {selectedTeamDetails.maxMembers}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">About the Project</h3>
                  <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap">
                    {selectedTeamDetails.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Required Technologies</h3>
                  {selectedTeamDetails.technologies?.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {selectedTeamDetails.technologies.map((tech, i) => (
                        <span key={i} className="text-sm bg-[#121212] text-neutral-300 px-4 py-2 rounded-xl border border-neutral-800">
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-500 italic">No specific stack mentioned.</p>
                  )}
                </div>

                {/* Call to Action Box */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 text-center mt-12">
                  <h3 className="text-xl font-bold text-white mb-2">Think you're a good fit?</h3>
                  <p className="text-neutral-400 text-sm mb-6">Join the team to access the private workspace and source code.</p>
                  <button 
                    onClick={handleRequestToJoin}
                    className="w-full md:w-auto px-10 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-colors shadow-lg shadow-white/10"
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