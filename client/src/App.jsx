import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateNovel from './pages/CreateNovel';
import NovelDetail from './pages/NovelDetail';
import Reader from './pages/Reader';
import Library from './pages/Library';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/novels/:id" element={<NovelDetail />} />
            <Route
              path="/novels/:id/read"
              element={<ProtectedRoute><Reader /></ProtectedRoute>}
            />
            <Route
              path="/create"
              element={<ProtectedRoute><CreateNovel /></ProtectedRoute>}
            />
            <Route
              path="/library"
              element={<ProtectedRoute><Library /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
