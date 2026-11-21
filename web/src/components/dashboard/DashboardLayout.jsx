import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isChatPage = location.pathname.includes("/dashboard/chat");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* --- SIDEBAR (Left) --- */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* --- MAIN CONTENT AREA (Right) --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Scrollable Page Content */}
        <main
          className={`flex-1 min-h-0 ${
            isChatPage
              ? "p-2 sm:p-4 overflow-hidden flex flex-col"
              : "p-4 sm:p-6 lg:p-8 overflow-y-auto"
          }`}
        >
          <div
            className={`max-w-7xl mx-auto w-full ${
              isChatPage ? "h-full flex-1 flex flex-col min-h-0" : ""
            }`}
          >
            {/* This is where pages like 'StudentDashboard', 'MyCourses' will load */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
