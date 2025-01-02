import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebarStore } from '../../store/sidebarStore';
import {
  LayoutDashboard, 
  Thermometer, 
  Radio, 
  Settings,
  PieChart,
  Map,
  Users,
  Bell
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Sensors', href: '/sensors', icon: Thermometer },
  { name: 'Alarms', href: '/alarms', icon: Bell },
  { name: 'Base Units', href: '/base-units', icon: Radio },
  { name: 'Zones', href: '/zones', icon: Map },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const { isOpen, close } = useSidebarStore();

  const handleLinkClick = () => {
    close(); // Close sidebar when a link is clicked
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-20" onClick={close} />}
      <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-800 dark:bg-gray-900 transform transition-transform duration-200 ease-in-out`}>
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={`${
                  isActive
                    ? 'bg-gray-900 dark:bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <Icon className="mr-3 h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      </div>
    </>
  );
}