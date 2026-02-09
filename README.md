# Restaurant Management API
A modular Node.js/Express API for restaurant management, featuring authentication, booking systems, and role-based access control.

## Project Overview

This project provides a robust backend for a restaurant application. It allows users to:
- Register and manage their profiles.
- Create, view, and manage table bookings.
- Receive email confirmations for registration and bookings.
- Access resources based on their roles (User/Admin).

## Setup Instructions

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the server**:
    ```bash
    npm start
    ```

## API Documentation

### Authentication (Public)
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate user and receive JWT.

### User Profile (Private)
- `GET /api/auth/profile`: Get logged-in user profile.
- `PUT /api/auth/profile`: Update logged-in user profile.

### Bookings (Private)
- `POST /api/bookings`: Create a new booking.
- `GET /api/bookings`: Get all bookings (Admin sees all, User sees theirs).
- `GET /api/bookings/:id`: Get a specific booking.
- `PUT /api/bookings/:id`: Update a booking.
- `DELETE /api/bookings/:id`: Cancel/Delete a booking.

### Menu (Public)
- `GET /api/menu`: Retrieve all menu items.

## Advanced Features
- **RBAC**: Different access levels for User and Admin.
- **Validation**: Input validation using Joi.
- **Security**: Password hashing with Bcrypt and JWT authentication.
- **SMTP**: Email notifications using Nodemailer.
- **Global Error Handling**: Centralized error management for clean API responses.
