import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { employeeAPI, taskAPI } from "../services/api";

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [empRes, taskRes] = await Promise.all([
        employeeAPI.getAll(),
        taskAPI.getAll(),
      ]);
      setEmployees(empRes.data.data || []);
      setTasks(taskRes.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = employees.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Department counts
  const departmentMap = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});
  const departments = Object.entries(departmentMap).sort((a, b) => b[1] - a[1]);

  // Recent employees (last 5)
  const recentEmployees = [...employees].slice(0, 5);

  // Recent tasks (last 5)
  const recentTasks = [...tasks].slice(0, 5);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const statCards = [
    {
      label: "Total Employees",
      value: totalEmployees,
      icon: "👥",
      colorClass: "blue",
      meta: `${departments.length} department${departments.length !== 1 ? "s" : ""}`,
      link: "/employees",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: "📋",
      colorClass: "purple",
      meta: `${completionRate}% completion rate`,
      link: "/tasks",
    },
    {
      label: "Completed Tasks",
      value: completedTasks,
      icon: "✅",
      colorClass: "green",
      meta: totalTasks > 0 ? `of ${totalTasks} total tasks` : "No tasks yet",
      link: "/tasks",
    },
    {
      label: "Pending Tasks",
      value: pendingTasks,
      icon: "⏳",
      colorClass: "orange",
      meta: totalTasks > 0 ? `awaiting completion` : "No tasks yet",
      link: "/tasks",
    },
  ];

  if (loading) {
    return (
      <div className="container dashboard-page">
        <div className="loading-overlay">
          <div className="spinner-border" role="status" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container dashboard-page page-wrapper">
      {/* Welcome Banner */}
      <div className="welcome-banner fade-in-up">
        <h1 className="welcome-title">Welcome back! 👋</h1>
        <p className="welcome-subtitle">
          Here's what's happening in your organization today.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <Link
            to={card.link}
            key={card.label}
            className="text-decoration-none"
          >
            <div className={`stat-card stat-card-${card.colorClass} fade-in-up`}>
              <div className={`stat-icon stat-icon-${card.colorClass}`}>
                {card.icon}
              </div>
              <div className="stat-content">
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-meta">{card.meta}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Progress & Overview Row */}
      <div className="row g-3 mb-3">
        {/* Task Completion Progress */}
        <div className="col-lg-4">
          <div className="overview-card h-100">
            <div className="overview-card-header">
              <h6 className="overview-card-title">
                <span>📈</span> Task Progress
              </h6>
            </div>
            <div className="card-body">
              {totalTasks === 0 ? (
                <div className="empty-state" style={{ padding: "1.5rem 0" }}>
                  <div className="empty-state-icon">📋</div>
                  <p className="empty-state-text">No tasks assigned yet.</p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <div className="progress-label">
                      <span>Completed</span>
                      <span className="fw-semibold text-success">
                        {completedTasks} / {totalTasks}
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${completionRate}%` }}
                        aria-valuenow={completionRate}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="progress-label">
                      <span>Pending</span>
                      <span className="fw-semibold text-warning">
                        {pendingTasks} / {totalTasks}
                      </span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{
                          width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <span
                      style={{
                        fontSize: "2.25rem",
                        fontWeight: 700,
                        color: completionRate >= 70 ? "var(--success)" : "var(--warning)",
                      }}
                    >
                      {completionRate}%
                    </span>
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                    >
                      overall completion
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="col-lg-4">
          <div className="overview-card h-100">
            <div className="overview-card-header">
              <h6 className="overview-card-title">
                <span>🏬</span> Departments
              </h6>
              <Link to="/employees" className="btn btn-sm btn-outline-primary">
                View all
              </Link>
            </div>
            <div className="card-body p-0">
              {departments.length === 0 ? (
                <div className="empty-state" style={{ padding: "1.5rem" }}>
                  <div className="empty-state-icon">🏬</div>
                  <p className="empty-state-text">No departments yet.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {departments.slice(0, 6).map(([dept, count]) => (
                    <li
                      key={dept}
                      className="list-group-item d-flex align-items-center justify-content-between px-3 py-2"
                    >
                      <span
                        style={{ fontSize: "0.9rem", color: "var(--dark)" }}
                      >
                        {dept}
                      </span>
                      <span className="badge bg-primary rounded-pill">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="col-lg-4">
          <div className="overview-card h-100">
            <div className="overview-card-header">
              <h6 className="overview-card-title">
                <span>🕐</span> Recent Tasks
              </h6>
              <Link to="/tasks" className="btn btn-sm btn-outline-primary">
                View all
              </Link>
            </div>
            <div className="card-body p-0">
              {recentTasks.length === 0 ? (
                <div className="empty-state" style={{ padding: "1.5rem" }}>
                  <div className="empty-state-icon">📋</div>
                  <p className="empty-state-text">No tasks yet.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {recentTasks.map((task) => (
                    <li
                      key={task._id}
                      className="list-group-item px-3 py-2"
                    >
                      <div className="d-flex align-items-start gap-2">
                        <span style={{ marginTop: "2px" }}>
                          {task.status === "Completed" ? "✅" : "⏳"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              color: "var(--dark)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {task.title}
                          </div>
                          <div
                            style={{ fontSize: "0.775rem", color: "var(--secondary)" }}
                          >
                            {task.employeeId?.name || "Unassigned"}
                          </div>
                        </div>
                        <span
                          className={`badge ${task.status === "Completed" ? "badge-completed" : "badge-pending"}`}
                          style={{ fontSize: "0.7rem", flexShrink: 0 }}
                        >
                          {task.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="overview-section">
        <div className="overview-card">
          <div className="overview-card-header">
            <h6 className="overview-card-title">
              <span>👥</span> Recent Employees
            </h6>
            <Link to="/employees" className="btn btn-sm btn-outline-primary">
              View all employees
            </Link>
          </div>
          {recentEmployees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p className="empty-state-text">No employees added yet.</p>
              <Link to="/employees" className="btn btn-primary btn-sm mt-2">
                + Add First Employee
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover overview-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEmployees.map((emp) => {
                    const empTasks = tasks.filter(
                      (t) => t.employeeId?._id === emp._id
                    );
                    const empCompleted = empTasks.filter(
                      (t) => t.status === "Completed"
                    ).length;
                    return (
                      <tr key={emp._id}>
                        <td>
                          <div className="employee-name-cell">
                            <div className="employee-avatar">
                              {getInitials(emp.name)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{emp.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: "var(--secondary)" }}>
                            {emp.email}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {emp.department}
                          </span>
                        </td>
                        <td>{emp.designation}</td>
                        <td>
                          <span style={{ fontSize: "0.875rem" }}>
                            {empCompleted}/{empTasks.length} done
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
