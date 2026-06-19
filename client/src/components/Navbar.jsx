import { NavLink, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    { to: "/", label: "Dashboard", icon: "📊" },
    { to: "/employees", label: "Employees", icon: "👥" },
    { to: "/tasks", label: "Tasks", icon: "✅" },
  ];

  return (
    <nav className="navbar navbar-expand-lg app-navbar">
      <div className="container">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand-wrapper">
          <div className="navbar-brand-icon">
            <span>🏢</span>
          </div>
          <div>
            <span className="navbar-brand-text">EMS</span>
            <span className="navbar-brand-subtitle">Employee Management</span>
          </div>
        </NavLink>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <li className="nav-item" key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `nav-link nav-link-custom ${isActive ? "active" : ""}`
                  }
                >
                  <span className="nav-link-icon">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
