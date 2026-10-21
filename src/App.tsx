import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'

import ExplorePage from './pages/ExplorePage'
import CheckPage from './pages/CheckPage'
import ReviewPage from './pages/ReviewPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

import './App.css'

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* Protected application */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/check"
          element={<CheckPage />}
        />

        <Route
          path="/explore"
          element={<ExplorePage />}
        />

        <Route
          path="/review"
          element={<ReviewPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/"
          element={
            <Navigate
              to="/check"
              replace
            />
          }
        />
      </Route>

      {/* Unknown URLs */}
      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  )
}