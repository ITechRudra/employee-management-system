const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// GET    /api/employees       - Get all employees
// POST   /api/employees       - Create a new employee
router.route("/").get(getAllEmployees).post(createEmployee);

// PUT    /api/employees/:id   - Update an employee
// DELETE /api/employees/:id   - Delete an employee
router.route("/:id").put(updateEmployee).delete(deleteEmployee);

module.exports = router;
