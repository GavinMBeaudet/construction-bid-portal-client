import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Welcome to Construction Bid Portal</h1>
            <p className="subtitle">
              Connect property owners with qualified contractors for
              construction projects
            </p>

            <div className="features">
              <div className="feature-card">
                <h3>For Property Owners</h3>
                <ul>
                  <li>Post construction projects</li>
                  <li>Receive bids from contractors</li>
                  <li>Compare proposals</li>
                  <li>Choose the best contractor</li>
                </ul>
                {!user && (
                  <Link to="/register?type=owner" className="btn btn-primary">
                    Register as Owner
                  </Link>
                )}
              </div>

              <div className="feature-card">
                <h3>For Contractors</h3>
                <ul>
                  <li>Browse available projects</li>
                  <li>Submit competitive bids</li>
                  <li>Grow your business</li>
                  <li>Track your proposals</li>
                </ul>
                {!user && (
                  <Link
                    to="/register?type=contractor"
                    className="btn btn-primary"
                  >
                    Register as Contractor
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;
