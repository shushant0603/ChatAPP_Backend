import {Router} from 'express';
import { authMiddleware } from '../middleware/Auth.middleware';
import {  startChat,getMessagesByChat } from '../controller/chat/chatController';


const router = Router();

router.post('/start',authMiddleware,startChat );
router.get("/:id/messages", authMiddleware,getMessagesByChat); 


export default router;