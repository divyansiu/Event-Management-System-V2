# Campus Event Management — Single Source of Truth (CONTRACT.md)

## 1. Fixed Project Structure
```text
campus-event-management/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── student.html
│   ├── organizer.html
│   ├── event.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── student.js
│       └── organizer.js
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Registration.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── registrationRoutes.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── registrationController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── README.md
└── CONTRACT.md
```

---

## 2. Fixed Database Models

### User
```javascript
{
    name: String,
    email: String,
    password: String,
    role: String, // 'student' | 'organizer'
    createdAt: Date
}
```
**Allowed roles:** `student`, `organizer`

### Event
```javascript
{
    title: String,
    description: String,
    category: String,
    date: Date,
    time: String,
    location: String,
    capacity: Number,
    organizerId: ObjectId,
    createdAt: Date
}
```

### Registration
```javascript
{
    studentId: ObjectId,
    eventId: ObjectId,
    status: String, // 'REGISTERED' | 'CANCELLED'
    registeredAt: Date
}
```

---

## 3. Fixed API Routes

### Authentication
* `POST /api/auth/register`
* `POST /api/auth/login`

### Events
* `GET    /api/events`
* `GET    /api/events/:id`
* `POST   /api/events`
* `PUT    /api/events/:id`
* `DELETE /api/events/:id`
* `GET    /api/events/:id/participants`

### Registration
* `POST   /api/events/:id/register`
* `DELETE /api/events/:id/register`
* `GET    /api/registrations/me`

---

## 4. Fixed API Response Format

### Success
```json
{
    "success": true,
    "message": "Operation successful description",
    "data": {}
}
```

### Error
```json
{
    "success": false,
    "message": "Error description"
}
```

---

## 5. Fixed Authentication Format

### Login & Register Success Response:
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "JWT_TOKEN",
        "user": {
            "id": "USER_ID",
            "name": "User Name",
            "email": "user@example.com",
            "role": "student"
        }
    }
}
```

### Authorization Header for Protected Requests:
```text
Authorization: Bearer <token>
```

---

## 6. Frontend Configuration
```javascript
const API_BASE_URL = "http://localhost:3000/api";
```

---

## 7. Team Module Ownership
* **Member 1 (Aryan) — Auth & Roles**: `models/User.js`, `routes/authRoutes.js`, `controllers/authController.js`, `middleware/authMiddleware.js`, `middleware/roleMiddleware.js`
* **Member 2 — Student / Registration**: `models/Registration.js`, `routes/registrationRoutes.js`, `controllers/registrationController.js`, `student.html`, `student.js`
* **Member 3 — Events & Database**: `models/Event.js`, `routes/eventRoutes.js`, `controllers/eventController.js`, `config/db.js`, `organizer.html`, `organizer.js`
* **Member 4 — Frontend & Integration**: `index.html`, `login.html`, `register.html`, `event.html`, `css/style.css`, `js/api.js`, `js/auth.js`
