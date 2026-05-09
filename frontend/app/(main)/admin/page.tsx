"use client";

const AdminPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-700 max-w-3xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Secure area. You have full administrative privileges.</p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-[#19c3af] transition-colors cursor-pointer">
            <h3 className="font-bold text-white mb-2">Users</h3>
            <p className="text-sm text-gray-400">Manage all users.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-[#19c3af] transition-colors cursor-pointer">
            <h3 className="font-bold text-white mb-2">Settings</h3>
            <p className="text-sm text-gray-400">System configuration.</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 hover:border-[#19c3af] transition-colors cursor-pointer">
            <h3 className="font-bold text-white mb-2">Logs</h3>
            <p className="text-sm text-gray-400">View system logs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
