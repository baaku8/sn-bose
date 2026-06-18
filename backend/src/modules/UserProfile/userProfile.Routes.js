

import express from "express" ;
import { userMiddleware } from "./user.middlewares.js";
import { updateProfile , getProfile , deleteProfile,uploadAvatar } from "./userProfile.controllers.js";
import { upload } from "../../common/utils/upload.middleware.js";

const profileRouter = express.Router();

profileRouter.use(userMiddleware);

profileRouter.get('/view', getProfile);
profileRouter.put('/update', updateProfile);
profileRouter.delete('/delete', deleteProfile);
profileRouter.post('/upload-avatar', upload.single('avatar'), uploadAvatar);

export default profileRouter ;