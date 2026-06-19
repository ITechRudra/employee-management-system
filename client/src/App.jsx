import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Tasks from "./pages/Tasks";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        {/* Sticky top navigation */}
        <Navbar />

        {/* Main content */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/tasks" element={<Tasks />} />
            {/* Fallback */}
            <Route
              path="*"
              element={
                <div className="container py-5 text-center">
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
                  <h2 className="mb-2">Page Not Found</h2>
                  <p className="text-muted mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <a href="/" className="btn btn-primary">
                    ← Back to Dashboard
                  </a>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <span>© {new Date().getFullYear()} Employee Management System</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
