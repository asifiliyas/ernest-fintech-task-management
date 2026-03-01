import { Request, Response } from "express";
import { prisma } from "../prisma-client";
import { hashPassword, comparePasswords } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await (prisma as any).user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);
    
    // Using explicit 'any' on prisma to bypass incorrect type definitions in the core engine
    const user = await (prisma as any).user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name 
      },
    });

    if (!user) {
      return res.status(500).json({ message: "Task initialization failed" });
    }

    const accessToken = generateAccessToken(user.id.toString());
    const refreshToken = generateRefreshToken(user.id.toString());

    await (prisma as any).refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id.toString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({ 
        accessToken, 
        refreshToken, 
        user: { id: user.id.toString(), email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await (prisma as any).user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id.toString());
    const refreshToken = generateRefreshToken(user.id.toString());

    await (prisma as any).refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id.toString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });

    res.json({ 
        accessToken, 
        refreshToken, 
        user: { id: user.id.toString(), email: user.email, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Token required" });

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return res.status(403).json({ message: "Invalid token" });

    const storedToken = await (prisma as any).refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const newAccessToken = generateAccessToken(decoded.userId.toString());
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error during token refresh" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await (prisma as any).refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
};
