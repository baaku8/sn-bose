import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        teamName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        description: {
            type: String,
            maxlength: 2000,
        },
        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        maxMembers: {
            type: Number,
            default: 5,
            min: 2,
        },
        status: {
            type: String,
            enum: ["Recruiting", "Completed", "Cancelled"],
            default: "Recruiting",
        },
        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "Web Development", "Mobile Development", "AI/ML", "Blockchain",
                "Cyber Security", "Open Source", "Research", "Hackathon", "Other",
            ],
            default: "Web Development",
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
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model("Team", teamSchema);
export default Team;