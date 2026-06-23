import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path if needed

const Header = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sb-topnav navbar navbar-expand navbar-light bg-white border-bottom shadow-sm">
      <Link className="navbar-brand ps-3 fw-bold text-success" to="/admin">
        PureBite
      </Link>
      <button
        className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0"
        id="sidebarToggle"
        onClick={toggleSidebar}
      >
        <i className="fas fa-bars"></i>
      </button>

      <ul className="navbar-nav ms-auto me-1"> {/* Add ms-auto to push items to the right */}
        <li className="nav-item dropdown">
          <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            <i className="fas fa-user fa-fw"></i>
          </a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <Link className="dropdown-item" to="/admin/my-profile">
                Settings
              </Link>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
