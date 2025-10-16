# Construction Bid Portal Client

This is the frontend client for the Construction Bid Portal, built with React and Vite. It provides a user interface for contractors and project owners to manage construction projects, bids, and user authentication.

## Table of Contents
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Available Scripts](#available-scripts)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Routing](#routing)
- [Environment Variables](#environment-variables)
- [Build & Deployment](#build--deployment)

## Project Structure
```
index.html
package.json
vite.config.js
src/
  App.jsx
  index.css
  main.jsx
  components/
    ConfirmModal.jsx
    PrivateRoute.jsx
  constants/
    status.js
  contexts/
    AuthContext.jsx
  pages/
    Bids.jsx
    ContractorDashboard.jsx
    CreateProject.jsx
    Dashboard.jsx
    EditBid.jsx
    EditProject.jsx
    Landing.jsx
    Login.jsx
    OwnerDashboard.jsx
    ProjectBids.jsx
    ProjectDetail.jsx
    Projects.jsx
    Register.jsx
  services/
    apiService.js
    authService.js
```

## Tech Stack
- **React** (SPA framework)
- **Vite** (build tool)
- **JavaScript (ES6+)**
- **CSS**

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd construction-bid-portal-server/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build

## Key Components
- `App.jsx`: Main app component, sets up routing and context providers.
- `components/ConfirmModal.jsx`: Modal for confirming user actions.
- `components/PrivateRoute.jsx`: Route protection for authenticated pages.
- `contexts/AuthContext.jsx`: Provides authentication state and methods.
- `services/apiService.js`: Handles API requests to the backend.
- `services/authService.js`: Manages authentication logic (login, logout, token storage).

## API Integration
All API calls are managed through `apiService.js` and `authService.js`. Endpoints and base URLs should be configured as needed for your backend server.

## Authentication
Authentication state is managed via React Context (`AuthContext.jsx`). Protected routes use `PrivateRoute.jsx` to restrict access to authenticated users only.

## Routing
Routing is handled in `App.jsx` using React Router. Pages are located in the `src/pages/` directory.

## Build & Deployment
To build the project for production:
```bash
npm run build
```

---

For further technical details, refer to the source code and inline comments.
