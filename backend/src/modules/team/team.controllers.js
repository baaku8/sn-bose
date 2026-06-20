import Team from "./team.models.js";
import APIResponse from "../../common/utils/api-response.js";
import APIError from "../../common/utils/api-error.js";

export const getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.find()
            .sort({ createdAt: -1 })
            .populate("leader", "firstName lastName profileImage isAvailable")
            // .populate("project") is no longer needed
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
            // .populate("project") is no longer needed
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
        // Extract all fields, including the new merged fields
        const {
            teamName, description, maxMembers, contactEmail, leader,
            technologies, category, mode, githubLink, demoLink
        } = req.body;

        if (!teamName || !contactEmail || !leader) {
            return next(APIError.badRequest("Missing mandatory fields. (teamName, contactEmail, and leader are required)"));
        }

        // Create the Team with all the data directly
        const newTeam = await Team.create({
            teamName,
            description,
            maxMembers,
            contactEmail,
            leader,
            members: [leader],
            technologies: technologies || [],
            category: category || "Web Development",
            mode: mode || "Online",
            githubLink,
            demoLink
        });

        return APIResponse.create(res, "Team created successfully", newTeam);
    } catch (error) {
        next(error);
    }
};