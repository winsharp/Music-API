import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import BrowseCatalogPage from './pages/BrowseCatalogPage'
import ArtistPage from './pages/ArtistPage'
import ReleasePage from './pages/ReleasePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSectionPage from './pages/ProfileSectionPage'
import MyProfileRedirect from './pages/MyProfileRedirect'
import SettingsPage from './pages/SettingsPage'
import DiscogsCallbackPage from './pages/DiscogsCallbackPage'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import NavBar from './components/NavBar'
import { AuthProvider } from './contexts/AuthContext'

/**
 * Root component: sets up the router, wraps everything in `AuthProvider` so
 * `useAuth` works anywhere, renders the persistent `NavBar`, and declares
 * every route. `/login`/`/register` use `GuestRoute` (redirect away if
 * already logged in); profile/settings/Discogs-callback routes use
 * `ProtectedRoute` (redirect to `/login` if not).
 */
function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/browse" element={<BrowseCatalogPage />} />
          <Route path="/artist" element={<ArtistPage />} />
          <Route path="/release/:id" element={<ReleasePage />} />
          <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
          />
          <Route
              path="/register"
              element={
                <GuestRoute>
                  <RegisterPage />
                </GuestRoute>
              }
          />
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
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
          />
          <Route
              path="/profile/:username/:section"
              element={
                <ProtectedRoute>
                  <ProfileSectionPage />
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