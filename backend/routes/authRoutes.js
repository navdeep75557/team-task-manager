import express from "express";
import { body } from "express-validator";
import { getMe, getUsers, login, signup } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  asyncHandler(signup)
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  asyncHandler(login)
);

router.get("/me", authMiddleware, asyncHandler(getMe));
router.get("/users", authMiddleware, roleMiddleware("Admin"), asyncHandler(getUsers));

export default router;
