export default function JoinedTeamDashboard({ teamDetails, isLoading, onBack }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-green-500 rounded-full"></span>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="text-center p-10 border border-dashed border-red-900/30 bg-red-900/10 rounded-3xl backdrop-blur-md">
        <p className="text-red-400 font-medium">Failed to load team data. Please try again.</p>
        <button onClick={onBack} className="mt-4 text-sm text-neutral-400 hover:text-white transition-colors">
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Modern Back Button */}
      <button 
        onClick={onBack} 
        className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors px-4 py-2 rounded-full bg-neutral-900/50 border border-neutral-800 w-fit"
      >
        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to My Teams
      </button>

      <div className="space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-neutral-800/60 pb-8 mb-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                {teamDetails.name || teamDetails.teamName}
              </h2>
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-950 text-neutral-300 border border-neutral-800 shadow-sm">
                  {teamDetails.category || "General"}
                </span>
                <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800 shadow-sm">
                  {teamDetails.mode || "Online"}
                </span>
                <span className="text-xs font-medium text-blue-400 flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Status: {teamDetails.status || "In Progress"}
                </span>
              </div>
            </div>
            
            {/* External Links */}
            <div className="flex gap-3">
              {teamDetails.githubLink && (
                <a 
                  href={teamDetails.githubLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-neutral-200 text-black text-sm font-bold rounded-full transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Repository
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4">Project Workspace</h3>
            <div className="bg-neutral-950/50 p-6 md:p-8 rounded-2xl border border-neutral-800/60 shadow-inner">
              <p className="text-neutral-300 text-base font-light leading-relaxed whitespace-pre-wrap">
                {teamDetails.description}
              </p>
            </div>
          </div>
        </div>

        {/* --- TEAM ROSTER SECTION --- */}
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              Team Roster 
              <span className="text-sm font-medium bg-neutral-800 text-neutral-400 px-3 py-1 rounded-full border border-neutral-700">
                {teamDetails.members?.length || 0} Members
              </span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {teamDetails.members?.map(member => (
              <div 
                key={member._id} 
                className="flex items-start gap-4 p-5 rounded-2xl border border-neutral-800/60 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center font-bold text-neutral-400 overflow-hidden shrink-0 group-hover:border-green-500/50 transition-colors">
                  {member.profileImage || member.avatar ? (
                    <img src={member.profileImage || member.avatar} alt={member.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">{member.firstName?.charAt(0) || "U"}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-base text-white font-bold truncate group-hover:text-green-400 transition-colors">
                      {member.firstName} {member.lastName}
                    </p>
                    {teamDetails.leader?._id === member._id && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2.5 py-1 rounded-md shrink-0">
                        Leader
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-neutral-500 truncate mb-3">{member.email}</p>
                  
                  {/* Upgraded Skills display to use individual pill tags */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] font-medium bg-neutral-900 text-neutral-300 px-2 py-1 rounded-md border border-neutral-800">
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="text-[10px] font-medium text-neutral-500 px-1 py-1">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
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