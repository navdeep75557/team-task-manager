import { validationResult } from "express-validator";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const canAccessProject = async (user, projectId) => {
  if (user.role === "Admin") {
    return Project.findById(projectId);
  }

  return Project.findOne({ _id: projectId, members: user._id });
};

const taskQueryForUser = (user, projectId) => {
  const query = {};

  if (projectId) {
    query.projectId = projectId;
    return query;
  }

  if (user.role === "Member") {
    query.assignedTo = user._id;
  }

  return query;
};

export const getTasks = async (req, res) => {
  const { projectId } = req.query;

  if (projectId) {
    const project = await canAccessProject(req.user, projectId);

    if (!project) {
      return res.status(403).json({ message: "You cannot access this project" });
    }
  }

  const tasks = await Task.find(taskQueryForUser(req.user, projectId))
    .populate("assignedTo", "name email role")
    .populate("projectId", "name")
    .sort({ createdAt: -1 });

  res.json(tasks);
};

export const createTask = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const project = await Project.findById(req.body.projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.members.map(String).includes(req.body.assignedTo)) {
    return res.status(400).json({ message: "Assigned user must belong to this project" });
  }

  const task = await Task.create(req.body);
  const populatedTask = await task.populate([
    { path: "assignedTo", select: "name email role" },
    { path: "projectId", select: "name" }
  ]);

  res.status(201).json(populatedTask);
};

export const updateTask = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (req.user.role === "Member" && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only update your assigned tasks" });
  }

  if (req.user.role === "Member") {
    task.status = req.body.status || task.status;
  } else {
    const nextProjectId = req.body.projectId || task.projectId.toString();
    const nextAssignedTo = req.body.assignedTo || task.assignedTo.toString();
    const project = await Project.findById(nextProjectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.members.map(String).includes(nextAssignedTo)) {
      return res.status(400).json({ message: "Assigned user must belong to this project" });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;
    task.assignedTo = nextAssignedTo;
    task.projectId = nextProjectId;
    task.dueDate = req.body.dueDate ?? task.dueDate;
  }

  await task.save();

  const populatedTask = await task.populate([
    { path: "assignedTo", select: "name email role" },
    { path: "projectId", select: "name" }
  ]);

  res.json(populatedTask);
};

export const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
};

export const getTaskStats = async (req, res) => {
  const now = new Date();
  const baseQuery = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };

  const [totalTasks, completedTasks, overdueTasks, assignedToMe] = await Promise.all([
    Task.countDocuments(baseQuery),
    Task.countDocuments({ ...baseQuery, status: "Done" }),
    Task.countDocuments({ ...baseQuery, dueDate: { $lt: now }, status: { $ne: "Done" } }),
    Task.find({ assignedTo: req.user._id })
      .populate("assignedTo", "name email role")
      .populate("projectId", "name")
      .sort({ dueDate: 1 })
      .limit(8)
  ]);

  res.json({
    totalTasks,
    completedTasks,
    overdueTasks,
    assignedToMe
  });
};
