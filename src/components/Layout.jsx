import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DomainFilter from './DomainFilter';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const hasDomainFilter = location.pathname !== '/verify';

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900 font-['Public_Sans']">
      {/* Sidebar — fixed width column */}
      <Sidebar />

      {/* Main content column — flex-1 so it fills remaining width */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar — full width of this column */}
        <Topbar />

        {/* Domain filter bar (conditional) */}
        {hasDomainFilter && <DomainFilter />}

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
