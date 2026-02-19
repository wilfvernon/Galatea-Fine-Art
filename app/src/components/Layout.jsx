import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

function Layout() {
  const { signOut, user } = useAuth();
  const isAdmin = user?.email === 'admin@candlekeep.sc';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-title">Between the Lines</div>
        <div className="header-user">
          <span className="user-email">{user?.email?.split('@')[0]}</span>
          <button onClick={handleSignOut} className="sign-out-btn" title="Sign Out">
            ↪
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/character" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">⚔️</div>
          <div className="nav-label">Character</div>
        </NavLink>
        
        <NavLink to="/bookshelf" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">📚</div>
          <div className="nav-label">Bookshelf</div>
        </NavLink>
        
        <NavLink to="/galatea" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">🎨</div>
          <div className="nav-label">Galatea</div>
        </NavLink>
        
        <NavLink to="/notes" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div className="nav-icon">📝</div>
          <div className="nav-label">Notes</div>
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <div className="nav-icon">⚙️</div>
            <div className="nav-label">Admin</div>
          </NavLink>
        )}
      </nav>
    </div>
  );
}

export default Layout;
