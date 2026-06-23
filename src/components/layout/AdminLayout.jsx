import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  return (
    <div className="gd-admin-layout">
      <Sidebar />

      <div className="gd-admin-layout__main">
        <Topbar />

        <main className="gd-admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}