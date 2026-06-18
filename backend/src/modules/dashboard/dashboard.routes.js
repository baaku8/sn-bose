import express from "express";
import { userMiddleware } from "../UserProfile/user.middlewares.js";
import { 
    getOwnedTeams, updateTeamDetails, getTeamDetailsForEdit, 
    fetchNotifications, handleRequest, fetchJoinedTeams, 
    fetchMySentRequests, sendJoinRequest 
} from "./dashboard.controllers.js";

export const router = express.Router();
router.use(userMiddleware); // Secures all routes below

router.get("/manageMyTeams", getOwnedTeams);
router.put("/manageMyTeams/updateTeam/:id", updateTeamDetails);
router.get("/manageMyTeams/team/:id", getTeamDetailsForEdit);
router.get("/manageNotifications", fetchNotifications);
router.put("/manageNotifications/:requestId", handleRequest);

router.get("/user-teams/joined-teams", fetchJoinedTeams);
router.get("/user-teams/all-requests", fetchMySentRequests);
router.post("/user-teams/create-request", sendJoinRequest);

export default router;