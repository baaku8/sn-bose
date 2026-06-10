import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },

        category: {
            type: String,
            enum: [
                "Web Development",
                "Mobile Development",
                "AI/ML",
                "Blockchain",
                "Cyber Security",
                "Open Source",
                "Research",
                "Hackathon",
                "Other",
            ],
            default: "Web Development",
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        technologies: [
            {
                type: String,
                trim: true,
            },
        ],

        mode: {
            type: String,
            enum: ["Online", "Offline", "Hybrid"],
            default: "Online",
        },

        githubLink: String,

        demoLink: String,

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
        },
    },
    {
        timestamps: true,
    }
);

const Project=mongoose.model("Project", projectSchema);
export default Project