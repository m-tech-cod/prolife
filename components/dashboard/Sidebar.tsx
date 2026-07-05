"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Archive,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Heart,
  User,
} from "lucide-react";

const menuItems = [
  { title: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, color: "#007A2F" },
  { title: "Membres", href: "/dashboard/members", icon: Users, color: "#007A2F" },
  { title: "Adhésions", href: "/dashboard/adhesions", icon: UserPlus, color: "#F2BE2E" },
  { title: "Archives", href: "/dashboard/archives", icon: Archive, color: "#9F2723" },
  { title: "Événements", href: "/dashboard/events", icon: Calendar, color: "#005A23" },
  { title: "Rapports", href: "/dashboard/reports", icon: FileText, color: "#D9A520" },
  { title: "Paramètres", href: "/dashboard/settings", icon: Settings, color: "#333333" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo avec animation */}
        <div className="p-6 border-b" style={{ backgroundColor: "#007A2F" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg animate-pulse">
              <img src="/images/logo.webp" alt="ProLife" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">ProLife</h1>
              <p className="text-white/70 text-xs">Community</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 group ${
                    active ? "bg-primary-green/10 text-primary-green" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                <item.icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? item.color : "#9CA3AF" }}
                />
                <span className={`font-medium ${active ? "font-semibold" : ""}`}>
                  {item.title}
                </span>
                {active && (
                  <div
                    className="ml-auto w-1.5 h-8 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
              onClick={async () => {
                const { createClient } = await import("@/lib/supabase/client");
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = "/auth/login";
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
            >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
          <div className="text-center mt-4">
            <Heart className="w-4 h-4 inline-block" style={{ color: "#9F2723" }} />
            <p className="text-xs text-gray-400 mt-1">Nous sommes pour la vie</p>
          </div>
        </div>
      </aside>
    </>
  );
}