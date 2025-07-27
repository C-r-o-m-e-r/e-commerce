# E-Commerce Marketplace API

This is the backend API for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It is built with a modern tech stack including Node.js, Express, PostgreSQL, and Prisma, and is fully containerized with Docker for easy setup and deployment.

## Features

- **Authentication:** JWT-based user registration and login.
- **Authorization:** Protected routes and role-based access control (`BUYER`, `SELLER`).
- **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for products.
- **Security:** Password hashing with `bcryptjs` and ownership checks to ensure sellers can only manage their own products.
- **Containerized:** Fully dockerized environment for consistent setup and easy deployment.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)
- **Containerization:** Docker & Docker Compose
- **Development:** Nodemon for live reloading

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Make sure you have the following software installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL 2 enabled on Windows)
- [Git](https://git-scm.com/)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <your-repository-url>
   cd e-commerce
   ```

2. **Create the environment file:** Create a file named `.env` in the project root and add the following variables.

   ```env
   # PostgreSQL settings
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_DB=ecommerce_db

   # Application Port
   PORT=3000

   # JWT Secret
   JWT_SECRET=your-super-secret-key-that-is-long-and-random

   # Prisma Database URL
   DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public"
   ```

3. **Install project dependencies:**

   ```bash
   npm install
   ```

4. **Run the Database Migration:** This is a critical step to create the tables in your database.

   a. **Temporarily change the **``** in your **``** file** to point to `localhost` for the local command:

   ```diff
   - DATABASE_URL="postgresql://myuser:mypassword@db:5432/ecommerce_db?schema=public"
   + DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/ecommerce_db?schema=public"
   ```

   b. **Start only the database** container in the background:

   ```bash
   docker-compose up -d db
   ```

   c. **Run the migration** from your local terminal:

   ```bash
   npx prisma migrate dev
   ```

   d. **IMPORTANT: Change the **``** back to use **`` in your `.env` file so the API container can connect to it.

5. **Run the application:**

   ```bash
   docker-compose up --build
   ```

   The API will be available at `http://127.0.0.1:3000`.

If you need to create the project structure from an empty folder using PowerShell, use these commands:

```powershell
# Create main folders
mkdir src, tests

# Create sub-folders
New-Item -ItemType Directory -Path "src/routes", "src/controllers", "src/services", "src/models", "src/middleware", "src/config"

# Create initial files
New-Item -ItemType File -Name "src/index.js", "src/app.js", ".gitignore", ".env", "Dockerfile", "docker-compose.yml"
```

## API Endpoints

### Auth

| Method | Path                 | Protected | Role | Description                     |
| ------ | -------------------- | --------- | ---- | ------------------------------- |
| `POST` | `/api/auth/register` | No        | -    | Register a new user.            |
| `POST` | `/api/auth/login`    | No        | -    | Login and receive a JWT.        |
| `GET`  | `/api/auth/me`       | Yes       | Any  | Get the current user's profile. |

### Products

| Method   | Path                | Protected | Role     | Description                 |
| -------- | ------------------- | --------- | -------- | --------------------------- |
| `GET`    | `/api/products`     | No        | -        | Get a list of all products. |
| `GET`    | `/api/products/:id` | No        | -        | Get a single product by ID. |
| `POST`   | `/api/products`     | Yes       | `SELLER` | Create a new product.       |
| `PUT`    | `/api/products/:id` | Yes       | `SELLER` | Update your own product.    |
| `DELETE` | `/api/products/:id` | Yes       | `SELLER` | Delete your own product.    |

### Users (for Testing)

| Method | Path                  | Protected | Role | Description                               |
| ------ | --------------------- | --------- | ---- | ----------------------------------------- |
| `PUT`  | `/api/users/:id/role` | Yes       | Any  | Update a user's role (e.g., to `SELLER`). |

