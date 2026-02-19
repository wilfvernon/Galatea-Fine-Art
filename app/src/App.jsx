import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import CharacterSheet from './pages/CharacterSheet';
import Bookshelf from './pages/Bookshelf';
import GalateaFineArt from './pages/GalateaFineArt';
import Notes from './pages/Notes';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/character" replace />} />
            <Route path="character" element={<CharacterSheet />} />
            <Route path="bookshelf" element={<Bookshelf />} />
            <Route path="galatea" element={<GalateaFineArt />} />
            <Route path="notes" element={<Notes />} />
            <Route path="admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
