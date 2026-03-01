"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Task, Pagination, TasksResponse } from "@/types";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Loader2, CheckCircle2,
    Trash2, Edit2, ChevronLeft, ChevronRight, LayoutDashboard,
    ClipboardList, X, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Functional Calendar ─── */
const CalendarWidget = ({ tasks }: { tasks: Task[] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const today = new Date();

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDay = (y: number, m: number) => new Date(y, m, 1).getDay();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const total = daysInMonth(year, month);
    const start = firstDay(year, month);

    const prev = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); };
    const next = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); };

    const tasksByDay = useMemo(() => {
        const map: Record<number, { total: number; done: number }> = {};
        tasks.forEach(t => {
            const d = new Date(t.createdAt);
            if (d.getMonth() === month && d.getFullYear() === year) {
                const day = d.getDate();
                if (!map[day]) map[day] = { total: 0, done: 0 };
                map[day].total++;
                if (t.status === "completed") map[day].done++;
            }
        });
        return map;
    }, [tasks, month, year]);

    const selected = selectedDay ? tasksByDay[selectedDay] : null;

    return (
        <div className="cal-card">
            <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-black text-[#2b3674]">{months[month]} {year}</h4>
                <div className="flex gap-1">
                    <button onClick={prev} className="p-1.5 hover:bg-[#f4f7fe] rounded-lg text-[#a3aed0]"><ChevronLeft size={16} /></button>
                    <button onClick={next} className="p-1.5 hover:bg-[#f4f7fe] rounded-lg text-[#a3aed0]"><ChevronRight size={16} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-[10px] font-black text-[#a3aed0] mb-1">{d}</span>)}
                {Array.from({ length: start }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: total }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const info = tasksByDay[day];
                    const isSelected = selectedDay === day;
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(isSelected ? null : day)}
                            className={cn(
                                "h-8 relative flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                                isToday && !isSelected ? "bg-[#4318ff] text-white" : "",
                                isSelected ? "bg-[#2b3674] text-white ring-2 ring-[#2b3674]/30" : "",
                                !isToday && !isSelected ? "text-[#2b3674] hover:bg-[#f4f7fe]" : ""
                            )}
                        >
                            {day}
                            {info && !isToday && !isSelected && <span className="absolute bottom-0.5 h-1 w-1 bg-[#4318ff] rounded-full" />}
                        </button>
                    );
                })}
            </div>
            {selectedDay && (
                <div className="mt-4 pt-4 border-t border-[#f4f7fe]">
                    <p className="text-[10px] font-black text-[#a3aed0] uppercase mb-1">
                        {selectedDay} {months[month].slice(0, 3)} {year}
                    </p>
                    {selected ? (
                        <p className="text-sm font-black text-[#2b3674]">
                            <span className="text-[#05cd99]">{selected.done}</span> / {selected.total} tasks completed
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-[#a3aed0]">No tasks on this day</p>
                    )}
                </div>
            )}
        </div>
    );
};

/* ─── Delete Confirm Modal ─── */
const DeleteModal = ({ isOpen, onCancel, onConfirm, loading }: {
    isOpen: boolean; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onCancel} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#ee5d50]/10 mb-4">
                        <AlertTriangle size={24} className="text-[#ee5d50]" />
                    </div>
                    <h3 className="text-lg font-black text-[#2b3674] mb-1">Delete Task?</h3>
                    <p className="text-xs font-bold text-[#a3aed0] mb-6">This action cannot be reversed.</p>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 bg-[#f4f7fe] rounded-xl text-xs font-black text-[#a3aed0]">Cancel</button>
                        <button onClick={onConfirm} disabled={loading}
                            className="flex-1 py-3 bg-[#ee5d50] rounded-xl text-xs font-black text-white flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    // Form
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // States for UX
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    /* ─── API ─── */
    const fetchTasks = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await api.get("/tasks", { params: { search, status, page, limit: 10 } });
            const payload = res.data as TasksResponse;
            setTasks(payload.tasks);
            setPagination(payload.pagination);
        } catch {
            toast.error("Failed to load tasks");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        if (!authLoading && !user) router.push("/login");
        if (user) fetchTasks();
    }, [user, authLoading, fetchTasks, router]);

    const handleToggle = async (id: string) => {
        setTogglingId(id);
        try {
            await api.patch(`/tasks/${id}/toggle`);
            toast.success("Status updated");
            await fetchTasks(true);
        } catch {
            toast.error("Failed to update status");
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/tasks/${deleteId}`);
            toast.success("Task deleted successfully");
            setDeleteId(null);
            fetchTasks();
        } catch {
            toast.error("Failed to delete task");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (editingTask) {
                await api.patch(`/tasks/${editingTask.id}`, { title: formTitle, description: formDesc });
                toast.success("Task updated");
            } else {
                await api.post("/tasks", { title: formTitle, description: formDesc });
                toast.success("Task created");
            }
            closeForm();
            fetchTasks();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setFormLoading(false);
        }
    };

    /* ─── The MISSING openEdit function ─── */
    const openEdit = (task: Task) => {
        setEditingTask(task);
        setFormTitle(task.title);
        setFormDesc(task.description || "");
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingTask(null);
        setFormTitle("");
        setFormDesc("");
    };

    /* ─── Derived stats ─── */
    const completedCount = useMemo(() => tasks.filter(t => t.status === "completed").length, [tasks]);
    const pendingCount = useMemo(() => tasks.filter(t => t.status === "pending").length, [tasks]);
    const totalCount = pagination?.total || 0;
    const rate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    if (authLoading) return (
        <div className="flex bg-[#f4f7fe] h-screen items-center justify-center">
            <Loader2 className="animate-spin text-[#4318ff]" size={32} />
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f4f7fe] overflow-hidden">

            {/* ── Sidebar ── */}
            <aside className="hidden w-[260px] flex-col bg-white lg:flex">
                <div className="px-8 py-10">
                    <h1 className="text-2xl font-black text-[#2b3674] tracking-tight">Taskcore<span className="text-[#4318ff]">.</span></h1>
                </div>
                <nav className="flex-1 px-4">
                    <button className="flex w-full items-center gap-3 rounded-xl bg-[#4318ff] px-4 py-3 text-sm font-black text-white shadow-lg shadow-[#4318ff]/20">
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                </nav>
                <div className="p-6 mt-auto">
                    <div className="flex items-center gap-3 bg-[#f4f7fe] p-3 rounded-xl">
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-[#4318ff] font-black text-sm shadow-sm">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-black text-[#2b3674]">{user?.name || "Member"}</p>
                            <button onClick={logout} className="text-[10px] font-black text-[#ee5d50] uppercase tracking-wider hover:underline">Sign Out</button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-y-auto">

                {/* Mobile header */}
                <div className="flex items-center justify-between p-4 lg:hidden">
                    <h1 className="text-lg font-black text-[#2b3674]">Taskcore<span className="text-[#4318ff]">.</span></h1>
                    <button onClick={logout} className="text-xs font-black text-[#ee5d50]">Sign Out</button>
                </div>

                <div className="px-6 lg:px-10 py-6 lg:py-8">

                    {/* Welcome Banner */}
                    <div className="welcome-banner mb-8 animate-slide-up">
                        <div className="relative z-10">
                            <h2 className="text-xl md:text-2xl font-black text-white mb-1">Welcome back, {user?.name?.split(" ")[0] || "there"}!</h2>
                            <p className="text-sm font-bold text-white/60 mb-6 max-w-md">
                                You have <span className="text-white font-black">{totalCount} tasks</span> in your workspace.
                                <span className="text-[#05cd99]"> {completedCount} completed</span>, <span className="text-[#ffb547]">{pendingCount} pending</span>.
                            </p>
                            <button onClick={() => setIsFormOpen(true)}
                                className="bg-white text-[#2b3674] px-6 py-3 rounded-xl text-xs font-black hover:bg-white/90 transition-all shadow-lg active:scale-95 inline-flex items-center gap-2">
                                <Plus size={16} /> New Task
                            </button>
                        </div>
                        <div className="absolute right-[-5%] top-[-30%] w-[250px] h-[250px] bg-[#4318ff]/30 rounded-full blur-[80px]" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* ── Task Feed ── */}
                        <div className="xl:col-span-2 space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h3 className="text-lg font-black text-[#2b3674]">Your Tasks</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="search-container flex-1 sm:w-64">
                                        <Search size={16} className="text-[#a3aed0] shrink-0" />
                                        <input type="text" placeholder="Search tasks..." className="search-input"
                                            value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>

                                    {/* Premium Filter Controls */}
                                    <div className="flex bg-white/50 p-1 rounded-xl border border-[#e9edf7] self-start sm:self-auto">
                                        {[
                                            { id: "", label: "All" },
                                            { id: "pending", label: "Pending" },
                                            { id: "completed", label: "Done" }
                                        ].map((btn) => (
                                            <button
                                                key={btn.id}
                                                onClick={() => setStatus(btn.id)}
                                                className={cn(
                                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                                                    status === btn.id
                                                        ? "bg-white text-[#4318ff] shadow-sm ring-1 ring-[#e9edf7]"
                                                        : "text-[#a3aed0] hover:text-[#2b3674]"
                                                )}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {loading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="task-card flex items-center gap-4 overflow-hidden relative">
                                                <div className="h-7 w-7 rounded-lg bg-[#f4f7fe] shrink-0 animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-[#f4f7fe] rounded w-1/3 animate-pulse" />
                                                    <div className="h-2 bg-[#f4f7fe] rounded w-20 animate-pulse" />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-effect" />
                                            </div>
                                        ))
                                    ) : tasks.length === 0 ? (
                                        <div className="py-16 text-center rounded-2xl border-2 border-dashed border-[#e9edf7]">
                                            <ClipboardList size={32} className="mx-auto mb-3 text-[#e9edf7]" />
                                            <p className="text-sm font-black text-[#a3aed0]">No tasks found</p>
                                        </div>
                                    ) : (
                                        tasks.map(task => (
                                            <motion.div key={task.id} layout
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                                                className={cn("task-card flex items-center gap-4 group relative overflow-hidden",
                                                    task.status === "completed" && "opacity-70")}>

                                                {/* Progress Battery Loader (Top Edge) */}
                                                {togglingId === task.id && (
                                                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#f4f7fe]">
                                                        <motion.div
                                                            className="h-full bg-[#4318ff]"
                                                            initial={{ width: "0%" }}
                                                            animate={{ width: "100%" }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Toggle checkbox */}
                                                <button
                                                    onClick={() => handleToggle(task.id)}
                                                    disabled={togglingId === task.id}
                                                    className={cn("h-7 w-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all relative overflow-hidden",
                                                        task.status === "completed"
                                                            ? "bg-[#05cd99] border-[#05cd99] text-white"
                                                            : "border-[#e9edf7] text-transparent hover:border-[#4318ff]")}
                                                >
                                                    {togglingId === task.id ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-[#4318ff]">
                                                            <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        </div>
                                                    ) : (
                                                        <CheckCircle2 size={14} />
                                                    )}
                                                </button>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm font-black", task.status === "completed" ? "text-[#a3aed0]" : "text-[#2b3674]")}>
                                                        {task.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={cn("text-[9px] font-black uppercase px-1.5 py-0.5 rounded",
                                                            task.status === "completed" ? "bg-[#05cd99]/10 text-[#05cd99]" : "bg-[#ee5d50]/10 text-[#ee5d50]")}>
                                                            {task.status === "completed" ? "Done" : "Pending"}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[#a3aed0]">
                                                            {new Date(task.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions (always visible on mobile, hover on desktop) */}
                                                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(task)}
                                                        className="p-2 rounded-lg text-[#a3aed0] hover:text-[#4318ff] hover:bg-[#f4f7fe] transition-colors">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => setDeleteId(task.id)}
                                                        className="p-2 rounded-lg text-[#a3aed0] hover:text-[#ee5d50] hover:bg-[#f4f7fe] transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Pagination */}
                            {pagination && pagination.totalPages > 1 && (
                                <div className="flex gap-2 justify-center pt-6">
                                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-[#a3aed0] disabled:opacity-30">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <div className="flex items-center px-4 bg-[#2b3674] text-white rounded-xl text-xs font-black">
                                        {page} / {pagination.totalPages}
                                    </div>
                                    <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-[#a3aed0] disabled:opacity-30">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Right Panel ── */}
                        <div className="space-y-6 hidden xl:block">
                            <CalendarWidget tasks={tasks} />

                            {/* Efficiency — real numbers */}
                            <div className="cal-card">
                                <h4 className="text-sm font-black text-[#2b3674] mb-5">Efficiency Report</h4>
                                <div className="space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-black text-[#a3aed0] uppercase">Completed</p>
                                            <p className="text-2xl font-black text-[#2b3674]">{completedCount}<span className="text-sm text-[#a3aed0]"> / {tasks.length}</span></p>
                                        </div>
                                        <p className="text-3xl font-black text-[#4318ff]">{rate}%</p>
                                    </div>
                                    <div className="h-2.5 bg-[#f4f7fe] rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-[#4318ff] to-[#05cd99] rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black">
                                        <span className="text-[#05cd99]">{completedCount} Done</span>
                                        <span className="text-[#ee5d50]">{pendingCount} Pending</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Create / Edit Modal ── */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeForm} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-[#2b3674]">
                                    {editingTask ? "Edit Task" : "Create Task"}
                                </h2>
                                <button onClick={closeForm} className="p-2 bg-[#f4f7fe] rounded-full text-[#a3aed0] hover:text-[#2b3674]">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Title</label>
                                    <input type="text" required value={formTitle} onChange={e => setFormTitle(e.target.value)}
                                        className="w-full bg-[#f4f7fe] border-none rounded-xl px-4 py-3 text-sm font-black text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                                        placeholder="What needs to be done?" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Description</label>
                                    <textarea rows={3} value={formDesc} onChange={e => setFormDesc(e.target.value)}
                                        className="w-full bg-[#f4f7fe] border-none rounded-xl px-4 py-3 text-sm font-bold text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20 resize-none"
                                        placeholder="Add details (optional)..." />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={closeForm}
                                        className="flex-1 py-3 bg-[#f4f7fe] rounded-xl text-xs font-black text-[#a3aed0]">Cancel</button>
                                    <button type="submit" disabled={formLoading}
                                        className="flex-1 py-3 bg-[#4318ff] rounded-xl text-xs font-black text-white shadow-lg shadow-[#4318ff]/20 flex items-center justify-center gap-2">
                                        {formLoading ? <Loader2 size={14} className="animate-spin" /> : (editingTask ? "Save Changes" : "Create Task")}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Delete Confirmation ── */}
            <DeleteModal isOpen={!!deleteId} onCancel={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleteLoading} />
        </div>
    );
}
