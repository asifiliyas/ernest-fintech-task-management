import { Request, Response } from "express";
import { prisma } from "../prisma-client";

interface AuthRequest extends Request {
  userId: string;
}

export const getTasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as AuthRequest).userId;
    const { status, search, page = "1", limit = "10" } = req.query as any;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = { userId: userId.toString() };

    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const tasks = await (prisma as any).task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    const totalTasks = await (prisma as any).task.count({ where });

    res.json({
      tasks,
      pagination: {
        total: totalTasks,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(totalTasks / take),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching tasks" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = (req as unknown as AuthRequest).userId;
    const { title, description } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await (prisma as any).task.create({
      data: { 
          title: title as string, 
          description: description as string | undefined, 
          userId: userId.toString() 
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error creating task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as unknown as AuthRequest).userId;
    const { title, description, status } = req.body;

    const task = await (prisma as any).task.findFirst({ where: { id: id.toString(), userId: userId.toString() } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const updatedTask = await (prisma as any).task.update({
      where: { id: id.toString() },
      data: { 
          title: title as string | undefined, 
          description: description as string | undefined, 
          status: status as string | undefined 
      },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error updating task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as unknown as AuthRequest).userId;

    const task = await (prisma as any).task.findFirst({ where: { id: id.toString(), userId: userId.toString() } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await (prisma as any).task.delete({ where: { id: id.toString() } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting task" });
  }
};

export const toggleTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as unknown as AuthRequest).userId;

    const task = await (prisma as any).task.findFirst({ where: { id: id.toString(), userId: userId.toString() } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const newStatus = task.status === "completed" ? "pending" : "completed";
    const updatedTask = await (prisma as any).task.update({
      where: { id: id.toString() },
      data: { status: newStatus as string },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error toggling task status" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as unknown as AuthRequest).userId;

    const task = await (prisma as any).task.findFirst({ where: { id: id.toString(), userId: userId.toString() } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching task" });
  }
};
