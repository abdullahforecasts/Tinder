import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CatFeed from './pages/CatFeed';
import Matches from './pages/Matches';
import MyCats from './pages/MyCats';
import Transfers from './pages/Transfers';
import ScheduleMeeting from './pages/ScheduleMeeting';
import AdminVenues from './pages/admin/AdminVenues';

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Navigate to='/feed' replace />} />
        <Route
          path='/feed'
          element={
            <ProtectedRoute>
              <CatFeed />
            </ProtectedRoute>
          }
        />
        <Route
          path='/my-cats'
          element={
            <ProtectedRoute>
              <MyCats />
            </ProtectedRoute>
          }
        />
        <Route
          path='/transfers'
          element={
            <ProtectedRoute>
              <Transfers />
            </ProtectedRoute>
          }
        />
        <Route
          path='/matches'
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path='/meetings/new'
          element={
            <ProtectedRoute>
              <ScheduleMeeting />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/venues'
          element={
            <ProtectedRoute requiredRole='admin'>
              <AdminVenues />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/*' element={<AppLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
