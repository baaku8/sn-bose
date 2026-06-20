import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dashboardAPI } from "../../utils/dashboardAPI";

export default function ViewProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await dashboardAPI.getPublicProfile(id);
        setProfile(response.data?.data?.user);
      } catch (err) {
        setError("Could not load user profile. They might have deleted their account.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isFetching) return <div className="animate-pulse h-full"><div className="h-24 bg-[#1a1a1a] rounded-xl mb-8"></div><div className="h-64 bg-[#1a1a1a] rounded-xl"></div></div>;
  if (error) return <div className="text-red-400 p-8 text-center bg-[#1a1a1a] rounded-2xl">{error}</div>;
  if (!profile) return <div className="text-neutral-400 p-8 text-center bg-[#1a1a1a] rounded-2xl">Profile not found.</div>;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      
      {/* Back Button & Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-800 pb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex-1 flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Public Profile</h2>
            <div className={`px-3 py-1 text-xs font-bold rounded-full border ${profile.isAvailable ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'}`}>
                {profile.isAvailable ? "Available for Teams" : "Unavailable"}
            </div>
        </div>
      </div>

      {/* User Header Card */}
      <div className="bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl mb-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shrink-0 shadow-lg">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.firstName} className="w-full h-full object-cover"/>
          ) : (
            profile.firstName?.charAt(0) || 'U'
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{profile.firstName} {profile.lastName}</h1>
          <p className="text-neutral-400 font-medium">{profile.college || "No college specified"}</p>
          <div className="flex gap-3 mt-4">
             {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-white transition-colors">GitHub</a>}
             {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#0A66C2] transition-colors">LinkedIn</a>}
             {profile.socialLinks?.leetcode && <a href={profile.socialLinks.leetcode} target="_blank" rel="noreferrer" className="text-neutral-500 hover:text-[#FFA116] transition-colors">LeetCode</a>}
          </div>
        </div>
      </div>

      {/* Bio & Details */}
      <div className="bg-[#121212] border border-neutral-800 p-8 rounded-2xl shadow-xl space-y-8">
        <div>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">About Me</h3>
            <p className="text-neutral-300 leading-relaxed bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800">
                {profile.bio || "This user hasn't written a bio yet."}
            </p>
        </div>

        <div>
             <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Technical Skills</h3>
             {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {profile.skills.map((s, i) => <span key={i} className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>)}
                </div>
             ) : <p className="text-neutral-500 italic">No skills listed.</p>}
        </div>

        <div>
             <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3">Interests</h3>
             {profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {profile.interests.map((s, i) => <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full text-sm font-medium">{s}</span>)}
                </div>
             ) : <p className="text-neutral-500 italic">No interests listed.</p>}
        </div>
      </div>
      
    </div>
  );
}