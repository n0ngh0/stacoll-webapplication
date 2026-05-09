import Link from "next/link";

export default function PublicNav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm relative">
      <nav className="flex justify-between items-center py-4 px-[5%] max-w-[1200px] mx-auto w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-[#19c3af] no-underline">
          <img className="h-10 w-auto object-contain" src="/assets/LogoStacoll.png" alt="Logo" />
          <img className="h-6 w-auto object-contain hidden sm:block" src="/assets/LogoStacoll-Text.png" alt="STACOLL" />
        </Link>

        <div className="flex gap-2.5">
            <Link href="/signin" className="px-5 py-2 rounded-md font-semibold text-sm bg-transparent border border-[#333333] text-[#333333] hover:bg-gray-100 transition duration-300">
              Log In
            </Link>
            <Link href="/signup" className="px-5 py-2 rounded-md font-semibold text-sm bg-[#19c3af] border border-[#19c3af] text-white hover:bg-teal-500 transition duration-300">
              Sign Up
            </Link>
          </div>
      </nav>
    </header>
  );
}