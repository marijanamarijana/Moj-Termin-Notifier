import { useAuth } from "../../auth/AuthContext";
import { Link } from "react-router-dom";

function Navbar() {
  const { user, handleLogout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link to="/" className="navbar-brand">
        Moj Termin Subscriber App
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          {user && (
            <li className="nav-item">
              <Link to="/subs" className="nav-link text-primary">My Subscriptions</Link>
            </li>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {!user ? (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Register</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <span className="nav-link">Hi, {user.username}!</span>
              </li>
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
