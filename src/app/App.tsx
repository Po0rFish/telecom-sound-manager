import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../shared/layout/AppLayout';
import  SoundsPage  from '../features/sounds/pages/SoundsPage';
import SoundFormPage  from '../features/sounds/pages/SoundFormPage';
import  OwnersPage  from '../features/owners/pages/OwnersPage';
import AppSnackbar from '../shared/ui/AppSnackbar';
import DashboardPage from '../features/dashboard/pages/DashboardPage';

export default function App() {
  return (
    <>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sounds" element={<SoundsPage />} />
        <Route path="/sounds/:id" element={<SoundFormPage />} />
        <Route path="/sounds/:id/edit" element={<SoundFormPage />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="*" element={<Navigate to="/sounds" replace />} />
      </Route>
    </Routes>
    <AppSnackbar />
    </>
  );
}
