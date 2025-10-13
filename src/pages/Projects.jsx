import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProjects, getCategories, deleteProject } from "../services/apiService";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadProjects();
  }, []);

  useEffect(() => {
    loadProjects();
  }, [selectedCategories]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects(selectedCategories);
      setProjects(data);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (err) {
      setError("Failed to delete project");
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="projects-page">
      <nav className="navbar">
        <div className="container">
          <h1 className="logo">Construction Bid Portal</h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/projects">Projects</Link>
            {user?.userType === "Contractor" && <Link to="/bids">My Bids</Link>}
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container">
        <div className="page-header">
          <h1>Construction Projects</h1>
          {user?.userType === "Owner" && (
            <Link to="/projects/create" className="btn btn-primary">
              + Create New Project
            </Link>
          )}
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="filters-section">
            <h3>Filter by Category:</h3>
            <div className="category-filters">
              {categories.map((category) => (
                <label key={category.id} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
              {selectedCategories.length > 0 && (
                <button 
                  onClick={handleClearFilters} 
                  className="btn btn-secondary btn-sm"
                >
                  Clear Filters
                </button>
              )}
            </div>
            {selectedCategories.length > 0 && (
              <p className="filter-status">
                Showing projects in {selectedCategories.length} selected {selectedCategories.length === 1 ? 'category' : 'categories'}
              </p>
            )}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects available yet.</p>
            {user?.userType === "Owner" && (
              <Link to="/projects/create" className="btn btn-primary">
                Create Your First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.title}</h3>
                  <span
                    className={`status-badge status-${project.status.toLowerCase()}`}
                  >
                    {project.status}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>
                <div className="project-details">
                  <div className="detail-item">
                    <strong>Location:</strong> {project.location}
                  </div>
                  <div className="detail-item">
                    <strong>Budget:</strong> ${project.budget.toLocaleString()}
                  </div>
                  <div className="detail-item">
                    <strong>Deadline:</strong>{" "}
                    {new Date(project.bidDeadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="project-actions">
                  <Link
                    to={`/projects/${project.id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                  {user?.userType === "Contractor" && (
                    <Link
                      to={`/projects/${project.id}#bid`}
                      className="btn btn-success"
                    >
                      Submit Bid
                    </Link>
                  )}
                  {user?.userType === "Owner" &&
                    user?.id === project.ownerId && (
                      <>
                        <Link
                          to={`/projects/${project.id}/edit`}
                          className="btn btn-secondary"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Projects;
