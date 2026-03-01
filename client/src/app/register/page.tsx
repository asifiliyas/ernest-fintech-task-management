"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, User, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setIsSubmitting(true);
        try {
            await register(email, password, name);
            toast.success("Account created successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed. Please check your details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] p-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-[#2b3674] tracking-tight">
                        Taskcore<span className="text-[#4318ff]">.</span>
                    </h1>
                    <p className="mt-2 text-sm font-bold text-[#a3aed0]">
                        Create your account
                    </p>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-[0_4px_24px_rgba(112,144,176,0.08)]">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Full Name</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3aed0]"><User size={16} /></div>
                                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-[#f4f7fe] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-black text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                                    placeholder="John Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Email</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3aed0]"><Mail size={16} /></div>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-[#f4f7fe] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-black text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                                    placeholder="name@company.com" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3aed0]"><Lock size={16} /></div>
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-[#f4f7fe] border-none rounded-xl pl-10 pr-10 py-3 text-sm font-black text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                                    placeholder="Min 6 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3aed0] hover:text-[#2b3674] transition-colors p-1 rounded-md">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-wider block mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3aed0]"><CheckCircle2 size={16} /></div>
                                <input type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full bg-[#f4f7fe] border-none rounded-xl pl-10 pr-4 py-3 text-sm font-black text-[#2b3674] placeholder:text-[#a3aed0] focus:outline-none focus:ring-2 focus:ring-[#4318ff]/20"
                                    placeholder="Re-enter password" />
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting}
                            className="w-full bg-[#4318ff] text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#4318ff]/20 hover:bg-[#3311cc] transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                            {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm font-bold text-[#a3aed0]">
                    Already have an account?{" "}
                    <Link href="/login" className="font-black text-[#4318ff] hover:underline">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
