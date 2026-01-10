import {Router} from "express";
import {login, register, getAllUsers, getUserById} from "../controller/Authcontroller";


const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/all-users', getAllUsers);
router.post('/:id/user', getUserById);  

export default router;