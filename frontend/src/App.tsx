import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from "./pages/Blogs";
import { Publish } from './pages/Publish';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes — redirect to /blogs if already logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
          </Route>

          {/* Protected routes — redirect to /signin if not logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/blog/:id" element={<Blog />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/publish" element={<Publish />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Catch-all: redirect to /blogs (ProtectedRoute will handle auth check) */}
          <Route path="*" element={<Navigate to="/blogs" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App