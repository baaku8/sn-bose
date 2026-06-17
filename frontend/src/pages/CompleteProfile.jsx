import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CompleteProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const { firstName, lastName, email } =
    location.state || {};

  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");

  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [leetcode, setLeetcode] = useState("");

  const [profileImage, setProfileImage] =
    useState("");

  const handleSubmit = async () => {
    const profileData = {
      firstName,
      lastName,
      email,
      dob,
      bio,
      college,
      profileImage,

      skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),

      interests: interests
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean),

      socialLinks: {
        github,
        linkedin,
        leetcode,
      },
    };

    console.log(profileData);

    // Later:
    // await axios.patch("/user/profile", profileData);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#15161c] text-white py-10 px-6">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-2">
          Complete Your Profile
        </h1>

        <p className="text-slate-400 mb-8">
          Help others find you for exciting
          projects and collaborations.
        </p>

        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2">
              First Name
            </label>

            <input
              value={firstName}
              disabled
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 opacity-70"
            />
          </div>

          <div>
            <label className="block mb-2">
              Last Name
            </label>

            <input
              value={lastName}
              disabled
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 opacity-70"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2">
              Email
            </label>

            <input
              value={email}
              disabled
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 opacity-70"
            />
          </div>

        </div>

        {/* DOB */}
        <div className="mt-6">
          <label className="block mb-2">
            Date of Birth
          </label>

          <input
            type="date"
            value={dob}
            onChange={(e) =>
              setDob(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />
        </div>

        {/* College */}
        <div className="mt-6">
          <label className="block mb-2">
            College
          </label>

          <input
            type="text"
            value={college}
            onChange={(e) =>
              setCollege(e.target.value)
            }
            placeholder="Enter your college"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block mb-2">
            Bio
          </label>

          <textarea
            rows="4"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            placeholder="Tell people about yourself..."
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />
        </div>

        {/* Skills */}
        <div className="mt-6">
          <label className="block mb-2">
            Skills
          </label>

          <input
            type="text"
            value={skills}
            onChange={(e) =>
              setSkills(e.target.value)
            }
            placeholder="React, Node.js, MongoDB"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <p className="text-sm text-slate-400 mt-1">
            Separate skills using commas.
          </p>
        </div>

        {/* Interests */}
        <div className="mt-6">
          <label className="block mb-2">
            Interests
          </label>

          <input
            type="text"
            value={interests}
            onChange={(e) =>
              setInterests(e.target.value)
            }
            placeholder="AI, Web Development, Startups"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <p className="text-sm text-slate-400 mt-1">
            Separate interests using commas.
          </p>
        </div>

        {/* Profile Image */}
        <div className="mt-6">
          <label className="block mb-2">
            Profile Image URL
          </label>

          <input
            type="text"
            value={profileImage}
            onChange={(e) =>
              setProfileImage(e.target.value)
            }
            placeholder="https://..."
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />
        </div>

        {/* Social Links */}
        <h2 className="text-2xl font-bold mt-10 mb-4">
          Social Links
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            value={github}
            onChange={(e) =>
              setGithub(e.target.value)
            }
            placeholder="GitHub URL"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <input
            type="text"
            value={linkedin}
            onChange={(e) =>
              setLinkedin(e.target.value)
            }
            placeholder="LinkedIn URL"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

          <input
            type="text"
            value={leetcode}
            onChange={(e) =>
              setLeetcode(e.target.value)
            }
            placeholder="LeetCode URL"
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700"
          />

        </div>

        <button
          onClick={handleSubmit}
          className="w-full mt-10 bg-blue-500 py-4 rounded-xl font-semibold text-lg hover:bg-blue-400 transition"
        >
          Complete Profile
        </button>

      </div>
    </div>
  );
}