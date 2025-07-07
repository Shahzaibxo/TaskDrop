import React, { useState } from 'react';
import { LogOut, Settings, User, Bell, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
        </div>

        <div className="flex items-center space-x-4">

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;