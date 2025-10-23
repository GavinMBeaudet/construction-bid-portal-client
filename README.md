# Construction Bid Portal Client (Technical Focus)

This directory contains the React frontend for the Construction Bid Portal. The frontend is designed for developers who prefer working with API integration, state management, and business logic.

## Technical Features

- API-driven architecture: communicates with ASP.NET Core backend via HTTP
- Auth flows and JWT token management handled in `src/services/authService.js`
- Data fetching and mutation via `src/services/apiService.js`
- State management using React Context in `src/contexts/`
- Routing and protected routes implemented with React Router and `src/components/PrivateRoute.jsx`
- Signature capture logic for bid awards (see relevant modal/component)

## Structure

- `src/pages/` — Main application pages (Dashboard, Projects, Bids, Forms)
- `src/components/` — Reusable logic-driven components
- `src/services/` — API and authentication service modules
- `src/contexts/` — React context providers for global state
- `src/constants/` — Status and configuration constants

## Developer Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Access at `http://localhost:3000`

## Technical Workflows

- Integrate new API endpoints by updating `apiService.js` and related pages/components
- Manage authentication and protected routes via context and `PrivateRoute.jsx`
- Use constants in `src/constants/` for status/config values

## Integration Points

- All data and auth flows are API-driven and decoupled from UI styling
- Frontend connects to backend at `/api` for all business logic

## Tips for Technical Developers

- Focus on API integration, state management, and business logic
- Ignore CSS and UI styling concerns
- Review code comments in `src/services/` and `src/contexts/` for implementation details

---

For more technical details, see the code in each folder and comments in the source files.
