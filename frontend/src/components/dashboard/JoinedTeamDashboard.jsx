export default function JoinedTeamDashboard({ teamDetails, isLoading, onBack }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-4 border-neutral-600 border-t-neutral-300 rounded-full"></span>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="text-center p-10 border border-dashed border-red-900/30 bg-red-900/10 rounded-2xl">
        <p className="text-red-400">Failed to load team data. Please try again.</p>
        <button onClick={onBack} className="mt-4 text-sm text-neutral-400 hover:text-white">
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <span>&larr;</span> Back to My Teams
      </button>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{teamDetails.name || teamDetails.teamName}</h2>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                  {teamDetails.category || "General"}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {teamDetails.mode || "Online"}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Status: {teamDetails.status || "In Progress"}
                </span>
              </div>
            </div>
            
            {/* External Links */}
            <div className="flex gap-3">
              {teamDetails.githubLink && (
                <a href={teamDetails.githubLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-xl transition-colors">
                  GitHub Repo
                </a>
              )}
            </div>
          </div>
          
          <p className="mt-6 text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800">
            {teamDetails.description}
          </p>
        </div>

        {/* Team Roster / Members Section */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            Team Roster <span className="text-sm font-normal text-neutral-500">({teamDetails.members?.length || 0} Members)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamDetails.members?.map(member => (
              <div key={member._id} className="flex items-center gap-4 p-4 rounded-xl border border-neutral-800 bg-[#1a1a1a]">
                <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-neutral-400 overflow-hidden shrink-0">
                  {member.profileImage || member.avatar ? (
                    <img src={member.profileImage || member.avatar} alt={member.firstName} className="w-full h-full object-cover" />
                  ) : (
                    member.firstName?.charAt(0) || "U"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-bold truncate">
                    {member.firstName} {member.lastName}
                    {teamDetails.leader?._id === member._id && (
                      <span className="ml-2 text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full">Leader</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{member.email}</p>
                  {member.skills && member.skills.length > 0 && (
                    <p className="text-xs text-green-400 mt-1 truncate">
                      {member.skills.slice(0, 3).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}