import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <nav className='navbar'>
      <Link to='/feed' className='navbar-brand'>
        <span className='brand-icon'>🐾</span>
        <span className='brand-text'>PurrMatch</span>
      </Link>

      <div className='navbar-links'>
        <Link
          to='/feed'
          className={`nav-link ${location.pathname === '/feed' ? 'active' : ''}`}
        >
          <span className='nav-icon'>😻</span>
          <span>Feed</span>
        </Link>
        <Link
          to='/matches'
          className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}
        >
          <span className='nav-icon'>💕</span>
          <span>Matches</span>
        </Link>
        <Link
          to='/my-cats'
          className={`nav-link ${location.pathname === '/my-cats' ? 'active' : ''}`}
        >
          <span className='nav-icon'>🐱</span>
          <span>My Cats</span>
        </Link>
        <Link
          to='/transfers'
          className={`nav-link ${location.pathname === '/transfers' ? 'active' : ''}`}
        >
          <span className='nav-icon'>🔁</span>
          <span>Transfers</span>
        </Link>
        <Link
          to='/meetings/new'
          className={`nav-link ${location.pathname === '/meetings/new' ? 'active' : ''}`}
        >
          <span className='nav-icon'>📅</span>
          <span>Meet</span>
        </Link>
        {user.role === 'admin' && (
          <Link
            to='/admin/venues'
            className={`nav-link ${location.pathname === '/admin/venues' ? 'active' : ''}`}
          >
            <span className='nav-icon'>🏠</span>
            <span>Venues</span>
          </Link>
        )}
      </div>

      <div className='navbar-user'>
        <div className='user-badge'>
          <span className='user-avatar'>
            {user.email?.[0]?.toUpperCase() || 'U'}
          </span>
          <span className='user-role'>{user.role}</span>
        </div>
        <button className='btn-logout' onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
