import { Router } from "express";
import { getTasks, createTask, updateTask, deleteTask, toggleTask, getTaskById } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate); // Protect all task routes

router.get("/", getTasks);
router.post("/", createTask);

// IMPORTANT: Specific routes MUST come before parametric routes
router.patch("/:id/toggle", toggleTask);

router.get("/:id", getTaskById);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
