const Task = require("../models/Task");
const Employee = require("../models/Employee");

// @desc    Get all tasks (with employee info populated)
// @route   GET /api/tasks
// @access  Public
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("employeeId", "name email department designation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Public
const createTask = async (req, res) => {
  try {
    const { title, employeeId, status } = req.body;

    if (!title || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, employeeId",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found. Please select a valid employee.",
      });
    }

    const task = await Task.create({
      title,
      employeeId,
      status: status || "Pending",
    });

    const populatedTask = await Task.findById(task._id).populate(
      "employeeId",
      "name email department designation"
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// @desc    Update a task (title, employeeId, status)
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, employeeId, status } = req.body;

    if (!title || !employeeId || !status) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: title, employeeId, status",
      });
    }

    if (!["Pending", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either Pending or Completed",
      });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found. Please select a valid employee.",
      });
    }

    const task = await Task.findByIdAndUpdate(
      id,
      { title, employeeId, status },
      { new: true, runValidators: true }
    ).populate("employeeId", "name email department designation");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
