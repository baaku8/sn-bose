import Team from "./team.models.js";
import APIError from "../../common/utils/api-error.js";
import APIResponse from "../../common/utils/api-response.js";
import * as teamService from "./team.services.js";

const createTeam = async (req, res, next) => {
    try {
        const team = await teamService.createTeam(
            req.user._id,
            req.body
        );

        return APIResponse.create(
            res,
            "Team created successfully",
            team
        );
    } catch (error) {
        next(error);
    }
};

export {
    createTeam
}