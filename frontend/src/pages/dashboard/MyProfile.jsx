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

  if (isFetching) return <div className="animate-pulse h-full"><div className="h-24 bg-gray-800 rounded mb-8"></div><div className="h-64 bg-gray-800 rounded"></div></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 pr-2">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Change your Avatar display div to this: */}
            <div className="relative w-24 h-24 rounded bg-gray-800 border border-gray-600 flex items-center justify-center text-3xl font-bold text-gray-400 overflow-hidden">
            {avatarPreview || formData.avatar || user?.avatar ? (
                <img 
                // The timestamp '?t=' + Date.now() forces the browser to ignore the cache
                src={`${avatarPreview || formData.avatar || user?.avatar}${!avatarPreview ? '?t=' + new Date().getTime() : ''}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                />
            ) : (
                (formData.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U')
            )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Public Profile</h2>
              <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
              <button onClick={() => fileInputRef.current.click()} className="mt-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 border border-gray-600 rounded transition">Change Avatar</button>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#242424] px-4 py-2 rounded-lg border border-gray-700">
            <span className="text-sm text-gray-300">Available</span>
            <button onClick={toggleAvailability} className={`w-12 h-6 rounded-full flex items-center ${formData.isAvailable ? 'bg-green-600' : 'bg-gray-600'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isAvailable ? 'translate-x-7' : 'translate-x-1'}`}></div>
            </button>
          </div>
        </div>

        {message.text && <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{message.text}</div>}

        <div className="space-y-8 max-w-3xl pb-10">
          {/* Form Fields - Kept condensed for brevity, use previous detailed structure */}
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700/50">
             <div className="grid grid-cols-2 gap-4">
               <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="bg-[#2a2a2a] p-3 rounded-lg text-white" />
               <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="bg-[#2a2a2a] p-3 rounded-lg text-white" />
               <input type="text" name="college" value={formData.college} onChange={handleChange} placeholder="College" className="bg-[#2a2a2a] p-3 rounded-lg text-white" />
             </div>
             <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" className="w-full mt-4 bg-[#2a2a2a] p-3 rounded-lg text-white h-24"></textarea>
          </div>
          
          <div className="bg-[#1e1e1e] p-6 rounded-xl border border-gray-700/50">
             <form onSubmit={(e) => addTag(e, "skills")} className="flex gap-2 mb-3"><input type="text" value={skillInput} onChange={(e)=>setSkillInput(e.target.value)} placeholder="Skills" className="flex-1 bg-[#2a2a2a] p-3 rounded-lg text-white"/><button type="submit" className="bg-gray-700 text-white px-4 rounded-lg">Add</button></form>
             <div className="flex flex-wrap gap-2 mb-6">{formData.skills.map((s, i) => <span key={i} className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">{s} <button onClick={()=>removeTag("skills",i)}>&times;</button></span>)}</div>
             
             <form onSubmit={(e) => addTag(e, "interests")} className="flex gap-2 mb-3"><input type="text" value={interestInput} onChange={(e)=>setInterestInput(e.target.value)} placeholder="Interests" className="flex-1 bg-[#2a2a2a] p-3 rounded-lg text-white"/><button type="submit" className="bg-gray-700 text-white px-4 rounded-lg">Add</button></form>
             <div className="flex flex-wrap gap-2">{formData.interests.map((s, i) => <span key={i} className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-sm">{s} <button onClick={()=>removeTag("interests",i)}>&times;</button></span>)}</div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 mt-2 border-t border-gray-800 bg-[#1a1a1a] sticky bottom-0 z-10 pb-4">
        <button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium disabled:opacity-70">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}