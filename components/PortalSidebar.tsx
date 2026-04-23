'use client';

import { PORTAL_SECTIONS, PortalSection } from '@/types/guest-portal';

interface PortalSidebarProps {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
}

const PortalSidebar = ({ activeSection, onSectionChange }: PortalSidebarProps) => {
  const sections: Array<{ key: PortalSection; label: string; icon: string; description: string }> = [
    { key: 'cleaning', ...PORTAL_SECTIONS.cleaning },
    { key: 'transport', ...PORTAL_SECTIONS.transport },
    { key: 'extend', ...PORTAL_SECTIONS.extend },
    { key: 'cancel', ...PORTAL_SECTIONS.cancel },
    { key: 'review', ...PORTAL_SECTIONS.review },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-orange-600 p-4">
          <h3 className="text-white font-bold text-lg">My Portal</h3>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={`w-full text-left px-6 py-4 border-l-4 transition-all duration-200 ${
                activeSection === section.key
                  ? 'bg-amber-50 border-amber-700 text-amber-900'
                  : 'border-transparent text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold">{section.label}</p>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Tab Strip */}
      <div className="md:hidden bg-white rounded-lg shadow-lg overflow-x-auto">
        <div className="flex gap-2 p-2 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => onSectionChange(section.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === section.key
                  ? 'bg-amber-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{section.icon}</span> {section.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default PortalSidebar;
