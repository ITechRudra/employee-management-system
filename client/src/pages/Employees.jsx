import { useState, useEffect, useRef } from "react";
import { employeeAPI } from "../services/api";

const INITIAL_FORM = {
  name: "",
  email: "",
  department: "",
  designation: "",
};

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Customer Support",
  "Legal",
  "Data & Analytics",
  "DevOps",
];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const modalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Import Bootstrap modal dynamically
    const initModals = async () => {
      if (typeof window !== "undefined" && window.bootstrap) {
        modalRef.current = new window.bootstrap.Modal(
          document.getElementById("employeeModal")
        );
        deleteModalRef.current = new window.bootstrap.Modal(
          document.getElementById("deleteModal")
        );
      }
    };
    initModals();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await employeeAPI.getAll();
      setEmployees(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setFormError("");
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("employeeModal")
    );
    modal?.show();
  };

  const openEditModal = (emp) => {
    setFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
    });
    setEditingId(emp._id);
    setFormError("");
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("employeeModal")
    );
    modal?.show();
  };

  const closeModal = () => {
    const modal = window.bootstrap?.Modal.getInstance(
      document.getElementById("employeeModal")
    );
    modal?.hide();
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    const modal = window.bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("deleteModal")
    );
    modal?.show();
  };

  const closeDeleteModal = () => {
    const modal = window.bootstrap?.Modal.getInstance(
      document.getElementById("deleteModal")
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
    const { name, email, department, designation } = formData;
    if (!name.trim()) return "Employee name is required.";
    if (!email.trim()) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address.";
    if (!department.trim()) return "Department is required.";
    if (!designation.trim()) return "Designation is required.";
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
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
      };

      if (editingId) {
        await employeeAPI.update(editingId, payload);
        showSuccess("Employee updated successfully!");
      } else {
        await employeeAPI.create(payload);
        showSuccess("Employee added successfully!");
      }

      closeModal();
      await fetchEmployees();
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
      await employeeAPI.delete(deletingId);
      showSuccess("Employee deleted successfully!");
      closeDeleteModal();
      await fetchEmployees();
    } catch (err) {
      setError(err.message || "Failed to delete employee");
      closeDeleteModal();
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletingEmployee = employees.find((e) => e._id === deletingId);

  return (
    <div className="container employees-page page-wrapper">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">Employees</h1>
          <p className="section-subtitle">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}{" "}
            registered
          </p>
        </div>
        <button className="btn btn-primary btn-add-new" onClick={openAddModal}>
          <span>+</span> Add Employee
        </button>
      </div>

      {/* Success / Error alerts */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 fade-in" role="alert">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={fetchEmployees}
          >
            Retry
          </button>
        </div>
      )}

      {/* Search */}
      <div className="mb-3">
        <div className="input-group" style={{ maxWidth: 400 }}>
          <span className="input-group-text bg-white">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, department..."
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
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner-border" role="status" />
          <span>Loading employees...</span>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="empty-state" style={{ padding: "2rem 0" }}>
                        <div className="empty-state-icon">
                          {searchQuery ? "🔍" : "👥"}
                        </div>
                        <p className="empty-state-text">
                          {searchQuery
                            ? `No employees match "${searchQuery}"`
                            : "No employees yet. Add your first employee!"}
                        </p>
                        {!searchQuery && (
                          <button
                            className="btn btn-primary btn-sm mt-2"
                            onClick={openAddModal}
                          >
                            + Add Employee
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <tr key={emp._id} className="fade-in">
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
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(emp)}
                            title="Edit employee"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteModal(emp._id)}
                            title="Delete employee"
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
          {filteredEmployees.length > 0 && (
            <div className="table-count-info">
              Showing {filteredEmployees.length} of {employees.length} employee
              {employees.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      <div
        className="modal fade"
        id="employeeModal"
        tabIndex="-1"
        aria-labelledby="employeeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="employeeModalLabel">
                {editingId ? "✏️ Edit Employee" : "👤 Add New Employee"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={closeModal}
              />
            </div>
            <form onSubmit={handleSubmit} className="modal-form" noValidate>
              <div className="modal-body">
                {formError && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                    <span>⚠️</span>
                    <span style={{ fontSize: "0.875rem" }}>{formError}</span>
                  </div>
                )}

                <div className="row g-3">
                  {/* Name */}
                  <div className="col-12">
                    <label htmlFor="empName" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="empName"
                      name="name"
                      placeholder="e.g. Sarah Johnson"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label htmlFor="empEmail" className="form-label">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="empEmail"
                      name="email"
                      placeholder="e.g. sarah@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Department */}
                  <div className="col-md-6">
                    <label htmlFor="empDepartment" className="form-label">
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="empDepartment"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="col-md-6">
                    <label htmlFor="empDesignation" className="form-label">
                      Designation <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="empDesignation"
                      name="designation"
                      placeholder="e.g. Senior Engineer"
                      value={formData.designation}
                      onChange={handleChange}
                      required
                    />
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
                    "Add Employee"
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
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title" id="deleteModalLabel">
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
                  Delete{" "}
                  <strong>{deletingEmployee?.name || "this employee"}</strong>?
                </p>
                <p
                  className="text-muted"
                  style={{ fontSize: "0.875rem", margin: 0 }}
                >
                  This will also delete all their associated tasks. This action
                  cannot be undone.
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

export default Employees;
