import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getProjects,
  getCategories,
  deleteProject,
} from "../services/apiService";
import ConfirmModal from "../components/ConfirmModal";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.userType === "Contractor") {
      loadCategories();
    }
    loadProjects();
  }, [user]);

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
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  const handleDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete);
      setProjects(projects.filter((p) => p.id !== projectToDelete));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setError("Failed to delete project");
      setShowDeleteModal(false);
      setProjectToDelete(null);
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

        {/* Category Filters - Only for Contractors */}
        {user?.userType === "Contractor" && categories.length > 0 && (
          <div className="filters-section">
            <h3>Filter by Category:</h3>
            <div className="category-filters">
              <select
                className="category-dropdown"
                value=""
                onChange={(e) => {
                  const categoryId = parseInt(e.target.value);
                  if (categoryId && !selectedCategories.includes(categoryId)) {
                    setSelectedCategories([...selectedCategories, categoryId]);
                  }
                }}
              >
                <option value="">+ Add Category Filter</option>
                {categories
                  .filter((cat) => !selectedCategories.includes(cat.id))
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <div className="selected-categories">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.id === catId);
                  return category ? (
                    <span key={catId} className="category-tag">
                      {category.name}
                      <button
                        className="remove-tag"
                        onClick={() => handleCategoryToggle(catId)}
                        aria-label={`Remove ${category.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>

              {selectedCategories.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="btn btn-secondary btn-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
            {selectedCategories.length > 0 && (
              <p className="filter-status">
                Showing projects in {selectedCategories.length} selected{" "}
                {selectedCategories.length === 1 ? "category" : "categories"}
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
            {projects
              .slice() // copy array
              .sort((a, b) => {
                if (user?.userType === "Owner") {
                  // Owner's projects first
                  if (a.ownerId === user.id && b.ownerId !== user.id) return -1;
                  if (a.ownerId !== user.id && b.ownerId === user.id) return 1;
                }
                return 0;
              })
              .map((project) => (
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
                      <strong>Budget:</strong> $
                      {project.budget.toLocaleString()}
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
                        to={`/bids/new/tennessee?projectId=${project.id}`}
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
      <ConfirmModal
        open={showDeleteModal}
        message="Are you sure you want to delete this project? This action cannot be undone."
        onConfirm={confirmDeleteProject}
        onCancel={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default Projects;
