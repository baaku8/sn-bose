import APIError from "../../common/utils/api-error.js";
import APIResponse from "../../common/utils/api-response.js";
import { 
    fetchTeamsByLeader,
    updateTeamAndProject,
    getTeamAndProjectForEdit,
    getPendingRequests,
    resolveJoinRequest,
    getJoinedTeams,
    getUserSentRequests,
    createJoinRequest,
    removeTeamMember, processLeaveTeam
} from "./dashboard.services.js";

// ----- LEADER CONTROLS -----

export const getOwnedTeams = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const ownedTeams = await fetchTeamsByLeader(userId);

        // FIXED: Removed "new" keyword
        return APIResponse.ok(res, "data for -- /dashboard/manageTeams/ --", {
            success: true,
            count: ownedTeams.length,
            data: ownedTeams
        });

    } catch (error) {
        // FIXED: Passed error to next()
        next(error); 
    }
};

export const updateTeamDetails = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const teamId = req.params.id; 
        const updatePayload = req.body; 

        const updatedData = await updateTeamAndProject(teamId, userId, updatePayload);

        // FIXED: Removed "new" keyword
        return APIResponse.ok(res, "Team and Project updated successfully", {
            success: true,
            data: updatedData
        });

    } catch (error) {
        console.error("Error updating team/project:", error);

        if (error.name === "ValidationError") {
            return next(APIError.badRequest(error.message));
        }

        // FIXED: Passed error to next()
        next(error);
    }
};

export const getTeamDetailsForEdit = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const teamId = req.params.id; 

        const teamDetails = await getTeamAndProjectForEdit(teamId, userId);

        // FIXED: Removed "new" keyword
        return APIResponse.ok(res, "Success -- getTeamDetailsForEdit", {
            success: true,
            data: teamDetails
        });

    } catch (error) {
        console.error("Error fetching team details for edit:", error);

        if (error.name === "CastError") {
            return next(APIError.badRequest("Invalid Team ID format."));
        }

        // FIXED: Passed error to next()
        next(error);
    }
};

export const fetchNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const notifications = await getPendingRequests(userId);

        return APIResponse.ok(res, "Notifications fetched successfully", notifications);

    } catch (error) {
        console.error("Error fetching notifications:", error);
        // FIXED: Passed error to next()
        next(error);
    }
};

export const handleRequest = async (req, res, next) => {
    try {
        const leaderId = req.user.id;
        const { requestId } = req.params;
        const { action } = req.body; 

        if (!["accept", "reject"].includes(action)) {
            return next(APIError.badRequest("Invalid action. Use 'accept' or 'reject'."));
        }

        const successMessage = await resolveJoinRequest(requestId, leaderId, action);
        return APIResponse.ok(res, successMessage);

    } catch (error) {
        console.error("Error handling join request:", error);
        // FIXED: Passed error to next()
        next(error);
    }
};

// ----- USER CONTROLS -----

export const fetchJoinedTeams = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const joinedTeams = await getJoinedTeams(userId);

        return APIResponse.ok(res, "Joined teams fetched successfully", joinedTeams);

    } catch (error) {
        console.error("Error fetching joined teams:", error);
        // FIXED: Passed error to next()
        next(error);
    }
};

export const fetchMySentRequests = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const sentRequests = await getUserSentRequests(userId);

        return APIResponse.ok(res, "Sent requests fetched successfully", sentRequests);

    } catch (error) {
        console.error("Error fetching sent requests:", error);
        // FIXED: Passed error to next()
        next(error);
    }
};

export const sendJoinRequest = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { teamId, message } = req.body; 

        if (!teamId) {
            return next(APIError.badRequest("Team ID is required to send a request."));
        }

        const newRequest = await createJoinRequest(userId, teamId, message);

        return APIResponse.create(
            res, 
            "Join request sent successfully! The team leader will review your application.", 
            newRequest
        );

    } catch (error) {
        console.error("Error creating join request:", error);
        // FIXED: Passed error to next()
        next(error);
    }
};
export const removeMemberFromTeam = async (req, res, next) => {
    try {
        const leaderId = req.user.id || req.user._id; 
        const { teamId, memberId } = req.params;

        await removeTeamMember(teamId, memberId, leaderId);

        return APIResponse.ok(res, "Member removed successfully");
    } catch (error) {
        next(error);
    }
};

export const leaveTeam = async (req, res, next) => {
    try {
        const userId = req.user.id || req.user._id; 
        const { teamId } = req.params;

        await processLeaveTeam(teamId, userId);

        return APIResponse.ok(res, "You have left the team successfully");
    } catch (error) {
        next(error);
    }
};