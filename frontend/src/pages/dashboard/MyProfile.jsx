import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { dashboardAPI } from "../../utils/dashboardAPI";
import { checkAuth } from "../../authSlice";

export default function MyProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", bio: "", college: "",
    skills: [], interests: [],
    socialLinks: { github: "", linkedin: "", leetcode: "" },
    isAvailable: true, avatar: ""
  });
  
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await dashboardAPI.getProfile();
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
            isAvailable: profileData.isAvailable !== undefined ? profileData.isAvailable : true,
            avatar: profileData.avatar || ""
          });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Could not load profile data." });
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleSocialChange = (e) => setFormData({
    ...formData, socialLinks: { ...formData.socialLinks, [e.target.name]: e.target.value }
  });
  
  const toggleAvailability = () => setFormData((prev) => ({ ...prev, isAvailable: !prev.isAvailable }));

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return setMessage({ type: "error", text: "Image must be under 5MB." });
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  const addTag = (e, type) => {
    e.preventDefault();
    if (type === "skills" && skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    } else if (type === "interests" && interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput.trim()] });
      setInterestInput("");
    }
  };

  const removeTag = (type, idx) => setFormData({ ...formData, [type]: formData[type].filter((_, i) => i !== idx) });

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      let finalFormData = { ...formData };

      if (avatarFile) {
        const uploadRes = await dashboardAPI.uploadAvatar(avatarFile);
        const newUrl = uploadRes.data.data.avatarUrl;
        finalFormData.avatar = newUrl;
      }

      const updateRes = await dashboardAPI.updateProfile(finalFormData);
      
      // Extract the perfectly updated user from the database response
      const updatedUserDB = updateRes.data?.data?.user || updateRes.data?.user;

      if (updatedUserDB) {
        setFormData(prev => ({
          ...prev,
          avatar: updatedUserDB.avatar
        }));
      }

      await dispatch(checkAuth()).unwrap(); 

      setAvatarPreview(null);
      setAvatarFile(null); 
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
    } catch (error) {
      console.error("Profile update failed:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  if (isFetching) {
    return (
      <div className="animate-pulse h-full max-w-4xl mx-auto space-y-6">
        <div className="h-32 bg-neutral-900/50 border border-neutral-800/60 rounded-3xl"></div>
        <div className="h-96 bg-neutral-900/50 border border-neutral-800/60 rounded-3xl"></div>
      </div>
    );
  }

  const inputStyle = "w-full bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 focus:bg-neutral-900 outline-none transition-all";
  const sectionStyle = "bg-neutral-900/30 border border-neutral-800/60 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-black/20";
  const labelStyle = "block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2";

  return (
    <div className="h-full flex flex-col relative max-w-4xl mx-auto">
      
      <div className="flex-1 pb-32"> {/* Extra padding for floating bottom bar */}
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl bg-neutral-900 border border-neutral-700/50 flex items-center justify-center text-4xl font-bold text-neutral-600 overflow-hidden shadow-xl">
              {avatarPreview || formData.avatar || user?.avatar ? (
                  <img 
                    src={`${avatarPreview || formData.avatar || user?.avatar}${!avatarPreview ? '?t=' + new Date().getTime() : ''}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
              ) : (
                  (formData.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U')
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Public Profile</h2>
              <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300 rounded-lg transition-colors border border-neutral-700 hover:border-neutral-600 shadow-sm"
              >
                Change Avatar
              </button>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center gap-4 bg-neutral-900/50 border border-neutral-800 px-5 py-3 rounded-2xl backdrop-blur-sm shadow-lg">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-white">Status</span>
              <span className="text-xs text-neutral-500">{formData.isAvailable ? "Actively looking" : "Not looking"}</span>
            </div>
            <button 
              onClick={toggleAvailability} 
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${formData.isAvailable ? 'bg-green-500' : 'bg-neutral-700'}`}
            >
              <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${formData.isAvailable ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
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

        <div className="space-y-8">
          
          {/* --- BASIC INFO SECTION --- */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className={labelStyle}>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="e.g. Jane" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="e.g. Doe" className={inputStyle} />
              </div>
            </div>
            <div className="mb-6">
              <label className={labelStyle}>College / University</label>
              <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="Where did you study?" className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>About Me (Bio)</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Write a short pitch about your background and what you are looking to build..." className={`${inputStyle} h-32 resize-none`}></textarea>
            </div>
          </div>

          {/* --- SKILLS & INTERESTS SECTION --- */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Skills & Interests
            </h3>
            
            <div className="mb-8">
              <label className={labelStyle}>Technical Skills</label>
              <form onSubmit={(e) => addTag(e, "skills")} className="flex gap-3 mb-4">
                <input type="text" value={skillInput} onChange={(e)=>setSkillInput(e.target.value)} placeholder="e.g. React, Node.js, Python" className={inputStyle}/>
                <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 rounded-xl font-medium transition-colors shadow-sm">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((s, i) => (
                  <span key={i} className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {s} 
                    <button type="button" onClick={()=>removeTag("skills",i)} className="text-green-500 hover:text-green-300 focus:outline-none">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className={labelStyle}>Domains / Interests</label>
              <form onSubmit={(e) => addTag(e, "interests")} className="flex gap-3 mb-4">
                <input type="text" value={interestInput} onChange={(e)=>setInterestInput(e.target.value)} placeholder="e.g. FinTech, AI, Open Source" className={inputStyle}/>
                <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 rounded-xl font-medium transition-colors shadow-sm">Add</button>
              </form>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((s, i) => (
                  <span key={i} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {s} 
                    <button type="button" onClick={()=>removeTag("interests",i)} className="text-blue-500 hover:text-blue-300 focus:outline-none">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* --- SOCIAL LINKS SECTION --- */}
          <div className={sectionStyle}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Social & Portfolio Links
            </h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-neutral-400 text-sm w-24 font-medium">GitHub</span>
                <input type="url" name="github" value={formData.socialLinks.github} onChange={handleSocialChange} placeholder="https://github.com/yourusername" className={inputStyle} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-neutral-400 text-sm w-24 font-medium">LinkedIn</span>
                <input type="url" name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/yourusername" className={inputStyle} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="text-neutral-400 text-sm w-24 font-medium">LeetCode</span>
                <input type="url" name="leetcode" value={formData.socialLinks.leetcode} onChange={handleSocialChange} placeholder="https://leetcode.com/yourusername" className={inputStyle} />
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* --- FLOATING SAVE BAR --- */}
      <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-lg bg-[#121212]/90 backdrop-blur-xl border border-neutral-800 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] rounded-full p-2 flex justify-between items-center z-20">
        <span className="text-xs text-neutral-400 pl-4 font-medium">
          {isSaving ? "Syncing to server..." : "Don't forget to save your changes."}
        </span>
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-full font-bold transition-all disabled:opacity-70 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
        >
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

    </div>
  );
}