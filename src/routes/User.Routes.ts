import {Router} from "express";

const router = Router();

router.get('/user');
router.post('/user/:id');


export default router;