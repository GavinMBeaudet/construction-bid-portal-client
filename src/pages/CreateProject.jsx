import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createProject, getCategories } from "../services/apiService";

function CreateProject() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    bidDeadline: "",
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const projectData = {
        ownerId: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        budget: parseFloat(formData.budget),
        bidDeadline: formData.bidDeadline + "T00:00:00",
        status: "Open",
        categoryIds: selectedCategories,
      };

      await createProject(projectData);
      navigate("/projects");
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="create-project-page">
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
        <div className="breadcrumb">
          <Link to="/projects">← Back to Projects</Link>
        </div>

        <div className="form-container">
          <h1>Create New Project</h1>
          <p className="subtitle">
            Post a construction project to receive bids from contractors
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Project Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Modern Office Complex"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Project Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Provide detailed information about the project scope, requirements, and specifications..."
                rows="6"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget ($) *</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500000"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bidDeadline">Bid Deadline *</label>
              <input
                type="date"
                id="bidDeadline"
                name="bidDeadline"
                value={formData.bidDeadline}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="form-group">
              <label>Project Categories</label>
              <p className="field-hint">
                Select one or more categories that best describe this project
              </p>
              <div className="category-selection">
                {categories.map((category) => (
                  <label key={category.id} className="category-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                    />
                    <span>{category.name}</span>
                    <small className="category-desc">{category.description}</small>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <Link to="/projects" className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateProject;
