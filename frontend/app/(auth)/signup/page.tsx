import Navigation from "@/components/layouts/navigation"
import Footer from "@/components/layouts/footer"
import Link from "next/link"

const page = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Sign Up Card */}
          <div className="bg-[#19c3af] w-full rounded-[2rem] p-10 shadow-xl flex flex-col items-center">
            <h1 className="text-white text-4xl font-bold mb-8">Sign Up</h1>
            
            <form className="w-full flex flex-col gap-4">
              {/* Username Input */}
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />
              
              {/* Email Input */}
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Password Input */}
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Confirm Password Input */}
              <input 
                type="password" 
                placeholder="Confirm password" 
                className="w-full px-6 py-4 rounded-full text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
              />

              {/* Submit Button */}
              <button 
                type="submit"
                className="mt-4 w-[180px] mx-auto bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold py-3.5 rounded-full shadow-lg transform active:scale-95 transition-all duration-200 tracking-wide"
              >
                SUBMIT
              </button>
            </form>
          </div>

          <div className="mt-8 text-center flex flex-col items-center">
            <p className="text-[#0088cc] text-sm mb-1">Already have an account?</p>
            <Link href="/signin" className="text-[#0088cc] text-sm font-medium hover:underline flex items-center gap-1 opacity-90">
            <span className="font-bold text-lg">Sign In</span>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}

export default page