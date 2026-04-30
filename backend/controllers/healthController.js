import mongoose from "mongoose";

export const getHealth = async (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.json({
    status: "ok",
    mongo: mongoStates[mongoState] || "unknown",
    jwtSecretConfigured: Boolean(process.env.JWT_SECRET),
    clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || null
  });
};
