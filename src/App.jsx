import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import Profile from './pages/Profile';
import SearchHistory from './pages/SearchHistory';
import ReportsPage from './pages/ReportsPage';
import PlansPage from './pages/PlansPage';
import './index.css';

import { Toaster } from 'sonner';

// Layout with Sidebar
function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-background flex">
            <Toaster position="top-right" richColors closeButton />
            <Sidebar />
            <div className="flex-1 pl-64 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Home />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <Profile />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <SearchHistory />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/relatorios"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <ReportsPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/planos"
                    element={
                        <ProtectedRoute>
                            <AppLayout>
                                <PlansPage />
                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

