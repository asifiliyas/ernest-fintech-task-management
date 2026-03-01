import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  const decoded = verifyAccessToken(token);
  if (!decoded) return res.status(403).json({ message: "Invalid or expired token" });

  (req as any).userId = decoded.userId;
  next();
};
