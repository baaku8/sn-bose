import { Link } from "react-router-dom";

export default function TeamCard({ team, isLeader }) {
  const isFull = team.currentSize >= team.maxMembers || team.status === "Full";

  return (
    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 transition-all duration-300 flex flex-col group">
      
      {/* Header: Avatar, Name, and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center overflow-hidden">
            {team.avatar && team.avatar !== "default-team.png" ? (
              <img src={team.avatar} alt={team.teamName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-neutral-500 uppercase">{team.teamName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">{team.teamName}</h3>
            <p className="text-xs text-neutral-400 line-clamp-1">{team.tagline || "No tagline provided"}</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
          isFull 
            ? "bg-red-500/10 text-red-400 border-red-500/20" 
            : "bg-green-500/10 text-green-400 border-green-500/20"
        }`}>
          {isFull ? "Full" : "Recruiting"}
        </span>
      </div>

      {/* Team Capacity Progress Bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-neutral-400 font-medium">Team Capacity</span>
          <span className="text-neutral-300 font-bold">{team.currentSize || team.teamSize} / {team.maxMembers}</span>
        </div>
        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500/50' : 'bg-green-500/50'}`} 
            style={{ width: `${((team.currentSize || team.teamSize) / team.maxMembers) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="mt-auto pt-4 border-t border-neutral-800/80">
        <Link 
          to={`/dashboard/${isLeader ? 'manage' : 'team'}/${team.id || team.teamId}`}
          className="w-full block text-center py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-sm font-medium border border-neutral-800 transition-colors"
        >
          {isLeader ? "Manage Team" : "View Team Dashboard"}
        </Link>
      </div>
    </div>
  );
}