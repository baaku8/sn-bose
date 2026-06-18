export default function RequestCard({ request }) {
  // Determine badge colors based on status
  const statusStyles = {
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Accepted: "bg-green-500/10 text-green-400 border-green-500/20",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 flex flex-col relative overflow-hidden">
      
      {/* Subtle background glow based on status */}
      <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 ${
        request.requestStatus === "Accepted" ? "bg-green-500" : 
        request.requestStatus === "Rejected" ? "bg-red-500" : "bg-yellow-500"
      }`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">{request.team.name}</h3>
          <p className="text-xs text-neutral-400">Reviewer: {request.leader.name}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusStyles[request.requestStatus]}`}>
          {request.requestStatus}
        </span>
      </div>

      <div className="bg-[#121212] border border-neutral-800/50 rounded-lg p-3 mb-4 flex-1">
        <p className="text-sm text-neutral-400 italic line-clamp-3">
          "{request.messageSent || "No cover letter provided."}"
        </p>
      </div>

      <div className="text-xs text-neutral-500 flex justify-between items-center mt-auto">
        <span>Sent on {new Date(request.requestedAt).toLocaleDateString()}</span>
        {request.requestStatus === "Pending" && (
          <span className="text-yellow-500/70">{request.team.spotsLeft} spots left</span>
        )}
      </div>
    </div>
  );
}