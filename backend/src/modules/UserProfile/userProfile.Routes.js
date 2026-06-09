

import express from "express" ;
import { userMiddleware } from "./userMiddleware.js";
import { updateProfile , getProfile , deleteProfile } from "./userProfileController.js";

const profileRouter = express.Router();

profileRouter.use(userMiddleware);

profileRouter.get('/view', getProfile);
profileRouter.put('/update', updateProfile);
profileRouter.delete('/delete', deleteProfile);

export default profileRouter ;