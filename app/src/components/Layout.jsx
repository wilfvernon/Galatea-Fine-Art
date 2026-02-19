import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const navItems = [
  { to: '/character', icon: '⚔️', label: 'Character' },
  { to: '/bookshelf', icon: '📚', label: 'Bookshelf' },
  { to: '/galatea', icon: '🎨', label: 'Galatea' },
  { to: '/notes', icon: '📝', label: 'Notes' },
];

function Layout() {
  const { signOut, user } = useAuth();
  const isAdmin = user?.email === 'admin@candlekeep.sc';
  const renderedNavItems = isAdmin
    ? [...navItems, { to: '/admin', icon: '⚙️', label: 'Admin' }]
    : navItems;

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
          <button
            type="button"
            onClick={handleSignOut}
            className="sign-out-btn"
            title="Sign Out"
            aria-label="Sign out"
          >
            ↪
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {renderedNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <div className="nav-icon" aria-hidden="true">{item.icon}</div>
            <div className="nav-label">{item.label}</div>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
