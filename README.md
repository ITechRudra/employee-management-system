# 🏢 Employee Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application for managing employees and their assigned tasks — built with a modern, professional UI using Bootstrap 5.

---

## 📸 Features

### Dashboard
- Overview stats: Total Employees, Total Tasks, Completed Tasks, Pending Tasks
- Task completion progress bars
- Department breakdown
- Recent employees and tasks at a glance

### Employees Module
- View all employees in a responsive table
- Add new employee (name, email, department, designation)
- Edit existing employee details
- Delete employee (cascades — also removes their tasks)
- Search by name, email, department, or designation

### Tasks Module
- View all tasks with assigned employee info
- Assign new tasks to employees
- Edit task title, assignee, and status
- One-click status toggle (Pending ↔ Completed) directly from the table
- Delete tasks
- Filter by status (All / Pending / Completed)
- Search by title or employee name

---

## 🛠 Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Frontend  | React 19, Vite, React Router DOM v6    |
| Styling   | Bootstrap 5.3, Custom CSS              |
| HTTP      | Axios                                  |
| Backend   | Node.js, Express.js                    |
| Database  | MongoDB, Mongoose                      |
| Config    | dotenv, cors                           |

---

## 📁 Project Structure

```
employee-management-system/
├── client/                        # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx         # Sticky responsive navbar
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Stats overview
│   │   │   ├── Employees.jsx      # Employee CRUD
│   │   │   └── Tasks.jsx          # Task CRUD
│   │   ├── services/
│   │   │   └── api.js             # Axios API layer
│   │   ├── App.jsx                # Router & layout
│   │   ├── App.css                # App-specific styles
│   │   ├── index.css              # Global styles & variables
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                        # Express backend
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── controllers/
    │   ├── employeeController.js  # Employee CRUD handlers
    │   └── taskController.js      # Task CRUD handlers
    ├── middleware/                 # (ready for auth middleware)
    ├── models/
    │   ├── Employee.js            # Mongoose Employee schema
    │   └── Task.js                # Mongoose Task schema
    ├── routes/
    │   ├── employeeRoutes.js      # Employee API routes
    │   └── taskRoutes.js          # Task API routes
    ├── server.js                  # Express entry point
    ├── .env.example
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) **or** a [MongoDB Atlas](https://www.mongodb.com/atlas) account
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system
```

---

### 2. Setup the Backend (Server)

```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee_management
```

> **MongoDB Atlas users:** Replace `MONGO_URI` with your Atlas connection string, e.g.:
> ```env
> MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/employee_management?retryWrites=true&w=majority
> ```

Start the backend server:
```bash
# Development (with auto-restart via nodemon)
npm run dev

# Production
npm start
```

The server will run at **http://localhost:5000**

---

### 3. Setup the Frontend (Client)

Open a new terminal:

```bash
cd client
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The app will open at **http://localhost:3000**

---

### 4. Run Both Simultaneously (recommended)

Using two terminal windows/tabs:

**Terminal 1 — Backend:**
```bash
cd employee-management-system/server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd employee-management-system/client
npm run dev
```

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### Employees

| Method | Endpoint               | Description           |
|--------|------------------------|-----------------------|
| GET    | `/employees`           | Get all employees     |
| POST   | `/employees`           | Create employee       |
| PUT    | `/employees/:id`       | Update employee       |
| DELETE | `/employees/:id`       | Delete employee       |

**Employee Object:**
```json
{
  "_id": "664abc...",
  "name": "Sarah Johnson",
  "email": "sarah@company.com",
  "department": "Engineering",
  "designation": "Senior Engineer",
  "createdAt": "2024-06-01T...",
  "updatedAt": "2024-06-01T..."
}
```

### Tasks

| Method | Endpoint         | Description       |
|--------|------------------|-------------------|
| GET    | `/tasks`         | Get all tasks     |
| POST   | `/tasks`         | Create task       |
| PUT    | `/tasks/:id`     | Update task       |
| DELETE | `/tasks/:id`     | Delete task       |

**Task Object:**
```json
{
  "_id": "664def...",
  "title": "Complete Q3 performance review",
  "employeeId": {
    "_id": "664abc...",
    "name": "Sarah Johnson",
    "email": "sarah@company.com",
    "department": "Engineering",
    "designation": "Senior Engineer"
  },
  "status": "Pending",
  "createdAt": "2024-06-01T...",
  "updatedAt": "2024-06-01T..."
}
```

---

## 🗄 MongoDB Setup

### Option A — Local MongoDB

1. [Download and install MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # macOS/Linux
   mongod

   # Windows (run as Administrator)
   net start MongoDB
   ```
3. Use this in your `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/employee_management
   ```

### Option B — MongoDB Atlas (Cloud)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new **Free Tier** cluster
3. Under **Database Access**, create a database user
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for anywhere)
5. Click **Connect → Drivers** and copy your connection string
6. Use it in your `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/employee_management
   ```

The database and collections are created automatically when you first insert data.

---

## 📦 Build for Production

### Frontend build:
```bash
cd client
npm run build
```
The optimized output goes to `client/dist/`.

### Serve the build:
```bash
npm run preview
```

---

## 🔧 Git Commands

```bash
# Initialize a new repo
git init
git add .
git commit -m "Initial commit: Employee Management System"

# Connect to GitHub
git remote add origin https://github.com/your-username/employee-management-system.git
git branch -M main
git push -u origin main

# Future commits
git add .
git commit -m "your message here"
git push
```

---

## 🎨 Design Highlights

- **Sticky gradient navbar** with active route highlighting
- **Stat cards** with color-coded top borders and hover lift effects
- **Avatar initials** auto-generated from employee names
- **Click-to-toggle status** badges directly in the task table
- **Cascade delete** — removing an employee also removes all their tasks
- **Search + filter** on both Employees and Tasks pages
- **Responsive** — works on mobile, tablet, and desktop
- **Loading spinners** and **success/error alerts** with auto-dismiss

---

## 📝 Available Scripts

### Server (`/server`)
| Command         | Description                     |
|-----------------|---------------------------------|
| `npm run dev`   | Start with nodemon (auto-restart)|
| `npm start`     | Start without nodemon           |

### Client (`/client`)
| Command          | Description                   |
|------------------|-------------------------------|
| `npm run dev`    | Start Vite dev server          |
| `npm run build`  | Build for production           |
| `npm run preview`| Preview production build       |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using the MERN stack*
