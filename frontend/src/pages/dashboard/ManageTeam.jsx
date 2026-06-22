import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dashboardAPI } from "../../utils/dashboardAPI";

export default function ManageTeam() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("settings"); // "settings" or "members"

  // Edit Form State
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch Team Data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await dashboardAPI.getTeamDetails(id);
        const teamData = res.data?.data || res.data;
        setTeam(teamData);
        setEditForm({
          teamName: teamData.teamName || "",
          description: teamData.description || "",
          category: teamData.category || "Web Development",
          mode: teamData.mode || "Online",
          maxMembers: teamData.maxMembers || 5,
          status: teamData.status || "Recruiting",
        });
      } catch (e) {
        setMessage({ type: "error", text: "Failed to load team details.", error:e});
      } finally {
        setIsFetching(false);
      }
    };
    fetchTeam();
  }, [id]);

  // Handle Settings Update
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await dashboardAPI.updateTeam(id, editForm);
      setMessage({ type: "success", text: "Team updated successfully!" });

      // Update local state to reflect changes
      setTeam({ ...team, ...editForm });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update team.",
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // Handle Member Removal
  const handleRemoveMember = async (memberId, memberName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${memberName} from the team?`,
      )
    )
      return;

    try {
      await dashboardAPI.removeMember(id, memberId);
      // Remove from UI
      setTeam({
        ...team,
        members: team.members.filter((m) => (m._id || m.id) !== memberId),
      });
      setMessage({ type: "success", text: `${memberName} has been removed.` });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to remove member.",
      });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="animate-spin h-8 w-8 border-4 border-neutral-800 border-t-green-500 rounded-full"></span>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center p-10 border border-dashed border-red-900/30 bg-red-900/10 rounded-3xl backdrop-blur-md max-w-4xl mx-auto">
        <p className="text-red-400 font-medium">Team not found or you don't have access.</p>
        <button onClick={() => navigate("/dashboard/leadership")} className="mt-4 text-sm text-neutral-400 hover:text-white transition-colors">
          &larr; Go Back to Leadership
        </button>
      </div>
    );
  }

  const inputStyle = "w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 focus:bg-neutral-900 outline-none transition-all";
  const labelStyle = "block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-6 border-b border-neutral-800/60">
        <button
          onClick={() => navigate("/dashboard/leadership")}
          className="group flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors px-4 py-2 rounded-full bg-neutral-900/50 border border-neutral-800 w-fit shrink-0"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{team.teamName}</h2>
          <p className="text-sm text-neutral-400 mt-1">Manage team settings and roster</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3 animate-fade-in-up ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message.type === "success" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {message.text}
        </div>
      )}

      {/* Internal Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${activeTab === "settings" ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm" : "bg-neutral-900/50 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700"}`}
        >
          Team Settings
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "members" ? "bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm" : "bg-neutral-900/50 text-neutral-400 hover:text-neutral-200 border border-neutral-800 hover:border-neutral-700"}`}
        >
          Members
          <span className={`px-2 py-0.5 rounded-full text-xs border ${activeTab === "members" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-neutral-800 border-neutral-700 text-neutral-400"}`}>
            {team.members?.length || 0}
          </span>
        </button>
      </div>

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 p-8 md:p-10 rounded-3xl shadow-2xl animate-fade-in">
          <form onSubmit={handleUpdateTeam} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelStyle}>Team Name</label>
                <input
                  type="text"
                  required
                  value={editForm.teamName}
                  onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                  className={inputStyle}
                />
              </div>
              <div>
                <label className={labelStyle}>Recruitment Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className={`${inputStyle} cursor-pointer appearance-none`}
                >
                  <option value="Recruiting">Recruiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className={`${inputStyle} cursor-pointer appearance-none`}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Open Source">Open Source</option>
                  <option value="Research">Research</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Work Mode</label>
                <select
                  value={editForm.mode}
                  onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                  className={`${inputStyle} cursor-pointer appearance-none`}
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={labelStyle}>Max Members</label>
                <input
                  type="number"
                  min="2"
                  required
                  value={editForm.maxMembers}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxMembers: e.target.value === "" ? "" : parseInt(e.target.value),
                    })
                  }
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Project Description</label>
              <textarea
                required
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={`${inputStyle} h-32 resize-none`}
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-neutral-800/60">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-full font-bold transition-all disabled:opacity-70 flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800/60 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="p-8 border-b border-neutral-800/60 bg-neutral-950/30">
            <h3 className="text-xl font-bold text-white mb-1">Current Roster</h3>
            <p className="text-sm text-neutral-400">
              Manage the people currently in your team.
            </p>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {team.members?.map((member) => (
              <div
                key={member._id || member.id}
                className="p-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold border-2 border-neutral-700 shrink-0 overflow-hidden">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.firstName?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-neutral-500">{member.email}</p>
                  </div>
                </div>

                {/* Don't allow kicking the leader */}
                <div className="shrink-0">
                  {(team.leader._id || team.leader) === (member._id || member.id) ? (
                    <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-md border border-yellow-500/20 uppercase tracking-wider inline-block">
                      Team Leader
                    </span>
                  ) : (
                    <button
                      onClick={() =>
                        handleRemoveMember(
                          member._id || member.id,
                          member.firstName,
                        )
                      }
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-transparent hover:border-red-500/20 w-full sm:w-auto"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!team.members || team.members.length === 1) && (
              <div className="p-12 text-center text-neutral-500">
                <p>You are the only member in this team right now.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}