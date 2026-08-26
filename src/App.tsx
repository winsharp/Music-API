import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import BrowseCatalogPage from './pages/BrowseCatalogPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import MyProfileRedirect from './pages/MyProfileRedirect'
import DiscogsCallbackPage from './pages/DiscogsCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import { AuthProvider } from './contexts/AuthContext'
import './App.css'

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/browse" element={<BrowseCatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyProfileRedirect />
                </ProtectedRoute>
              }
          />
          <Route
              path="/profile/:username"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
          />
          <Route
              path="/discogs/callback"
              element={
                <ProtectedRoute>
                  <DiscogsCallbackPage />
                </ProtectedRoute>
              }
          />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
  )
}

export default App