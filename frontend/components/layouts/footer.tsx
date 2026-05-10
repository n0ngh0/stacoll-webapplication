export default function Footer() {
  return (
    <footer className="w-full px-[5%] max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center py-7 mt-auto gap-4 border-t border-border-subtle transition-colors duration-300">
      
      <div className="text-center sm:text-left">
        <h4 className="text-sm font-bold mb-1.5 text-text-main transition-colors duration-300">
          Stacoll
        </h4>
        <p className="text-xs text-text-muted transition-colors duration-300">
          © 2026 Stacoll. All rights reserved.
        </p>
      </div>

      <div className="flex gap-5">
        <a 
          href="#" 
          className="text-xs no-underline text-text-muted hover:text-greenui transition-colors duration-300"
        >
          Terms of Service
        </a>
        <a 
          href="#" 
          className="text-xs no-underline text-text-muted hover:text-greenui transition-colors duration-300"
        >
          Privacy Policy
        </a>
      </div>

    </footer>
  )
}