import {Router} from "express";
import {login, register,logout,me,sendOtp,verifyOtp,forgotPassword,resetPassword    } from "../controller/Authcontroller";
import { validate } from "../middleware/validate";
import { registerSchema } from "../validations/user.schema";
import { sendOTPController, verifyOTPController } from "../controller/Email/Auth";




const router = Router();

router.post('/login', login);
// router.post('/register',validate(registerSchema) ,register);
// router.get('/all-users', getAllUsers);
// router.post('/:id/user', getUserById); 




/* Basic Auth */
router.post("/register", register);
// router.post("/login", validate(loginSchema), login);
// router.post("/logout", authMiddleware, logout);
// router.get("/me", authMiddleware, me);

/* OTP */
router.post("/send-otp",sendOTPController);
router.post("/verify-otp",verifyOTPController);

/* Password Reset */
// router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
// router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

/* Google OAuth */
// router.get("/google", googleAuth);
// router.get("/google/callback", googleCallback);




export default router;