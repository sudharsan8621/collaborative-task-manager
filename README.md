# 🚀 Collaborative Task Manager

A full-stack, production-ready task management application built with modern technologies and best practices. Features real-time collaboration, user authentication, and comprehensive task management.

![Task Manager](https://img.shields.io/badge/Status-Production%20Ready-green)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Socket.io Events](#-socketio-events)
- [Database Schema](#-database-schema)
- [Architecture Overview](#-architecture-overview)
- [Design Decisions](#-design-decisions)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Trade-offs & Assumptions](#-trade-offs--assumptions)
- [Screenshots](#-screenshots)

---

## ✨ Features

### User Authentication & Authorization
- ✅ Secure user registration and login
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT-based authentication with HttpOnly cookies
- ✅ User profile management
- ✅ Password change functionality

### Task Management (CRUD)
- ✅ Create, Read, Update, Delete tasks
- ✅ Task attributes: title, description, due date, priority, status
- ✅ Priority levels: Low, Medium, High, Urgent
- ✅ Status options: To Do, In Progress, Review, Completed
- ✅ Task assignment to registered users
- ✅ Task creator and assignee tracking

### Real-Time Collaboration
- ✅ Live updates using Socket.io
- ✅ Instant task status/priority/assignee updates
- ✅ Real-time notifications when tasks are assigned
- ✅ Persistent in-app notifications

### User Dashboard
- ✅ Tasks assigned to current user
- ✅ Tasks created by current user
- ✅ Overdue tasks view
- ✅ Task statistics (by status and priority)

### Filtering & Sorting
- ✅ Filter by status and priority
- ✅ Sort by due date, created date, priority
- ✅ Search tasks by title/description
- ✅ Quick filters: assigned to me, created by me, overdue

### Additional Features
- ✅ Audit logging for task changes
- ✅ Responsive design (mobile-first)
- ✅ Skeleton loading states
- ✅ Form validation with Zod
- ✅ Error handling with meaningful messages

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| TanStack Query (React Query) | Server State Management |
| React Hook Form | Form Handling |
| Zod | Validation |
| Socket.io Client | Real-time Communication |
| Framer Motion | Animations |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| TypeScript | Type Safety |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.io | Real-time Communication |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Zod | DTO Validation |
| Jest | Testing |

---

## 📁 Project Structure
collaborative-task-manager/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ │ └── database.ts # MongoDB connection
│ │ ├── controllers/
│ │ │ ├── auth.controller.ts # Auth endpoints
│ │ │ ├── task.controller.ts # Task endpoints
│ │ │ └── notification.controller.ts
│ │ ├── dtos/
│ │ │ ├── auth.dto.ts # Auth validation schemas
│ │ │ └── task.dto.ts # Task validation schemas
│ │ ├── middleware/
│ │ │ ├── auth.middleware.ts # JWT authentication
│ │ │ ├── validate.middleware.ts
│ │ │ └── error.middleware.ts
│ │ ├── models/
│ │ │ ├── User.model.ts
│ │ │ ├── Task.model.ts
│ │ │ ├── Notification.model.ts
│ │ │ └── AuditLog.model.ts
│ │ ├── repositories/
│ │ │ ├── user.repository.ts # User data access
│ │ │ ├── task.repository.ts # Task data access
│ │ │ ├── notification.repository.ts
│ │ │ └── auditLog.repository.ts
│ │ ├── routes/
│ │ │ ├── index.ts # Main router
│ │ │ ├── auth.routes.ts
│ │ │ ├── task.routes.ts
│ │ │ └── notification.routes.ts
│ │ ├── services/
│ │ │ ├── auth.service.ts # Auth business logic
│ │ │ ├── task.service.ts # Task business logic
│ │ │ └── notification.service.ts
│ │ ├── socket/
│ │ │ └── index.ts # Socket.io setup
│ │ ├── types/
│ │ │ └── index.ts # TypeScript types
│ │ ├── utils/
│ │ │ ├── errors.ts # Custom error classes
│ │ │ ├── jwt.ts # JWT utilities
│ │ │ └── response.ts # Response helpers
│ │ └── index.ts # Entry point
│ ├── tests/
│ │ ├── setup.ts
│ │ └── task.service.test.ts
│ ├── package.json
│ ├── tsconfig.json
│ └── .env
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── ui/ # Reusable UI components
│ │ │ │ ├── Button.tsx
│ │ │ │ ├── Input.tsx
│ │ │ │ ├── Select.tsx
│ │ │ │ ├── Modal.tsx
│ │ │ │ ├── Badge.tsx
│ │ │ │ ├── Avatar.tsx
│ │ │ │ └── Skeleton.tsx
│ │ │ ├── layout/
│ │ │ │ ├── Header.tsx
│ │ │ │ └── Layout.tsx
│ │ │ ├── tasks/
│ │ │ │ ├── TaskCard.tsx
│ │ │ │ ├── TaskForm.tsx
│ │ │ │ ├── TaskList.tsx
│ │ │ │ ├── TaskFilters.tsx
│ │ │ │ └── StatusSelect.tsx
│ │ │ └── notifications/
│ │ │ └── NotificationDropdown.tsx
│ │ ├── context/
│ │ │ ├── AuthContext.tsx # Auth state management
│ │ │ └── SocketContext.tsx # Socket.io management
│ │ ├── hooks/
│ │ │ ├── useTasks.ts # Task queries/mutations
│ │ │ ├── useNotifications.ts
│ │ │ ├── useDebounce.ts
│ │ │ └── useLocalStorage.ts
│ │ ├── lib/
│ │ │ ├── axios.ts # API client
│ │ │ └── utils.ts # Utility functions
│ │ ├── pages/
│ │ │ ├── LoginPage.tsx
│ │ │ ├── RegisterPage.tsx
│ │ │ ├── DashboardPage.tsx
│ │ │ ├── TasksPage.tsx
│ │ │ ├── TaskDetailPage.tsx
│ │ │ ├── ProfilePage.tsx
│ │ │ └── SettingsPage.tsx
│ │ ├── services/
│ │ │ ├── auth.service.ts
│ │ │ ├── task.service.ts
│ │ │ └── notification.service.ts
│ │ ├── types/
│ │ │ └── index.ts
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── index.css
│ ├── package.json
│ ├── vite.config.ts
│ ├── tailwind.config.js
│ └── .env
│
├── docker-compose.yml
├── .gitignore
└── README.md


---

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
mongod --version  # Should be v6+

🔧 Installation
1. Clone the Repository
git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager

2. Setup Backend
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your settings
notepad .env
Backend .env file:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your-cookie-secret-key
FRONTEND_URL=http://localhost:5173

3. Setup Frontend
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file
notepad .env

Frontend .env file:
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

🚀 Running the Application
Start MongoDB
# Windows - Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod

Start Backend (Terminal 1)
cd backend
npm run dev

Expected output:
✅ MongoDB connected successfully

🚀 Server is running!
📍 Local: http://localhost:5000
📍 API: http://localhost:5000/api/v1
📍 Health: http://localhost:5000/api/v1/health
🔌 WebSocket: ws://localhost:5000

Start Frontend (Terminal 2)
cd frontend
npm run dev

Expected output:
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose

Access the Application
Frontend: http://localhost:5173
Backend API: http://localhost:5000/api/v1
Health Check: http://localhost:5000/api/v1/health

📡 API Documentation
Base URL
http://localhost:5000/api/v1

Authentication Endpoints
Method	Endpoint	Description	Auth Required
POST	/auth/register	Register new user	No
POST	/auth/login	Login user	No
POST	/auth/logout	Logout user	Yes
GET	/auth/me	Get current user	Yes
PATCH	/auth/profile	Update profile	Yes
POST	/auth/change-password	Change password	Yes
GET	/auth/users	Get all users	Yes

Register User
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

Response:

{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}

Login User
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}

Task Endpoints
Method	Endpoint	Description	Auth Required
GET	/tasks	Get all tasks (with filters)	Yes
POST	/tasks	Create new task	Yes
GET	/tasks/dashboard	Get dashboard data	Yes
GET	/tasks/:id	Get task by ID	Yes
PATCH	/tasks/:id	Update task	Yes
DELETE	/tasks/:id	Delete task	Yes
GET	/tasks/:id/history	Get task history	Yes

Create Task
POST /api/v1/tasks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "priority": "High",
  "assignedToId": "user_id_here"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the API",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "priority": "High",
    "status": "To Do",
    "creatorId": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "assignedToId": {
      "_id": "...",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Task created successfully"
}

Get Tasks with Filters
GET /api/v1/tasks?page=1&limit=10&status=In%20Progress&priority=High&sortBy=dueDate&sortOrder=asc&assignedToMe=true
Authorization: Bearer <token>

Query Parameters:

Parameter	Type	Description	Default
page	number	Page number	1
limit	number	Items per page	10
status	string	Filter by status	-
priority	string	Filter by priority	-
sortBy	string	Sort field	dueDate
sortOrder	string	asc or desc	asc
search	string	Search in title/description	-
assignedToMe	boolean	Tasks assigned to me	false
createdByMe	boolean	Tasks created by me	false
overdue	boolean	Overdue tasks only	false