import {Router} from "express";

const router = Router();

/* send friend request */
router.post(
  "/request");

/* get incoming requests */
router.get(
  "/requests"
);

/* accept request */
router.post(
  "/accept",
);

/* reject request */
router.post(
  "/reject",);



export default router;
