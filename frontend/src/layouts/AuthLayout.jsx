import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F5F6F8] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[480px] shrink-0 bg-[#002C3B] flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#01516A]" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-[#609CB8]" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-[#01516A] flex items-center justify-center">
              <span className="text-white text-sm font-bold">CN</span>
            </div>
            <div>
              <p className="text-white text-lg font-semibold">Cubastion Nexus</p>
              <p className="text-[#609CB8] text-xs">Enterprise Support Platform</p>
            </div>
          </div>
          <h1 className="text-3xl font-light text-white leading-snug mb-4">
            Support that scales<br />
            <span className="text-[#A2CCE0]">with your business.</span>
          </h1>
          <p className="text-[#609CB8] text-sm leading-relaxed">
            Unified ticket management, SLA tracking, and enterprise-grade support operations for Cubastion clients.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-1 h-12 bg-[#01516A] rounded-full shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-medium">Cubastion Consulting K.K.</p>
              <p className="text-[#609CB8] text-xs mt-0.5">Tokyo, Japan — Enterprise Support Portal</p>
            </div>
          </div>
          <p className="text-[#3A6A7E] text-xs">© 2026 Cubastion Consulting. All rights reserved.</p>
        </div>
      </div>

      {/* Right content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#002C3B] flex items-center justify-center">
              <span className="text-white text-xs font-bold">CN</span>
            </div>
            <p className="text-[#0F0F0F] text-sm font-semibold">Cubastion Nexus</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
