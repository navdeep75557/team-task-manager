import express from "express";
import { body } from "express-validator";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProjectMembers
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.post(
  "/",
  roleMiddleware("Admin"),
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  createProject
);
router.put("/:id/members", roleMiddleware("Admin"), updateProjectMembers);
router.delete("/:id", roleMiddleware("Admin"), deleteProject);

export default router;
