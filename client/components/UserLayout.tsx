import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface UserLayoutProps {
  children: ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
