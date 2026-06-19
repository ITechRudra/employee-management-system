import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);

// ─── Employee API ────────────────────────────────────────────────────────────

export const employeeAPI = {
  /**
   * Get all employees
   * GET /api/employees
   */
  getAll: () => api.get("/api/employees"),

  /**
   * Create a new employee
   * POST /api/employees
   */
  create: (data) => api.post("/api/employees", data),

  /**
   * Update an existing employee
   * PUT /api/employees/:id
   */
  update: (id, data) => api.put(`/api/employees/${id}`, data),

  /**
   * Delete an employee (also removes their tasks)
   * DELETE /api/employees/:id
   */
  delete: (id) => api.delete(`/api/employees/${id}`),
};

// ─── Task API ────────────────────────────────────────────────────────────────

export const taskAPI = {
  /**
   * Get all tasks with populated employee info
   * GET /api/tasks
   */
  getAll: () => api.get("/api/tasks"),

  /**
   * Create a new task
   * POST /api/tasks
   */
  create: (data) => api.post("/api/tasks", data),

  /**
   * Update an existing task
   * PUT /api/tasks/:id
   */
  update: (id, data) => api.put(`/api/tasks/${id}`, data),

  /**
   * Delete a task
   * DELETE /api/tasks/:id
   */
  delete: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;
