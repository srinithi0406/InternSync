import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import Reflections from "./pages/Reflections";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/auth" element={<Auth />} />

        <Route path="/dashboard" element={
          <AuthGuard><Dashboard /></AuthGuard>
        } />

        <Route path="/tasks" element={
          <AuthGuard><Tasks /></AuthGuard>
        } />

        <Route path="/reflections" element={
          <AuthGuard><Reflections /></AuthGuard>
        } />

        <Route path="/reports" element={
          <AuthGuard><Reports /></AuthGuard>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
