// components/booking/BookingSidebarSection.tsx
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const BookingSidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            {icon}
          </div>
          {title}
        </h2>
        {isExpanded ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
      </div>
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 bg-white animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};