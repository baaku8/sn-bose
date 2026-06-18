import Team from "../team/team.models.js";
import Project from "../project/project.models.js";
import APIError from "../../common/utils/api-error.js";
import JoinRequest from "../joinRequest/joinRequest.models.js";

// ----- LEADER CONTROLS -----

export const fetchTeamsByLeader = async (userId) => {
    const teams = await Team.find({ leader: userId })
        .select("teamName tagline avatar status maxMembers members openRoles")
        .lean(); 

    const formattedTeams = teams.map(team => ({
        id: team._id,
        teamName: team.teamName,
        tagline: team.tagline,
        avatar: team.avatar,
        status: team.status,
        currentSize: team.members ? team.members.length : 0,
        maxMembers: team.maxMembers,
        openRolesCount: team.openRoles ? team.openRoles.length : 0,
    }));

    return formattedTeams;
};

export const updateTeamAndProject = async (teamId, userId, payload) => {
    const team = await Team.findOne({ _id: teamId, leader: userId });
    
    if (!team) {
        throw APIError.notFound("Team not found or you do not have permission to edit it.");
    }

    const allowedTeamFields = [
        "teamName", "description", "avatar", "maxMembers", 
        "status", "openRoles", "contactEmail"
    ];
    const allowedProjectFields = [
        "title", "description", "category", "technologies", 
        "mode", "githubLink", "demoLink"
    ];

    const filteredTeamData = {};
    if (payload.teamData) {
        Object.keys(payload.teamData).forEach((key) => {
            if (allowedTeamFields.includes(key)) {
                filteredTeamData[key] = payload.teamData[key];
            }
        });
    }

    const filteredProjectData = {};
    if (payload.projectData) {
        Object.keys(payload.projectData).forEach((key) => {
            if (allowedProjectFields.includes(key)) {
                filteredProjectData[key] = payload.projectData[key];
            }
        });
    }

    let updatedTeam = team;
    let updatedProject = null;

    if (Object.keys(filteredTeamData).length > 0) {
        updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $set: filteredTeamData },
            { new: true, runValidators: true }
        );
    }

    if (Object.keys(filteredProjectData).length > 0 && team.project) {
        updatedProject = await Project.findByIdAndUpdate(
            team.project, 
            { $set: filteredProjectData },
            { new: true, runValidators: true }
        );
    }

    return {
        team: updatedTeam,
        project: updatedProject
    };
};

export const getTeamAndProjectForEdit = async (teamId, userId) => {
    const teamDetails = await Team.findOne({ _id: teamId, leader: userId })
        .populate("project")
        .lean();

    if (!teamDetails) {
        throw APIError.notFound("Team not found or unauthorized access.");
    }

    return teamDetails;
};

export const getPendingRequests = async (leaderId) => {
    // FIXED: Populating firstName and lastName instead of "name"
    const requests = await JoinRequest.find({ receiver: leaderId, status: "Pending" })
        .populate("sender", "firstName lastName avatar skills bio")
        .populate("team", "teamName maxMembers members")
        .sort({ createdAt: -1 })
        .lean();

    const notifications = requests.map(req => {
        const spotsLeft = req.team.maxMembers - req.team.members.length;
        return {
            requestId: req._id,
            teamId: req.team._id,
            teamName: req.team.teamName,
            spotsLeft: spotsLeft,
            message: req.message,
            requestedAt: req.createdAt,
            requester: {
                id: req.sender._id,
                // FIXED: String interpolation for first and last name
                name: `${req.sender.firstName} ${req.sender.lastName}`,
                avatar: req.sender.avatar || "default-avatar.png",
                skills: req.sender.skills || [], 
                bio: req.sender.bio || "No bio provided",
            }
        };
    });

    return notifications;
};

export const resolveJoinRequest = async (requestId, leaderId, action) => {
    const joinRequest = await JoinRequest.findOne({ 
        _id: requestId, 
        receiver: leaderId, 
        status: "Pending" 
    });

    if (!joinRequest) {
        throw APIError.notFound("Join request not found or has already been processed.");
    }

    const team = await Team.findById(joinRequest.team);
    if (!team) {
        throw APIError.notFound("The associated team no longer exists.");
    }

    if (action === "accept") {
        if (team.members.length >= team.maxMembers) {
            throw APIError.badRequest("Team is already at maximum capacity.");
        }

        team.members.push({
            user: joinRequest.sender,
            role: "Member"
        });

        if (team.members.length === team.maxMembers) {
            team.status = "Full";
        }
        
        joinRequest.status = "Accepted";
    } else {
        joinRequest.status = "Rejected";
    }

    await Promise.all([team.save(), joinRequest.save()]);

    return `Request successfully ${action}ed.`; 
};

// ----- USER CONTROLS -----

export const getJoinedTeams = async (userId) => {
    // FIXED: Populating firstName and lastName instead of "name"
    const teams = await Team.find({ 
        "members.user": userId,
        leader: { $ne: userId } 
    })
    .populate("leader", "firstName lastName avatar email") 
    .populate("project", "title category status githubLink mode") 
    .select("-joinRequests -openRoles") 
    .sort({ updatedAt: -1 })
    .lean();

    if (!teams) {
        throw APIError.internalServiceError("Failed to fetch joined teams.");
    }

    const formattedTeams = teams.map(team => {
        const userMemberData = team.members.find(
            member => member.user.toString() === userId.toString()
        );

        return {
            teamId: team._id,
            teamName: team.teamName,
            avatar: team.avatar || "default-team.png",
            tagline: team.tagline,
            status: team.status,
            myRole: userMemberData ? userMemberData.role : "Member",
            leader: {
                // FIXED: String interpolation for first and last name
                name: `${team.leader.firstName} ${team.leader.lastName}`,
                email: team.leader.email,
                avatar: team.leader.avatar || "default-avatar.png"
            },
            project: team.project ? {
                id: team.project._id,
                title: team.project.title,
                category: team.project.category,
                mode: team.project.mode
            } : null,
            teamSize: team.members.length,
            maxMembers: team.maxMembers,
            contactEmail: team.contactEmail
        };
    });

    return formattedTeams;
};

export const getUserSentRequests = async (userId) => {
    // FIXED: Populating firstName and lastName instead of "name"
    const requests = await JoinRequest.find({ sender: userId })
        .populate("team", "teamName avatar tagline status maxMembers members")
        .populate("receiver", "firstName lastName avatar") 
        .sort({ createdAt: -1 }) 
        .lean();

    if (!requests) {
        throw APIError.internalServiceError("Failed to fetch your join requests.");
    }

    const formattedRequests = requests.map(req => {
        const teamSize = req.team.members ? req.team.members.length : 0;
        const spotsLeft = req.team.maxMembers - teamSize;

        return {
            requestId: req._id,
            team: {
                id: req.team._id,
                name: req.team.teamName,
                avatar: req.team.avatar || "default-team.png",
                tagline: req.team.tagline,
                status: req.team.status, 
                spotsLeft: spotsLeft
            },
            leader: {
                // FIXED: String interpolation for first and last name
                name: `${req.receiver.firstName} ${req.receiver.lastName}`,
                avatar: req.receiver.avatar || "default-avatar.png"
            },
            messageSent: req.message, 
            requestStatus: req.status, 
            requestedAt: req.createdAt
        };
    });

    return formattedRequests;
};

export const createJoinRequest = async (senderId, teamId, message = "") => {
    const team = await Team.findById(teamId);
    
    if (!team) {
        throw APIError.notFound("The team you are trying to join does not exist.");
    }

    if (team.members.length >= team.maxMembers) {
        throw APIError.badRequest("This team is currently full and not accepting new members.");
    }

    const isAlreadyMember = team.members.some(
        member => member.user.toString() === senderId.toString()
    );
    if (isAlreadyMember) {
        throw APIError.conflict("You are already a member of this team.");
    }

    if (team.leader.toString() === senderId.toString()) {
        throw APIError.badRequest("You cannot request to join a team you already lead.");
    }

    try {
        const newRequest = await JoinRequest.create({
            sender: senderId,
            receiver: team.leader, 
            team: teamId,
            message: message.trim()
        });

        return newRequest;

    } catch (error) {
        if (error.code === 11000) {
            throw APIError.conflict("You have already sent a pending request to this team.");
        }
        throw APIError.internalServiceError("Failed to create join request.");
    }
};