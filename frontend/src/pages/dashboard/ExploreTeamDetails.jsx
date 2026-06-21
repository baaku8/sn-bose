import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { dashboardAPI } from "../../utils/dashboardAPI";

export default function ExploreTeamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // If the URL has ?apply=true, instantly open the form
  const [view, setView] = useState(searchParams.get("apply") === "true" ? "apply" : "details");
  
  const [team, setTeam] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [joinMessage, setJoinMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await dashboardAPI.getTeamDetails(id);
        setTeam(res.data?.data || res.data);
      } catch (error) {
        console.error("Failed to fetch team details", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchTeam();
  }, [id]);

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: "", text: "" });

    try {
      await dashboardAPI.createJoinRequest(team._id || team.id, joinMessage);
      setFormMessage({ type: "success", text: "Application sent successfully!" });
      
      // After success, navigate back to MyTeams and open the Requests tab!
      setTimeout(() => {
        navigate("/dashboard/my-teams", { state: { activeTab: "requests" } });
      }, 2000);

    } catch (error) {
      setFormMessage({ type: "error", text: error.response?.data?.message || "Failed to send request." });
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-4 border-neutral-600 border-t-neutral-300 rounded-full"></span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center p-10 text-red-400">
        Team not found. <button onClick={() => navigate(-1)} className="underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 mt-6">
      <button 
        onClick={() => view === "apply" ? setView("details") : navigate("/dashboard/my-teams")}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-8 transition-colors"
      >
        <span>&larr;</span> {view === "apply" ? "Back to Team Details" : "Back to Explore Teams"}
      </button>

      {view === "details" ? (
        <div className="bg-[#0a0a0a] border border-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-neutral-900 pb-8 mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">{team.name || team.teamName}</h2>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                  {team.category || "General"}
                </span>
                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                  {team.mode || "Online"}
                </span>
                <span className="text-xs font-medium text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {team.status || "Recruiting"}
                </span>
              </div>
            </div>
            
            <div className="text-left md:text-right bg-[#121212] px-6 py-4 rounded-2xl border border-neutral-900 min-w-[140px]">
              <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Capacity</p>
              <p className="text-2xl text-white font-bold">
                {team.members?.length || 1} <span className="text-neutral-500 text-lg">/ {team.maxMembers}</span>
              </p>
            </div>
          </div>

          <div className="space-y-10">
            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">About the Project</h3>
              <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap">{team.description}</p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Required Technologies</h3>
              {team.technologies?.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {team.technologies.map((tech, i) => (
                    <span key={i} className="text-sm bg-[#121212] text-neutral-300 px-4 py-2 rounded-xl border border-neutral-800">{tech}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 italic">No specific stack mentioned.</p>
              )}
            </div>

            {/* Leader Info */}
            <div className="pt-6 border-t border-neutral-900">
               <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Project Lead</h3>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-400 overflow-hidden">
                    {team.leader?.profileImage ? (
                      <img src={team.leader.profileImage} alt="Leader" className="w-full h-full object-cover" />
                    ) : (
                      team.leader?.firstName?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{team.leader?.firstName} {team.leader?.lastName}</p>
                    <p className="text-sm text-neutral-500">{team.contactEmail}</p>
                  </div>
               </div>
            </div>

            {/* Call to Action Box */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 text-center mt-12">
              <h3 className="text-xl font-bold text-white mb-2">Think you're a good fit?</h3>
              <p className="text-neutral-400 text-sm mb-6">Join the team to access the private workspace and source code.</p>
              <button 
                onClick={() => setView("apply")}
                className="w-full md:w-auto px-10 py-4 bg-white text-black hover:bg-neutral-200 rounded-full font-bold transition-colors shadow-lg shadow-white/10"
              >
                Request to Join Team
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* APPLY FORM */
        <div className="max-w-2xl bg-[#121212] border border-neutral-800 p-8 rounded-3xl shadow-xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Apply to <span className="text-green-400">{team.name || team.teamName}</span></h2>
          <p className="text-neutral-400 text-sm mb-8">Write a short pitch to the team leader explaining why you'd be a great fit.</p>
          
          {formMessage.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${formMessage.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {formMessage.text}
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Cover Letter / Pitch</label>
              <textarea 
                required
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                className="w-full h-40 bg-[#1a1a1a] border border-neutral-700 p-4 rounded-xl text-white focus:border-green-500 outline-none transition-colors resize-none" 
                placeholder={`Hi, I'm a developer with experience in ${team.technologies?.[0] || 'your tech stack'}, and I'd love to contribute to...`}
              ></textarea>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? "Sending..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}