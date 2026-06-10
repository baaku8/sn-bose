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
            maxlength: 1000,
        },

        leader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
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
            enum: [
                "Recruiting",
                "Completed",
                "Cancelled",
            ],
            default: "Recruiting",
        },
        contactEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;