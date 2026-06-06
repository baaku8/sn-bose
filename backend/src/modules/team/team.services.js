import Team from "./team.models.js";
import APIError from "../../common/utils/APIError.js";

const createTeam = async (userId, body) => {

    const team = await Team.create({
        ...body,
        leader: userId,
        members: [userId],
    });

    return team;
};

export {
    createTeam
}