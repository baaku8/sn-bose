import Team from "./team.models.js";
import Project from "../project/project.models.js";
import APIResponse from "../../common/utils/api-response.js";
import APIError from "../../common/utils/api-error.js";

export const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find()
            .sort({ createdAt: -1 })
            // Lean payload optimization for card views
            .populate("leader", "firstName lastName profileImage isAvailable") 
            .populate("project", "title category technologies mode")
            .lean(); 

        return APIResponse.ok(res, "Teams fetched successfully", teams);
    } catch (error) {
        next(error); 
    }
};

export const getTeamById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const team = await Team.findById(id)
            .populate("leader", "firstName lastName email profileImage skills college socialLinks")
            .populate("members", "firstName lastName email profileImage skills")
            .populate("project") 
            .lean();

        if (!team) {
            return next(APIError.notFound("Team not found"));
        }

        return APIResponse.ok(res, "Team details fetched successfully", team);
    } catch (error) {
        if (error.name === "CastError") {
            return next(APIError.badRequest("Invalid Team ID format"));
        }
        next(error);
    }
};

export const createTeam = async (req, res, next) => {
    try {
        const {
            teamName,
            description,
            maxMembers,
            contactEmail,
            leader
        } = req.body;

        // Basic structural validation
        if (!teamName || !contactEmail || !leader) {
            return next(
                APIError.badRequest(
                    "Missing mandatory fields. (teamName, contactEmail, and leader are required)"
                )
            );
        }

        // Create default project
        const newProject = await Project.create({
            title: teamName,
            description: description || "No description provided",
            leader: leader,
            technologies: [],
            mode: "Online"
        });

        // Create Team
        const newTeam = await Team.create({
            teamName,
            description,
            project: newProject._id,
            maxMembers,
            contactEmail,
            leader,
            members: [leader]
        });

        // Link team back to project
        newProject.team = newTeam._id;
        await newProject.save();

        return APIResponse.create(
            res,
            "Team created successfully",
            newTeam
        );

    } catch (error) {
        next(error);
    }
};