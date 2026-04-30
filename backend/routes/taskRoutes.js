import express from "express";
import { body } from "express-validator";
import {
  createTask,
  deleteTask,
  getTaskStats,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.post(
  "/",
  roleMiddleware("Admin"),
  [
    body("title").trim().notEmpty().withMessage("Task title is required"),
    body("assignedTo").notEmpty().withMessage("Assigned member is required"),
    body("projectId").notEmpty().withMessage("Project is required"),
    body("dueDate").isISO8601().withMessage("Valid due date is required")
  ],
  createTask
);
router.put(
  "/:id",
  [body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid task status")],
  updateTask
);
router.delete("/:id", roleMiddleware("Admin"), deleteTask);

export default router;
