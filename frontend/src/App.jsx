import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DoctorsDisplayPage from './pages/doctor/DoctorsDisplayPage.jsx';
import DoctorAvailableSlotsPage from './pages/doctor/DoctorAvailableSlotsPage.jsx';
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import {AuthProvider} from "./auth/AuthContext.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import UserSubscriptions from "./components/subscription/UserSubscriptions.jsx";

function App() {
  return (
      <AuthProvider>
        <Router>
             <Navbar />
          <Routes>
              <Route path="/" element={<DoctorsDisplayPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/doctors/:id/slots" element={<DoctorAvailableSlotsPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/subs" element={<UserSubscriptions />}></Route>
          </Routes>
        </Router>
       </AuthProvider>
  );
}

export default App;