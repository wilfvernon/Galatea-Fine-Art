import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AdminRoute({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@candlekeep.sc';

  if (!isAdmin) {
    return <Navigate to="/character" replace />;
  }

  return children;
}

export default AdminRoute;
