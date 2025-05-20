// Admin Sidebar with Employee-style Design
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiMessageSquare,
  FiBriefcase,
  FiUserPlus,
  FiFileText
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', icon: <FiHome />, path: '/admin/dashboard' },
  { name: 'Gérer RH', icon: <FiUserCheck />, path: '/admin/manage-rh' },
  { name: 'Gérer Employés', icon: <FiUsers />, path: '/admin/manage-employees' },
  { name: 'Demandes de Congé', icon: <FiCalendar />, path: '/admin/leave-requests' },
  { name: 'Justificatifs d\'Absence', icon: <FiFileText />, path: '/admin/absence-justifications' },
  { name: 'Réclamations', icon: <FiMessageSquare />, path: '/admin/complaint-reviews' },
];

const SidebarAdmin = () => {
  const location = useLocation();
  const { isCollapsed } = useSidebar();

  return (
    <aside className={`bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-30 transition-all duration-500 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            {!isCollapsed && <h2 className="text-xl font-semibold text-gray-800">Admin</h2>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {React.cloneElement(item.icon, {
                  className: `h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`,
                })}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FiUserPlus className="h-4 w-4 text-blue-600" />
            </div>
            {!isCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin Panel</p>
                <p className="text-xs text-gray-500">Version 1.0</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAdmin;