import { BrowserRouter, Route, Routes } from "react-router-dom";
import { EventListPage } from "./pages/EventListPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { HostDashboardPage } from "./pages/HostDashboardPage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventListPage />} />
        <Route path="/eventlist" element={<EventListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/host" element={<HostDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}