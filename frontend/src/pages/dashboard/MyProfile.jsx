import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { dashboardAPI } from "../../utils/dashboardAPI";
import { checkAuth } from "../../authSlice";

export default function MyProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // 1. UI States
  const [isFetching, setIsFetching] = useState(true); // Tracks initial data load
  const [isSaving, setIsSaving] = useState(false);    // Tracks form submission
  const [message, setMessage] = useState({ type: "", text: "" });

  // 2. Comprehensive Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    college: "",
    skills: [],
    interests: [],
    socialLinks: {
      github: "",
      linkedin: "",
      leetcode: ""
    },
    isAvailable: true
  });
  
  // Temporary states for tag inputs
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  // 3. FETCH PROFILE DATA ON MOUNT (LeetCode Style Pre-fill)
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await dashboardAPI.getProfile();
        // Extract user data from your custom APIResponse format
        const profileData = response.data?.data?.user;

        if (profileData) {
          setFormData({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            bio: profileData.bio || "",
            college: profileData.college || "",
            skills: profileData.skills || [],
            interests: profileData.interests || [],
            socialLinks: {
              github: profileData.socialLinks?.github || "",
              linkedin: profileData.socialLinks?.linkedin || "",
              leetcode: profileData.socialLinks?.leetcode || ""
            },
            isAvailable: profileData.isAvailable !== undefined ? profileData.isAvailable : true
          });
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        setMessage({ type: "error", text: "Could not load profile data." });
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfileData();
  }, []);

  // 4. Form Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e) => {
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value }
    });
  };

  const toggleAvailability = () => {
    setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  // 5. Tag Handlers (Skills & Interests)
  const addTag = (e, type) => {
    e.preventDefault();
    if (type === "skills" && skillInput.trim()) {
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput("");
    } else if (type === "interests" && interestInput.trim()) {
      if (!formData.interests.includes(interestInput.trim())) {
        setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      }
      setInterestInput("");
    }
  };

  const removeTag = (type, indexToRemove) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, index) => index !== indexToRemove)
    });
  };

  // 6. Submit Handler
  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await dashboardAPI.updateProfile(formData);
      // Sync global Redux state so the navbar avatar updates if they changed their name
      await dispatch(checkAuth()).unwrap(); 
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile." 
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  // --- SKELETON LOADER ---
  if (isFetching) {
    return (
      <div className="h-full flex flex-col animate-pulse">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded bg-gray-800"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-800 rounded w-48"></div>
            <div className="h-4 bg-gray-800 rounded w-64"></div>
          </div>
        </div>
        <div className="space-y-6 max-w-3xl">
          <div className="h-40 bg-gray-800/50 rounded-xl"></div>
          <div className="h-40 bg-gray-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pr-2">
        
        {/* Header & Avatar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded bg-gray-800 border border-gray-600 flex items-center justify-center text-3xl font-bold text-gray-400 shadow-inner uppercase">
              {formData.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Public Profile</h2>
              <p className="text-gray-400 text-sm mt-1">This information will be visible to potential teammates.</p>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-[#242424] px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-300">Available for Teams</span>
            <button 
              onClick={toggleAvailability}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${formData.isAvailable ? 'bg-green-600' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform absolute ${formData.isAvailable ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${
            message.type === "success" 
              ? "bg-green-500/10 text-green-400 border border-green-500/20" 
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8 max-w-3xl pb-10">
          
          {/* --- SECTION: Basic Info --- */}
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700/50 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address (Read-Only)</label>
                <input type="email" value={user?.email || ""} readOnly className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 text-gray-500 cursor-not-allowed outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">College / University</label>
                <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="e.g. Stanford University" className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors" />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} maxLength="500" placeholder="Tell your future teammates about yourself..." className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white h-28 focus:border-green-500 outline-none transition-colors resize-none"></textarea>
              <p className="text-xs text-gray-500 mt-1 text-right">{formData.bio.length} / 500 characters</p>
            </div>
          </div>

          {/* --- SECTION: Skills & Interests --- */}
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700/50 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Skills & Interests</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Technical Skills</label>
              <form onSubmit={(e) => addTag(e, "skills")} className="flex gap-2 mb-3">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Type a skill and press Enter" className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
                <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-lg transition-colors">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="bg-green-900/30 text-green-400 border border-green-700/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button onClick={() => removeTag("skills", index)} className="hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Areas of Interest</label>
              <form onSubmit={(e) => addTag(e, "interests")} className="flex gap-2 mb-3">
                <input type="text" value={interestInput} onChange={(e) => setInterestInput(e.target.value)} placeholder="Type an interest and press Enter" className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
                <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-lg transition-colors">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <span key={index} className="bg-blue-900/30 text-blue-400 border border-blue-700/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {interest}
                    <button onClick={() => removeTag("interests", index)} className="hover:text-white">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* --- SECTION: Social Links --- */}
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700/50 shadow-sm">
            <h3 className="text-lg font-semibold text-white mb-4">External Profiles</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-400 font-medium">GitHub</span>
                <input type="url" name="github" value={formData.socialLinks.github} onChange={handleSocialChange} placeholder="https://github.com/username" className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-400 font-medium">LinkedIn</span>
                <input type="url" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/username" className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-400 font-medium">LeetCode</span>
                <input type="url" name="leetcode" value={formData.socialLinks.leetcode} onChange={handleSocialChange} placeholder="https://leetcode.com/username" className="flex-1 bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Save Button */}
      <div className="flex justify-end pt-4 mt-2 border-t border-gray-800 bg-[#1a1a1a] sticky bottom-0 z-10 pb-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center gap-3 shadow-lg shadow-green-900/20"
        >
          {isSaving ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Saving Profile...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}