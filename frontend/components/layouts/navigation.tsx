"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const Navigation = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
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
    // ลบข้อมูลทั้งหมดออกจากเครื่อง
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // อัปเดตหน้าจอให้กลับเป็นโหมดปกติ
    setIsLoggedIn(false);
    setUser(null);
    setIsDropdownOpen(false);
    
    // กลับไปหน้าแรก
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm relative">
      <header className="flex justify-between items-center py-4 px-[5%] max-w-[1200px] mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#19c3af] no-underline">
          <img className="h-10 w-auto object-contain" src="/assets/LogoStacoll.png" alt="Logo" />
          <img className="h-6 w-auto object-contain" src="/assets/LogoStacoll-Text.png" alt="STACOLL" />
        </Link>

        {isLoggedIn ? (
          // --- Nav เข้าสู่ระบบแล้ว ---
          <div className="flex items-center gap-5">
            <div className="hidden md:flex bg-[#f1f3f5] rounded-full px-4 py-2 items-center w-[250px]">
              <Search width={20} height={20} className="mr-2 text-gray-400" />
              <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-full" />
            </div>

            {/* Profile Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-[#19c3af] overflow-hidden cursor-pointer focus:outline-none transition-transform hover:scale-105"
              >
                <img src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" alt="User Avatar" className="w-full h-full object-cover" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-[55px] right-0 bg-white w-[280px] border-[3px] border-[#19c3af] rounded-xl shadow-xl p-5 text-center z-50">
                  <div className="w-20 h-20 rounded-full border-2 border-[#19c3af] overflow-hidden mx-auto mb-3">
                    <img src="https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#222] mb-1">{user?.username}</h3>
                  <p className="text-xs text-[#666] mb-5 underline">{user?.email}</p>
                  
                  <ul className="list-none p-0 m-0">
                    <li className="border-t border-[#eaeaea]">
                      <Link href="/user" className="block py-3 text-[#222] font-medium text-sm hover:text-[#19c3af] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        Profile / Dashboard
                      </Link>
                    </li>
                    <li className="border-t border-[#eaeaea]">
                      <Link href="/settings" className="block py-3 text-[#222] font-medium text-sm hover:text-[#19c3af] transition-colors" onClick={() => setIsDropdownOpen(false)}>
                        Setting
                      </Link>
                    </li>
                    <li className="border-t border-[#eaeaea]">
                      <button 
                        onClick={handleLogout}
                        className="w-full block py-3 text-red-500 font-medium text-sm hover:text-red-700 transition-colors text-center"
                      >
                        Log out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- Nav ยังไม่เข้าระบบ ---
          <div className="flex gap-2.5">
            <Link href="/signin" className="px-5 py-2 rounded-md font-semibold text-sm bg-transparent border border-[#333333] text-[#333333] hover:bg-gray-100 transition duration-300">
              Log In
            </Link>
            <Link href="/signup" className="px-5 py-2 rounded-md font-semibold text-sm bg-[#19c3af] border border-[#19c3af] text-white hover:bg-teal-500 transition duration-300">
              Sign Up
            </Link>
          </div>
        )}
      </header>
    </div>
  )
}

export default Navigation;