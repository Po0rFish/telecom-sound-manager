import { Navigate, Route, Routes } from "react-router-dom";
import SoundsPage from "./features/sounds/pages/SoundsPage";
import SoundForm from "./features/sounds/pages/SoundForm";
import AppSnackbar from "./features/ui/AppSnackbar";
import AppLayout from "./features/ui/AppLayout";
import OwnersPage from "./features/owners/pages/OwnersPage";
export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/sounds" replace />} />

        <Route path="/sounds" element={<SoundsPage />} />
        <Route path="/owners" element={<OwnersPage />} />
        <Route path="/sounds/:id" element={<SoundForm />} />

        <Route path="*" element={<Navigate to="/sounds" replace />} />

      </Routes>
      <AppSnackbar />
    </AppLayout>

  );
}