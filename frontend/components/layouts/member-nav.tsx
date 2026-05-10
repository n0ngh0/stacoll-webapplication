"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function MemberNav() {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string; imgUrl?: string } | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const userData = localStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Failed to parse user data:", error);
        }

        // ฟังก์ชันปิด Dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ฟังก์ชันออกจากระบบ
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // ลบ Cookie ด้วยเพื่อให้ Middleware ทำงานถูกต้อง
        document.cookie = "token=; path=/; max-age=0;";
        document.cookie = "user=; path=/; max-age=0;";

        router.push("/");
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm bg-canvas/80 border-b border-border-subtle transition-colors duration-300">
            <nav className="flex justify-between items-center py-4 px-[5%] max-w-[1200px] mx-auto w-full">
                
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 text-2xl font-bold no-underline text-greenui">
                    <img className="h-10 w-auto object-contain" src="/assets/LogoStacoll.png" alt="Logo" />
                    <img className="h-6 w-auto object-contain hidden sm:block" src="/assets/LogoStacoll-Text.png" alt="STACOLL" />
                </Link>

                <div className="flex items-center gap-5">
                    {/* Profile Button & Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer focus:outline-none transition-transform hover:scale-105 border-2 border-greenui"
                        >
                            <img src={user?.imgUrl || "/profiles/default.jpg"} alt="User Avatar" className="w-full h-full object-cover" />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-[55px] right-0 bg-surface w-[280px] rounded-xl shadow-xl p-5 text-center z-50 border border-border-subtle transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
                                
                                <div className="flex justify-center mb-3">
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block w-20 h-20 rounded-full border-2 border-greenui overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
                                    >
                                        <img
                                            src={user?.imgUrl || "/profiles/default.jpg"}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </Link>
                                </div>

                                <h3 className="text-lg font-bold mb-1 text-text-main transition-colors">{user?.username || "Guest User"}</h3>
                                <p className="text-xs mb-5 text-text-muted transition-colors">{user?.email || "No email provided"}</p>

                                <ul className="list-none p-0 m-0">
                                    <li className="border-t border-border-subtle transition-colors pt-2">
                                        <Link 
                                            href="/profile" 
                                            className="block py-3 font-medium text-sm text-text-main hover:bg-surface-hover rounded-lg transition-all"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link 
                                            href="/settings" 
                                            className="block py-3 font-medium text-sm text-text-main hover:bg-surface-hover rounded-lg transition-all"
                                            onClick={() => setIsDropdownOpen(false)}
                                        >
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full block py-3 font-medium text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all text-center cursor-pointer"
                                        >
                                            Log out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}