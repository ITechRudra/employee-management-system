import { useState, useEffect } from "react";
import { taskAPI, employeeAPI } from "../services/api";

const INITIAL_FORM = {
  title: "",
  employeeId: "",
  status: "Pending",
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [taskRes, empRes] = await Promise.all([
        taskAPI.getAll(),
        employeeAPI.getAll(),
      ]);
      setTasks(taskRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setFormError("");
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("taskModal")
    );
    modal?.show();
  };

  const openEditModal = (task) => {
    setFormData({
      title: task.title,
      employeeId: task.employeeId?._id || task.employeeId || "",
      status: task.status,
    });
    setEditingId(task._id);
    setFormError("");
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("taskModal")
    );
    modal?.show();
  };

  const closeModal = () => {
    const modal = window.bootstrap?.Modal.getInstance(
      document.getElementById("taskModal")
    );
    modal?.hide();
    setFormError("");
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("taskDeleteModal")
    );
    modal?.show();
  };

  const closeDeleteModal = () => {
    const modal = window.bootstrap?.Modal.getInstance(
      document.getElementById("taskDeleteModal")
    );
    modal?.hide();
    setDeletingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const validateForm = () => {
    const { title, employeeId, status } = formData;
    if (!title.trim()) return "Task title is required.";
    if (!employeeId) return "Please assign this task to an employee.";
    if (!["Pending", "Completed"].includes(status))
      return "Status must be Pending or Completed.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      const payload = {
        title: formData.title.trim(),
        employeeId: formData.employeeId,
        status: formData.status,
      };

      if (editingId) {
        await taskAPI.update(editingId, payload);
        showSuccess("Task updated successfully!");
      } else {
        await taskAPI.create(payload);
        showSuccess("Task assigned successfully!");
      }

      closeModal();
      await fetchData();
    } catch (err) {
      setFormError(err.message || "Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await taskAPI.delete(deletingId);
      showSuccess("Task deleted successfully!");
      closeDeleteModal();
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to delete task");
      closeDeleteModal();
    } finally {
      setSubmitting(false);
    }
  };

  // Quick status toggle
  const handleQuickStatusToggle = async (task) => {
    const newStatus = task.status === "Pending" ? "Completed" : "Pending";
    try {
      await taskAPI.update(task._id, {
        title: task.title,
        employeeId: task.employeeId?._id || task.employeeId,
        status: newStatus,
      });
      showSuccess(`Task marked as ${newStatus}!`);
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to update task status");
    }
  };

  // Filtering & searching
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === "All" || task.status === filterStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.employeeId?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (task.employeeId?.department || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;

  const deletingTask = tasks.find((t) => t._id === deletingId);

  return (
    <div className="container tasks-page page-wrapper">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Tasks</h1>
          <p className="section-subtitle">
            {totalTasks} task{totalTasks !== 1 ? "s" : ""} &mdash;{" "}
            {completedCount} completed, {pendingCount} pending
          </p>
        </div>
        <button
          className="btn btn-primary btn-add-new"
          onClick={openAddModal}
          disabled={employees.length === 0}
          title={
            employees.length === 0
              ? "Add employees first before assigning tasks"
              : ""
          }
        >
          <span>+</span> Assign Task
        </button>
      </div>

      {/* Warning if no employees */}
      {!loading && employees.length === 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
          <span>⚠️</span>
          <span>
            No employees found. Please{" "}
            <a href="/employees" className="alert-link">
              add employees
            </a>{" "}
            before assigning tasks.
          </span>
        </div>
      )}

      {/* Success / Error */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 fade-in">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
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

      {/* Filters Row */}
      <div
        className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"
      >
        {/* Search */}
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks or employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter */}
        <div
          className="btn-group"
          role="group"
          aria-label="Filter by status"
        >
          {["All", "Pending", "Completed"].map((status) => (
            <button
              key={status}
              type="button"
              className={`btn btn-sm ${
                filterStatus === status
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status === "All" && `All (${totalTasks})`}
              {status === "Pending" && `⏳ Pending (${pendingCount})`}
              {status === "Completed" && `✅ Completed (${completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner-border" role="status" />
          <span>Loading tasks...</span>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task Title</th>
                  <th>Assigned To</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="empty-state-icon">
                          {searchQuery || filterStatus !== "All" ? "🔍" : "📋"}
                        </div>
                        <p className="empty-state-text">
                          {searchQuery
                            ? `No tasks match "${searchQuery}"`
                            : filterStatus !== "All"
                            ? `No ${filterStatus.toLowerCase()} tasks found`
                            : "No tasks yet. Assign your first task!"}
                        </p>
                        {!searchQuery && filterStatus === "All" && employees.length > 0 && (
                          <button
                            className="btn btn-primary btn-sm mt-2"
                            onClick={openAddModal}
                          >
                            + Assign Task
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => (
                    <tr key={task._id} className="fade-in">
                      <td>
                        <span
                          style={{
                            color: "var(--secondary)",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 500,
                            textDecoration:
                              task.status === "Completed"
                                ? "line-through"
                                : "none",
                            color:
                              task.status === "Completed"
                                ? "var(--secondary)"
                                : "var(--dark)",
                          }}
                        >
                          {task.title}
                        </span>
                      </td>
                      <td>
                        {task.employeeId ? (
                          <div className="employee-name-cell">
                            <div
                              className="employee-avatar"
                              style={{
                                width: 28,
                                height: 28,
                                fontSize: "0.7rem",
                              }}
                            >
                              {(task.employeeId.name || "?")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 500 }}>
                              {task.employeeId.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted fst-italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        {task.employeeId?.department ? (
                          <span className="badge bg-light text-dark border">
                            {task.employeeId.department}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`badge border-0 ${
                            task.status === "Completed"
                              ? "badge-completed"
                              : "badge-pending"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleQuickStatusToggle(task)}
                          title={`Click to mark as ${
                            task.status === "Completed" ? "Pending" : "Completed"
                          }`}
                        >
                          <span
                            className={`status-dot ${
                              task.status === "Completed"
                                ? "status-dot-completed"
                                : "status-dot-pending"
                            }`}
                          />
                          {task.status}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(task)}
                            title="Edit task"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteModal(task._id)}
                            title="Delete task"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredTasks.length > 0 && (
            <div className="table-count-info">
              Showing {filteredTasks.length} of {totalTasks} task
              {totalTasks !== 1 ? "s" : ""}
              {filterStatus !== "All" && ` — filtered by "${filterStatus}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      )}

      {/* Assign / Edit Task Modal */}
      <div
        className="modal fade"
        id="taskModal"
        tabIndex="-1"
        aria-labelledby="taskModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="taskModalLabel">
                {editingId ? "✏️ Edit Task" : "📋 Assign New Task"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeModal}
              />
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <span>⚠️</span>
                    <span style={{ fontSize: "0.875rem" }}>{formError}</span>
                  </div>
                )}

                <div className="row g-3">
                  {/* Task Title */}
                  <div className="col-12">
                    <label htmlFor="taskTitle" className="form-label">
                      Task Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="taskTitle"
                      name="title"
                      placeholder="e.g. Complete Q3 performance review"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Assign to Employee */}
                  <div className="col-12">
                    <label htmlFor="taskEmployee" className="form-label">
                      Assign To <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="taskEmployee"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select an employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} — {emp.department}
                        </option>
                      ))}
                    </select>
                    {employees.length === 0 && (
                      <div className="form-text text-warning">
                        ⚠️ No employees available. Please add employees first.
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-12">
                    <label className="form-label">
                      Status <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex gap-3">
                      {["Pending", "Completed"].map((statusOption) => (
                        <div className="form-check" key={statusOption}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name="status"
                            id={`status_${statusOption}`}
                            value={statusOption}
                            checked={formData.status === statusOption}
                            onChange={handleChange}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`status_${statusOption}`}
                          >
                            {statusOption === "Pending" ? "⏳" : "✅"}{" "}
                            {statusOption}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  data-bs-dismiss="modal"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Save Changes"
                  ) : (
                    "Assign Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="taskDeleteModal"
        tabIndex="-1"
        aria-labelledby="taskDeleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title" id="taskDeleteModalLabel">
                Confirm Delete
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeDeleteModal}
              />
            </div>
            <div className="modal-body pt-2">
              <div className="text-center mb-3">
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                  🗑️
                </div>
                <p className="mb-1" style={{ fontWeight: 500 }}>
                  Delete this task?
                </p>
                {deletingTask && (
                  <p
                    className="text-muted"
                    style={{ fontSize: "0.875rem", margin: "0.25rem 0 0.5rem" }}
                  >
                    "{deletingTask.title}"
                  </p>
                )}
                <p
                  className="text-muted"
                  style={{ fontSize: "0.8125rem", margin: 0 }}
                >
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={closeDeleteModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
