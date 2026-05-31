import Link from "next/link";

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm bg-canvas/70 border-b border-border-subtle transition-colors duration-300">
      <nav className="flex justify-between items-center py-4 px-[5%] max-w-[1980px] mx-auto w-full">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold no-underline text-greenui">
          <img className="h-10 w-auto object-contain" src="/assets/LogoStacoll.png" alt="Logo" />
          <img className="h-6 w-auto object-contain hidden sm:block" src="/assets/LogoStacoll-Text.png" alt="STACOLL" />
        </Link>

        <div className="flex gap-2.5 items-center">
          {/* ปุ่ม Log In */}
          <Link 
            href="/signin" 
            className="px-5 py-2 rounded-md font-semibold text-sm bg-transparent border border-border-subtle text-text-main hover:bg-surface transition-all duration-300"
          >
            Log In
          </Link>
          
          {/* ปุ่ม Sign Up */}
          <Link 
            href="/signup" 
            className="px-5 py-2 rounded-md font-extrabold text-sm text-[#1a1a1a] bg-greenui hover:brightness-110 shadow-sm hover:shadow-md transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
        
      </nav>
    </header>
  );
}