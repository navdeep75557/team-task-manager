import { validationResult } from "express-validator";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const projectQueryForUser = (user) => {
  if (user.role === "Admin") {
    return {};
  }

  return { members: user._id };
};

export const getProjects = async (req, res) => {
  const projects = await Project.find(projectQueryForUser(req.user))
    .populate("createdBy", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });

  res.json(projects);
};

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const memberIds = Array.from(new Set([...(req.body.members || []), req.user._id.toString()]));
  const project = await Project.create({
    name: req.body.name,
    createdBy: req.user._id,
    members: memberIds
  });

  const populatedProject = await project.populate([
    { path: "createdBy", select: "name email role" },
    { path: "members", select: "name email role" }
  ]);

  res.status(201).json(populatedProject);
};

export const updateProjectMembers = async (req, res) => {
  const { memberIds = [] } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const users = await User.find({ _id: { $in: memberIds } }).select("_id");
  const validMemberIds = users.map((user) => user._id.toString());

  if (!validMemberIds.includes(project.createdBy.toString())) {
    validMemberIds.push(project.createdBy.toString());
  }

  project.members = validMemberIds;
  await project.save();

  const populatedProject = await project.populate([
    { path: "createdBy", select: "name email role" },
    { path: "members", select: "name email role" }
  ]);

  res.json(populatedProject);
};

export const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.json({ message: "Project deleted" });
};
