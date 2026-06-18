import { NavLink, Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  // Modern, sleek active state matching the Home page's minimal aesthetic
  const navLinkStyle = ({ isActive }) =>
    `flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive 
        ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/50" 
        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
    }`;

  return (
    <div className="min-h-screen bg-neutral-950 flex p-4 md:p-8 font-sans selection:bg-neutral-800">
      
      {/* Main Container Wrapper */}
      <div className="flex w-full max-w-[90rem] mx-auto border border-neutral-800 rounded-3xl overflow-hidden bg-[#0d0d0d] shadow-2xl shadow-black/50">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-800 flex flex-col p-5 bg-[#121212]">
          
          {/* Brand Logo (Consistent with Home Page) */}
          <div className="px-4 mb-6 mt-2">
            <h1 className="text-2xl font-bold tracking-tighter text-white">
              SyncUP<span className="text-neutral-600">.</span>
            </h1>
          </div>

          {/* Back to Home Button */}
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-neutral-500 hover:text-white transition-colors group"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5">
            <NavLink to="/dashboard/profile" className={navLinkStyle}>
              My Profile
            </NavLink>
            <NavLink to="/dashboard/my-teams" className={navLinkStyle}>
              My Teams
            </NavLink>
            <NavLink to="/dashboard/leadership" className={navLinkStyle}>
              Leadership
            </NavLink>
          </nav>
          
          <div className="flex-grow"></div> {/* Pushes Settings to bottom */}
          
          {/* Settings Link */}
          <nav className="flex flex-col mb-2">
            <NavLink to="/dashboard/settings" className={navLinkStyle}>
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </div>
            </NavLink>
          </nav>

        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 p-8 relative overflow-y-auto bg-[#0a0a0a]">
          <Outlet />
        </main>

      </div>
    </div>
  );
}