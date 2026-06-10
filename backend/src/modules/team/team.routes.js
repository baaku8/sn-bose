import express from "express";
import { getAllTeams, getTeamById, createTeam } from "./team.controllers.js";
import { userMiddleware } from "../UserProfile/user.middlewares.js";

const teamRouter = express.Router();

// Homepage: Fetch all cards
teamRouter.get("/", getAllTeams);

// Details Page: Fetch by ID
teamRouter.get("/team/:id", getTeamById);

// Create Team Action
teamRouter.post("/createTeam", userMiddleware,createTeam);

export default teamRouter;