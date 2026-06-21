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
        <span className="animate-spin h-8 w-8 border-4 border-neutral-600 border-t-neutral-300 rounded-full"></span>
      </div>
    );
  }

  if (!team) {
    return <div className="text-red-400">Team not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-800 pb-6">
        <button
          onClick={() => navigate("/dashboard/leadership")}
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white">{team.teamName}</h2>
          <p className="text-sm text-neutral-400">Manage settings and roster</p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {message.text}
        </div>
      )}

      {/* Internal Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "settings" ? "bg-white text-black" : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"}`}
        >
          Team Settings
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "members" ? "bg-white text-black" : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"}`}
        >
          Members{" "}
          <span className="bg-neutral-800 px-2 py-0.5 rounded text-xs">
            {team.members?.length || 0}
          </span>
        </button>
      </div>

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleUpdateTeam} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={editForm.teamName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, teamName: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Recruitment Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none"
                >
                  <option value="Recruiting">Recruiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Category
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) =>
                    setEditForm({ ...editForm, category: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Work Mode
                </label>
                <select
                  value={editForm.mode}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mode: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  min="2"
                  value={editForm.maxMembers}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      maxMembers:
                        e.target.value === "" ? "" : parseInt(e.target.value),
                    })
                  }
                  className="w-full bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Project Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="w-full h-32 bg-[#1a1a1a] border border-neutral-700 p-3.5 rounded-xl text-white focus:border-green-500 outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MEMBERS TAB */}
      {activeTab === "members" && (
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800 bg-[#1a1a1a]">
            <h3 className="text-lg font-bold text-white">Current Roster</h3>
            <p className="text-sm text-neutral-400">
              Manage the people currently in your team.
            </p>
          </div>

          <div className="divide-y divide-neutral-800">
            {team.members?.map((member) => (
              <div
                key={member._id || member.id}
                className="p-6 flex items-center justify-between hover:bg-[#151515] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold border border-neutral-700">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={member.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      member.firstName?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{member.email}</p>
                  </div>
                </div>

                {/* Don't allow kicking the leader */}
                {(team.leader._id || team.leader) ===
                (member._id || member.id) ? (
                  <span className="text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
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
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-transparent hover:border-red-500/20"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {(!team.members || team.members.length === 1) && (
              <div className="p-10 text-center text-neutral-500">
                You are the only member in this team right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
