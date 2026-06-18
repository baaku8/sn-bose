import express from "express";
import { 
    getOwnedTeams,
    updateTeamDetails,
    getTeamDetailsForEdit,
    fetchNotifications,
    handleRequest,
    fetchJoinedTeams,
    fetchMySentRequests,
    sendJoinRequest 
} from "./dashboard.controllers.js";
import { userMiddleware } from "../UserProfile/user.middlewares.js"; 

export const router = express.Router();

// FIXED: Apply protection to ALL routes in this file
router.use(userMiddleware);

// ----- LEADER CONTROLS -----

// Route: GET /api/dashboard/manageMyTeams
router.get("/manageMyTeams", getOwnedTeams);

// Route: PUT /api/dashboard/manageMyTeams/updateTeam/:id
router.put("/manageMyTeams/updateTeam/:id", updateTeamDetails);

// Route: GET /api/dashboard/manageMyTeams/team/:id
router.get("/manageMyTeams/team/:id", getTeamDetailsForEdit);

// Route: GET /api/dashboard/manageNotifications
router.get("/manageNotifications", fetchNotifications);

// Route: PUT /api/dashboard/manageNotifications/:requestId
router.put("/manageNotifications/:requestId", handleRequest);


// ----- USER CONTROLS -----

// Route: GET /api/dashboard/user-teams/joined-teams
router.get("/user-teams/joined-teams", fetchJoinedTeams);

// Route: GET /api/dashboard/user-teams/all-requests
router.get("/user-teams/all-requests", fetchMySentRequests);

// Route: POST /api/dashboard/user-teams/create-request
router.post("/user-teams/create-request", sendJoinRequest);

export default router;