import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is missing from environment variables");
    error.statusCode = 500;
    throw error;
  }

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, password, role } = req.body;
  const email = req.body.email.toLowerCase().trim();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role === "Admin" ? "Admin" : "Member"
  });

  res.status(201).json({
    token: createToken(user),
    user: userPayload(user)
  });
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const email = req.body.email.toLowerCase().trim();
    const { password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: createToken(user),
      user: userPayload(user)
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Login failed" });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: userPayload(req.user) });
};

export const getUsers = async (_req, res) => {
  const users = await User.find().select("name email role").sort({ name: 1 });

  res.json(users);
};
