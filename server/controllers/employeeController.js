const Employee = require("../models/Employee");
const Task = require("../models/Task");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Public
const createEmployee = async (req, res) => {
  try {
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, department, designation",
      });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    const employee = await Employee.create({ name, email, department, designation });

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// @desc    Update an employee
// @route   PUT /api/employees/:id
// @access  Public
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, department, designation",
      });
    }

    const existingEmployee = await Employee.findOne({ email, _id: { $ne: id } });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Another employee with this email already exists",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      id,
      { name, email, department, designation },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Public
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // Delete all tasks associated with this employee
    await Task.deleteMany({ employeeId: id });

    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Employee and associated tasks deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
