import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PROJECT_STATUS } from "../constants/status";
import { getOwnerProjectsWithStats } from "../services/apiService";

function OwnerDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    loadOwnerProjects();
  }, [user]);

  const loadOwnerProjects = async () => {
    try {
      setLoading(true);
      // Fetch projects with bid statistics in a single API call
      const projectsWithStats = await getOwnerProjectsWithStats(user.id);
      setProjects(projectsWithStats);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const totalBids = projects.reduce((sum, p) => sum + p.bidCount, 0);
  const activeProjects = projects.filter(
    (p) => p.status === PROJECT_STATUS.OPEN
  ).length;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
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
          <p className="subtitle">Owner Dashboard</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Statistics Summary */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{projects.length}</h3>
            <p>Total Projects</p>
          </div>
          <div className="stat-card">
            <h3>{totalBids}</h3>
            <p>Total Bids Received</p>
          </div>
          <div className="stat-card">
            <h3>{activeProjects}</h3>
            <p>Active Projects</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading your projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any projects yet.</p>
            <Link to="/projects/create" className="btn btn-primary">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="projects-overview">
            <h2>Your Projects</h2>
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-summary-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span
                      className={`status-badge status-${project.status.toLowerCase()}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="project-info">
                    <p className="project-location">{project.location}</p>
                    <p className="project-budget">
                      Budget: ${project.budget.toLocaleString()}
                    </p>
                  </div>

                  <div className="project-bid-stats">
                    <div className="bid-stat">
                      <strong>{project.bidCount}</strong>
                      <span>{project.bidCount === 1 ? "Bid" : "Bids"}</span>
                    </div>
                    {project.bidCount > 0 && (
                      <>
                        <div className="bid-stat">
                          <strong>${project.avgBid.toLocaleString()}</strong>
                          <span>Avg</span>
                        </div>
                        <div className="bid-stat">
                          <strong>${project.lowestBid.toLocaleString()}</strong>
                          <span>Low</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="project-actions">
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn btn-secondary"
                    >
                      View Details
                    </Link>
                    {project.bidCount > 0 && (
                      <Link
                        to={`/projects/${project.id}/bids`}
                        className="btn btn-primary"
                      >
                        Compare Bids
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

export default OwnerDashboard;
