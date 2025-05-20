# HR Management System

A modern web application for managing employees, leave requests, absences, and complaints. Built with React and Laravel.

---

## Quick Start

### Clone and setup

```bash
git clone https://github.com/ImaneBelmiloudi/hr-management.git
cd hr-management
code .
```

---

### Frontend setup

```bash
cd frontend
npm install
npm start
```

---

### Backend setup

```bash
cd backend
composer install
php artisan serve
```

---

### Database setup

```bash
CREATE DATABASE hr_management;
```

**For Command Prompt (CMD):**

```bash
cd database
mysql -u root -p hr_management < hr_management.sql
```

**For PowerShell:**

```bash
cd database
Get-Content .\hr_management.sql | & "C:\xampp\mysql\bin\mysql" -u root -p hr_management
```

---

## Features

* Employee management
* Leave requests and approvals
* Absence justifications
* Complaints and resolutions
* Role-based access (Admin, HR, Employee)
* Responsive design

---

## Tech Stack

### Frontend

* React 18+
* Tailwind CSS
* React Router
* React Query
* Axios

### Backend

* Laravel 12
* MySQL
* RESTful API

---

## Development

### Frontend Development

* Run `npm start` in the `frontend` directory
* Access the frontend at: `http://localhost:3000`

### Backend Development

* Run `php artisan serve` in the `backend` directory
* Access the API at: `http://localhost:8000`

---

## Database

* MySQL database named `hr_management`
* Import the database schema from `database/hr_management.sql`
* The seeder will create a default admin account:
  - **Email:** admin@example.com
  - **Password:** password

---

## License

This project is open-source and available under the MIT License.
