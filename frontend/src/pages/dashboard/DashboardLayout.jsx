import { NavLink, Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const navLinkStyle = ({ isActive }) =>
    `flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
      isActive 
        ? "bg-green-500/10 text-green-400 shadow-sm border border-green-500/20" 
        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 border border-transparent"
    }`;

  return (
    <div className="min-h-screen bg-[#09090b] flex p-4 md:p-6 lg:p-8 font-sans selection:bg-green-500/30 selection:text-green-200 relative overflow-hidden">
      
      {/* Subtle Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/40 via-transparent to-transparent blur-3xl"></div>

      {/* Main Dashboard Container - Glassmorphism Effect */}
      <div className="relative z-10 flex w-full max-w-[90rem] mx-auto border border-neutral-800/60 rounded-[2rem] overflow-hidden bg-[#09090b]/80 backdrop-blur-2xl shadow-2xl shadow-black/80">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-800/60 flex flex-col p-6 bg-neutral-950/50">
          
          {/* Consistent Logo Area */}
          <div className="flex items-center gap-2 mb-10 mt-2 cursor-default">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-black font-bold text-lg leading-none">S</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              SyncUP<span className="text-green-500">.</span>
            </h1>
          </div>

          {/* Upgraded Back Button */}
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2.5 mb-8 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/50 rounded-xl transition-all group border border-transparent hover:border-neutral-800/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-2">
            <NavLink to="/dashboard/profile" className={navLinkStyle}>My Profile</NavLink>
            <NavLink to="/dashboard/my-teams" className={navLinkStyle}>My Teams</NavLink>
            <NavLink to="/dashboard/leadership" className={navLinkStyle}>Leadership</NavLink>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 md:p-10 relative overflow-y-auto bg-neutral-950/30 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}