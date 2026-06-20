import Team from "../team/team.models.js";
import APIError from "../../common/utils/api-error.js";
import JoinRequest from "../joinRequest/joinRequest.models.js";

// ==========================================
// ----- LEADER CONTROLS (OWNED TEAMS) ------
// ==========================================

export const fetchTeamsByLeader = async (userId) => {
    const teams = await Team.find({ leader: userId })
        .select("teamName description tagline avatar status maxMembers members openRoles")
        .lean(); 

    const formattedTeams = teams.map(team => ({
        id: team._id,
        teamName: team.teamName,
        tagline: team.description || team.tagline, // Using merged description
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

    // Combine all allowed fields into one list
    const allowedFields = [
        "teamName", "description", "avatar", "maxMembers", 
        "status", "openRoles", "contactEmail", "category", 
        "technologies", "mode", "githubLink", "demoLink"
    ];

    const updateData = {};
    
    // Fallback: Support both flat payloads and the old { teamData: {}, projectData: {} } format
    const incomingData = { ...(payload.teamData || {}), ...(payload.projectData || {}), ...payload };

    Object.keys(incomingData).forEach((key) => {
        if (allowedFields.includes(key)) {
            updateData[key] = incomingData[key];
        }
    });

    const updatedTeam = await Team.findByIdAndUpdate(
        teamId,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return { team: updatedTeam }; 
};

export const getTeamAndProjectForEdit = async (teamId, userId) => {
    const teamDetails = await Team.findOne({ _id: teamId, leader: userId }).lean();
    if (!teamDetails) {
        throw APIError.notFound("Team not found or unauthorized access.");
    }
    return teamDetails;
};

// export const getPendingRequests = async (leaderId) => {
//     const requests = await JoinRequest.find({ receiver: leaderId, status: "Pending" })
//         .populate("sender", "firstName lastName avatar skills bio")
//         .populate("team", "teamName maxMembers members")
//         .sort({ createdAt: -1 })
//         .lean();

//     const notifications = requests.map(req => {
//         const spotsLeft = req.team.maxMembers - (req.team.members ? req.team.members.length : 0);
//         return {
//             requestId: req._id,
//             teamId: req.team._id,
//             teamName: req.team.teamName,
//             spotsLeft: spotsLeft,
//             message: req.message,
//             requestedAt: req.createdAt,
//             requester: {
//                 id: req.sender._id,
//                 name: `${req.sender.firstName} ${req.sender.lastName}`,
//                 avatar: req.sender.avatar || "default-avatar.png",
//                 skills: req.sender.skills || [], 
//                 bio: req.sender.bio || "No bio provided",
//             }
//         };
//     });

//     return notifications;
// };
export const getPendingRequests = async (leaderId) => {
    const requests = await JoinRequest.find({ receiver: leaderId, status: "Pending" })
        .populate("sender", "firstName lastName avatar skills bio")
        .populate("team", "teamName maxMembers members")
        .sort({ createdAt: -1 })
        .lean();

    // STRICT SAFETY CHECK: Filter out requests where the team or sender no longer exists in the DB
    const validRequests = requests.filter(req => req.team != null && req.sender != null);

    const notifications = validRequests.map(req => {
        // Safe fallbacks for all calculations
        const maxMembers = req.team.maxMembers || 5;
        const currentMembers = req.team.members ? req.team.members.length : 0;
        const spotsLeft = maxMembers - currentMembers;

        return {
            requestId: req._id,
            teamId: req.team._id,
            teamName: req.team.teamName || "Unnamed Team",
            spotsLeft: spotsLeft,
            message: req.message || "",
            requestedAt: req.createdAt,
            requester: {
                id: req.sender._id,
                // Safely handle missing names
                name: `${req.sender.firstName || 'Unknown'} ${req.sender.lastName || 'User'}`.trim(),
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
        _id: requestId, receiver: leaderId, status: "Pending" 
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

        // Push ONLY the User ObjectId to the members array
        team.members.push(joinRequest.sender);

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

export const removeTeamMember = async (teamId, memberId, leaderId) => {
    const team = await Team.findOne({ _id: teamId, leader: leaderId });
    if (!team) throw APIError.notFound("Team not found or unauthorized.");

    if (memberId === leaderId.toString()) {
        throw APIError.badRequest("You cannot remove yourself as the leader.");
    }

    const initialLength = team.members.length;
    // Filter out the specific member ID
    team.members = team.members.filter(mId => mId.toString() !== memberId.toString());

    if (team.members.length === initialLength) {
        throw APIError.notFound("Member not found in this team.");
    }

    // Open recruitment if team was full
    if (team.status === "Full") team.status = "Recruiting";
    
    await team.save();
    return team;
};

// ==========================================
// ------ USER CONTROLS (JOINED TEAMS) ------
// ==========================================

export const getJoinedTeams = async (userId) => {
    const teams = await Team.find({ 
        members: userId, // Search the array of ObjectIds directly
        leader: { $ne: userId } 
    })
    .populate("leader", "firstName lastName avatar email")
    .select("-joinRequests")
    .sort({ updatedAt: -1 })
    .lean(); 

    if (!teams) {
        throw APIError.internalServiceError("Failed to fetch joined teams.");
    }

    const formattedTeams = teams.map(team => {
        return {
            teamId: team._id,
            teamName: team.teamName,
            avatar: team.avatar || "default-team.png",
            tagline: team.description || team.tagline, // Fallback to merged description
            status: team.status,
            myRole: "Member",
            leader: {
                name: `${team.leader.firstName} ${team.leader.lastName}`,
                email: team.leader.email,
                avatar: team.leader.avatar || "default-avatar.png"
            },
            // SHIM: Reconstruct the 'project' object so the frontend UI doesn't crash
            project: {
                id: team._id,
                title: team.teamName,
                category: team.category || "Web Development",
                mode: team.mode || "Online"
            },
            teamSize: team.members ? team.members.length : 0,
            maxMembers: team.maxMembers,
            contactEmail: team.contactEmail
        };
    });

    return formattedTeams;
};

// export const getUserSentRequests = async (userId) => {
//     const requests = await JoinRequest.find({ sender: userId })
//         .populate("team", "teamName avatar tagline status maxMembers members")
//         .populate("receiver", "firstName lastName avatar") 
//         .sort({ createdAt: -1 }) 
//         .lean();

//     if (!requests) {
//         throw APIError.internalServiceError("Failed to fetch your join requests.");
//     }

//     const formattedRequests = requests.map(req => {
//         const teamSize = req.team.members ? req.team.members.length : 0;
//         const spotsLeft = req.team.maxMembers - teamSize;

//         return {
//             requestId: req._id,
//             team: {
//                 id: req.team._id,
//                 name: req.team.teamName,
//                 avatar: req.team.avatar || "default-team.png",
//                 tagline: req.team.tagline,
//                 status: req.team.status, 
//                 spotsLeft: spotsLeft
//             },
//             leader: {
//                 name: `${req.receiver.firstName} ${req.receiver.lastName}`,
//                 avatar: req.receiver.avatar || "default-avatar.png"
//             },
//             messageSent: req.message, 
//             requestStatus: req.status, 
//             requestedAt: req.createdAt
//         };
//     });

//     return formattedRequests;
// };

export const getUserSentRequests = async (userId) => {
    const requests = await JoinRequest.find({ sender: userId })
        .populate("team", "teamName avatar tagline description status maxMembers members")
        .populate("receiver", "firstName lastName avatar") 
        .sort({ createdAt: -1 }) 
        .lean();

    if (!requests) {
        throw APIError.internalServiceError("Failed to fetch your join requests.");
    }

    // SAFETY CHECK: Filter out requests where the team or receiver was deleted
    const validRequests = requests.filter(req => req.team != null && req.receiver != null);

    const formattedRequests = validRequests.map(req => {
        const teamSize = req.team.members ? req.team.members.length : 0;
        const spotsLeft = req.team.maxMembers - teamSize;

        return {
            requestId: req._id,
            team: {
                id: req.team._id,
                name: req.team.teamName,
                avatar: req.team.avatar || "default-team.png",
                tagline: req.team.description || req.team.tagline, // Fallback for merged models
                status: req.team.status, 
                spotsLeft: spotsLeft
            },
            leader: {
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
        memberId => memberId.toString() === senderId.toString()
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

export const processLeaveTeam = async (teamId, userId) => {
    const team = await Team.findById(teamId);
    if (!team) throw APIError.notFound("Team not found.");

    if (team.leader.toString() === userId.toString()) {
        throw APIError.badRequest("The leader cannot leave the team.");
    }

    const initialLength = team.members.length;
    team.members = team.members.filter(mId => mId.toString() !== userId.toString());

    if (team.members.length === initialLength) {
        throw APIError.badRequest("You are not a member of this team.");
    }

    if (team.status === "Full") team.status = "Recruiting";

    await team.save();
    return team;
};