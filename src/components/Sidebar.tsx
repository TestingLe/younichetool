'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Video,
  Settings,
  LogOut,
  Menu,
  X,
  Youtube,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'videos', label: 'My Videos', icon: Video },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'ai', label: 'AI Generator', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-gray-700 bg-gray-900 p-2 lg:hidden"
      >
        <Menu className="h-6 w-6 text-white" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-800 bg-gray-900/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-r from-red-600 to-red-500 p-2">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">YT Stats</h1>
              <p className="text-xs text-gray-500">Analytics Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-red-600/20 to-red-500/10 text-red-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {activeTab === item.id && (
                <div className="ml-auto h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </nav>

        {session?.user && (
          <div className="border-t border-gray-800 p-4">
            <div className="mb-3 flex items-center gap-3">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-white">
                  {session.user.name}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
