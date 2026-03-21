import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GuestLayout } from './layouts/GuestLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { StaffLayout } from './layouts/StaffLayout';

// Pages
import { QRLanding } from './pages/QRLanding';
import { GuestHome } from './pages/GuestHome';
import { GuestServices } from './pages/GuestServices';
import { GuestCart } from './pages/GuestCart';
import { GuestChat } from './pages/GuestChat';
import { GuestAmenities } from './pages/GuestAmenities';
import { RoomManagement } from './pages/RoomManagement';
import { StaffTasks } from './pages/StaffTasks';
import { AdminOverview } from './pages/AdminOverview';
import { Analytics } from './pages/Analytics';
import { CustomerLogin } from './pages/CustomerLogin';
import { AdminLogin } from './pages/AdminLogin';
import { Maintenance } from './pages/Maintenance';
import { Settings } from './pages/Settings';
import { CRM } from './pages/CRM';
import { Performance } from './pages/Performance';
import { StaffProfile } from './pages/StaffProfile';
import { AdminChat } from './pages/AdminChat';
import StaffManagement from './pages/StaffManagement';
import { StaffRegistration } from './pages/StaffRegistration';
import { LiveRequests } from './pages/LiveRequests';
import { StaffTeam } from './pages/StaffTeam';

const AdminRoute = ({ children }) => {
  const staff = JSON.parse(localStorage.getItem('staff'));
  const token = localStorage.getItem('staff_token');
  if (!staff || !token || staff.role !== 'Admin') {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

const StaffRoute = ({ children }) => {
  const staff = JSON.parse(localStorage.getItem('staff'));
  const token = localStorage.getItem('staff_token');
  if (!staff || !token) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/welcome/:roomId" element={<QRLanding />} />

        {/* Guest Routes */}
        <Route path="/guest" element={<GuestLayout />}>
          <Route index element={<GuestHome />} />
          <Route path="services" element={<GuestServices />} />
          <Route path="cart" element={<GuestCart />} />
          <Route path="chat" element={<GuestChat />} />
          <Route path="amenities" element={<GuestAmenities />} />
          <Route path="profile" element={<div className="p-12 text-center text-slate-400 font-bold">Profile Coming Soon</div>} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
          <Route index element={<StaffTasks />} />
          <Route path="team" element={<StaffTeam />} />
          <Route path="performance" element={<Performance />} />
          <Route path="profile" element={<StaffProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="requests" element={<LiveRequests />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/register" element={<StaffRegistration />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="crm" element={<CRM />} />
          <Route path="messages" element={<AdminChat />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
