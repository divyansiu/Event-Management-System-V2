# Campus Event Management System

A full-stack web application for managing college events, student registrations, and event participants.

This project is primarily being developed as a **team practice project** to learn collaborative development using Git and GitHub, including feature branches, pull requests, code reviews, integration testing, and controlled merging.

Deployed at : <a>https://divyansiu.github.io/Event-Management-System-V2/<a>

<img width="1512" height="733" alt="image" src="https://github.com/user-attachments/assets/169b337c-e607-4e88-adb0-3505b152a68f" />


## Features

### Authentication & Roles

* Student registration and login
* Event Manager login
* Role-based access
* Protected routes
* Password hashing
* JWT/session-based authentication

### Student

* View available events
* Search and filter events
* View event details
* Register for events
* Cancel registration
* View registered events

### Event Manager

* Create events
* Edit events
* Delete events
* Set event capacity
* View registered participants

### Database

The application manages three main entities:

* Users
* Events
* Registrations

## Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Other Tools

* Git
* GitHub
* Postman / Thunder Client
* VS Code

## Project Structure

```text
campus-event-management/
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Events

```text
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/participants
```

### Registration

```text
POST   /api/events/:id/register
DELETE /api/events/:id/register
GET    /api/registrations/me
```

## Git & GitHub Workflow

The project follows a controlled branching workflow.

```text
feature branch
      ↓
Pull Request
      ↓
Code Review
      ↓
demo
      ↓
Integration Testing
      ↓
main
```

### Branches

```text
main
demo
feature/auth
feature/student
feature/events-database
feature/frontend
```

`main` contains stable code.

`demo` is used for integrating and testing features before they reach `main`.

Developers should not directly push development code to `main`.

## Team Modules

| Module                      | Responsibility                                     |
| --------------------------- | -------------------------------------------------- |
| Authentication & Roles      | Registration, login, authentication, authorization |
| Student                     | Event discovery, registration, cancellations       |
| Event Management & Database | Event CRUD, participants, database                 |
| Frontend & Integration      | UI and connection with backend APIs                |

## Running the Project

### Clone the repository

```bash
git clone <repository-url>
cd campus-event-management
```

### Backend

```bash
cd backend
npm install
npm start
```

The backend will run on:

```text
http://localhost:3000
```

### Frontend

Open the frontend using VS Code Live Server or another local development server.

## Development Rules

1. Create a feature branch before working.
2. Keep commits related to one feature/change.
3. Push your branch to GitHub.
4. Create a Pull Request.
5. Get the code reviewed.
6. Merge into `demo`.
7. Test the integrated application.
8. Merge `demo` into `main` only after testing.

## Project Goal

The goal of this project is to build a functional campus event management system while practicing how a small development team can collaborate on the same codebase without directly modifying the stable branch.

**Build → Commit → PR → Review → Integrate → Test → Release**
