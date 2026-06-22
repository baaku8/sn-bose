import { Link } from "react-router-dom";

export default function TeamCard({ team, isLeader }) {
  if (!team) return null;

  const isFull = team.currentSize >= team.maxMembers || team.status === "Full";
  
  // Safe fallbacks in case the backend sends incomplete data
  const safeTeamName = team.teamName || team.name || "Unnamed Team";
  const safeAvatarLetter = safeTeamName.charAt(0).toUpperCase();

  return (
    <div className="bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-sm rounded-2xl p-6 hover:border-neutral-600 hover:-translate-y-1 transition-all duration-300 flex flex-col group shadow-xl shadow-black/50 hover:shadow-green-900/10">
      
      {/* Header: Avatar, Name, and Status */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
            {team.avatar && team.avatar !== "default-team.png" ? (
              <img src={team.avatar} alt={safeTeamName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-neutral-500">{safeAvatarLetter}</span>
            )}
          </div>
          
          <div>

            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors break-words">
              {safeTeamName}
            </h3>
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 block mt-1">
              {team.category === "Web Development" ? "Web" : team.category || "General"}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border shrink-0 mt-1 ${
          isFull 
            ? "bg-red-500/10 text-red-400 border-red-500/20" 
            : "bg-green-500/10 text-green-400 border-green-500/20"
        }`}>
          {isFull ? "Full" : "Recruiting"}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-400 line-clamp-2 mb-5 flex-1 font-light leading-relaxed">
        {team.tagline || team.description || "No description provided."}
      </p>

      {/* Tech Stack Tags */}
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

      {/* Team Capacity Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-neutral-500 font-medium tracking-wide">Team Capacity</span>
          <span className="text-neutral-300 font-bold">
            {team.currentSize || team.teamSize || 1} / {team.maxMembers || 5}
          </span>
        </div>
        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800/50">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500/60' : 'bg-green-500/60'}`} 
            style={{ width: `${Math.min((((team.currentSize || team.teamSize || 1) / (team.maxMembers || 5)) * 100), 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 border-t border-neutral-800/60 shrink-0">
        {isLeader ? (
          <Link 
            to={`/dashboard/manage/${team.id || team.teamId || team._id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-sm font-medium border border-neutral-800 transition-all group-hover:border-neutral-700 shadow-sm"
          >
            Manage Team
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        ) : (
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-sm font-medium border border-neutral-800 transition-all group-hover:border-neutral-700 shadow-sm"
          >
            View Workspace
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        )}
      </div>

    </div>
  );
}