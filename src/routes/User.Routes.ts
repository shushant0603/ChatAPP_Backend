import {Router} from "express";
import {authMiddleware} from "../middleware/Auth.middleware";
import {getAllFriends, getAllUsers, getMe,} from "../controller/userController";
import {acceptFriendRequest, rejectFriendRequest, sendFriendRequest,getReceivedRequests} from "../controller/Friend.controller";


const router = Router();


// 🔐 protected route
router.get("/me",authMiddleware,getMe);
router.get("/users", authMiddleware, getAllUsers);
router.post("/:id/sendRequest", authMiddleware,sendFriendRequest);
router.get("/requests/received", authMiddleware, getReceivedRequests);

router.post("/:id/acceptRequest", authMiddleware,acceptFriendRequest);
router.post("/:id/rejectRequest", authMiddleware,rejectFriendRequest);
router.get("/allFriends", authMiddleware,getAllFriends);



export default router;