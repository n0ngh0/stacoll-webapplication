import Navigation from "@/components/layouts/navigation"
import Footer from "@/components/layouts/footer"
import Link from "next/link"

const page = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-md flex flex-col items-center">

                {/* Login Card */}
                <div className="bg-[#19c3af] w-full rounded-3xl p-8 shadow-lg flex flex-col items-center relative">
                    <h1 className="text-white text-4xl font-bold mb-8 drop-shadow-md">Log In</h1>

                    <form className="w-full flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Username/Email"
                            className="w-full px-5 py-3.5 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-5 py-3.5 rounded-full text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />

                        <div className="text-right w-full mb-2">
                            <Link href="/forgot-password" className="text-white text-sm hover:underline font-medium">
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="w-[200px] mx-auto bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 tracking-wide"
                        >
                            LOG IN
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[#0088cc] text-sm mb-1">Don't have an account?</p>
                    <Link href="/signup" className="text-[#0088cc] text-lg font-bold hover:underline">
                        Sign Up
                    </Link>
                </div>

            </div>
        </main>
      <Footer />
    </div>
  )
}

export default page