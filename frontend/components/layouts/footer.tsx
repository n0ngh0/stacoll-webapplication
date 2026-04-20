const footer = () => {
  return (
    <footer className="w-full px-[5%] max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center py-7 border-t border-[#eee] mt-auto gap-4">
      <div className="text-center sm:text-left">
        <h4 className="text-sm font-bold mb-1.5">Stacoll</h4>
        <p className="text-xs text-[#666666]">© 2026 Stacoll. All rights reserved.</p>
      </div>
      <div className="flex gap-5">
        <a href="#" className="text-xs text-[#666666] no-underline hover:text-[#19c3af] transition">Terms of Service</a>
        <a href="#" className="text-xs text-[#666666] no-underline hover:text-[#19c3af] transition">Privacy Policy</a>
      </div>
    </footer>
  )
}

export default footer