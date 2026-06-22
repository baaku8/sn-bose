import { useNavigate } from "react-router-dom";

export default function ExploreTeamCard({ team }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/dashboard/explore/${team._id || team.id}`)} 
      className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-green-400 transition-colors">
          {team.name || team.teamName}
        </h3>
        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20 whitespace-nowrap">
          {team.category === "Web Development" ? "Web" : team.category || "General"}
        </span>
      </div>
      <p className="text-xs text-neutral-400 line-clamp-2 mb-4">{team.description}</p>
      
      <div className="flex flex-wrap gap-1.5 mb-5">
        {(team.technologies || []).slice(0, 3).map((tech, i) => (
          <span key={i} className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
            {tech}
          </span>
        ))}
        {/* Optional: Show +X if there are more than 3 tech skills */}
        {(team.technologies?.length > 3) && (
          <span className="text-[10px] text-neutral-500 px-1 py-0.5">
            +{team.technologies.length - 3}
          </span>
        )}
      </div>
      
      <div className="mt-auto pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
        <span>{team.members?.length || 1} / {team.maxMembers} Members</span>
        <span className="text-green-400 font-medium">View Details &rarr;</span>
      </div>
    </div>
  );
}