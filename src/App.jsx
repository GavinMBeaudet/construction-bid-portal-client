import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectBids from "./pages/ProjectBids";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import Bids from "./pages/Bids";
import EditBid from "./pages/EditBid";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <PrivateRoute>
                <ProjectDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id/bids"
            element={
              <PrivateRoute>
                <ProjectBids />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <PrivateRoute>
                <CreateProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/:id/edit"
            element={
              <PrivateRoute>
                <EditProject />
              </PrivateRoute>
            }
          />
          <Route
            path="/bids"
            element={
              <PrivateRoute>
                <Bids />
              </PrivateRoute>
            }
          />
          <Route
            path="/bids/:id/edit"
            element={
              <PrivateRoute>
                <EditBid />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
