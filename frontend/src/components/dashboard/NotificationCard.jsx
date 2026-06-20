import { Link } from "react-router-dom";

export default function NotificationCard({ notification, onResolve, isProcessing }) {
  const { requester, teamName, message, spotsLeft, requestedAt, requestId } = notification;

  return (
    <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 flex flex-col">
      
      {/* Requester Info - CLICKABLE LINK TO PROFILE */}
      <div className="flex items-center gap-4 mb-4 border-b border-neutral-800/80 pb-4">
        <Link to={`/dashboard/user/${requester.id}`} className="flex items-center gap-4 group flex-1">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl font-bold text-neutral-400 group-hover:border-green-500/50 transition-colors overflow-hidden shrink-0">
            {requester.avatar && requester.avatar !== "default-avatar.png" ? (
                <img src={requester.avatar} alt={requester.name} className="w-full h-full object-cover rounded-full" />
            ) : (
                requester.name.charAt(0)
            )}
            </div>
            <div>
            <h4 className="text-white font-bold leading-tight group-hover:text-green-400 transition-colors">{requester.name}</h4>
            <span className="text-xs text-neutral-400">
                Wants to join: <span className="text-neutral-300 font-medium">{teamName}</span>
            </span>
            </div>
        </Link>
      </div>

      {/* Message and Skills */}
      <div className="mb-5 flex-1">
        <p className="text-sm text-neutral-300 italic mb-3 bg-[#121212] p-3 rounded-lg border border-neutral-800/50">
          "{message || "No message provided."}"
        </p>
        
        {requester.skills && requester.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {requester.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                {skill}
              </span>
            ))}
            {requester.skills.length > 3 && (
              <span className="text-[10px] text-neutral-500 px-1 py-0.5">+{requester.skills.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs text-neutral-500 mb-3">
          <span>{new Date(requestedAt).toLocaleDateString()}</span>
          <span className={spotsLeft <= 1 ? "text-red-400" : "text-green-400"}>
            {spotsLeft} spots remaining
          </span>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onResolve(requestId, "reject")}
            disabled={isProcessing}
            className="flex-1 bg-red-500/5 border border-red-900/30 text-red-400 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 hover:border-red-900/50 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <button 
            onClick={() => onResolve(requestId, "accept")}
            disabled={isProcessing}
            className="flex-1 bg-green-500/10 border border-green-900/50 text-green-400 py-2 rounded-lg text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}