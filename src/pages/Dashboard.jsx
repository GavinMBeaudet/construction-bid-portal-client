import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/projects">Projects</Link>
            {user?.userType === "Contractor" && <Link to="/bids">My Bids</Link>}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="dashboard-header">
          <h1>
            Welcome, {user?.firstName} {user?.lastName}!
          </h1>
          <p className="subtitle">
            Account Type: <strong>{user?.userType}</strong>
          </p>
        </div>

        <div className="dashboard-content">
          {user?.userType === "Owner" ? (
            <div className="dashboard-cards">
              <div className="card">
                <h3>Your Projects</h3>
                <p>
                  Manage your construction projects and review bids from
                  contractors.
                </p>
                <Link to="/projects" className="btn btn-primary">
                  View All Projects
                </Link>
              </div>

              <div className="card">
                <h3>Create New Project</h3>
                <p>
                  Post a new construction project to receive bids from
                  contractors.
                </p>
                <Link to="/projects/create" className="btn btn-primary">
                  Create Project
                </Link>
              </div>

              <div className="card">
                <h3>Recent Activity</h3>
                <p>Check recent bids and updates on your projects.</p>
                <Link to="/projects" className="btn btn-secondary">
                  View Activity
                </Link>
              </div>
            </div>
          ) : (
            <div className="dashboard-cards">
              <div className="card">
                <h3>Available Projects</h3>
                <p>Browse construction projects and submit your bids.</p>
                <Link to="/projects" className="btn btn-primary">
                  Browse Projects
                </Link>
              </div>

              <div className="card">
                <h3>Your Bids</h3>
                <p>Track all your submitted bids and their status.</p>
                <Link to="/bids" className="btn btn-primary">
                  View My Bids
                </Link>
              </div>

              <div className="card">
                <h3>Recent Projects</h3>
                <p>See the latest projects posted by property owners.</p>
                <Link to="/projects" className="btn btn-secondary">
                  View Latest
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-info">
          <div className="info-card">
            <h4>Account Information</h4>
            <dl>
              <dt>Name:</dt>
              <dd>
                {user?.firstName} {user?.lastName}
              </dd>
              <dt>Email:</dt>
              <dd>{user?.email}</dd>
              <dt>User Type:</dt>
              <dd>{user?.userType}</dd>
              <dt>Member Since:</dt>
              <dd>
                {user?.dateCreated
                  ? new Date(user.dateCreated).toLocaleDateString()
                  : "N/A"}
              </dd>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
