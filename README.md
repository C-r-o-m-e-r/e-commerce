# Full-Stack E-Commerce Marketplace

This is a monorepo for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It includes a **React (Vite)** frontend and a **Node.js (Express)** backend API. The entire backend environment is containerized with Docker for easy and consistent setup.

## Features

- **Monorepo Structure:** Backend and frontend code are managed in a single repository.
- **Authentication:** JWT-based user registration and login.
- **Authorization:** Protected routes and role-based access control (`BUYER`, `SELLER`).
- **Product Management:** Full CRUD for products, including multi-image uploads. Sellers can manage their own listings.
- **Shopping Cart:** Persistent, server-side cart with functionality to add, remove, and update item quantities.
- **Order Management:** Functionality to convert a cart into a persistent order and view order history.
- **Payment Integration:** Secure payment processing using Stripe Payment Intents and Webhooks.

## Tech Stack

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **State Management:** React Context
- **File Uploads:** React Dropzone ### Backend
- **Runtime:** Node.js, Express.js
- **File Uploads:** Multer - **Database:** PostgreSQL
- **ORM:** Prisma
- **Payments:** Stripe
- **Authentication:** JSON Web Tokens (JWT)
- **Containerization:** Docker & Docker Compose
- **Middleware:** CORS (Cross-Origin Resource Sharing)

## Project Structure
The repository is organized as a monorepo with two main directories:
- **/backend**: Contains the Node.js/Express.js API, Prisma schema, Docker configuration, and all server-side logic. Includes an `/uploads` directory for storing product images.
- **/frontend**: Contains the React (Vite) application, including all components, pages, API services, and styling.

## Local Development Setup

Follow these instructions to get both the backend and frontend services running on your local machine.

### Prerequisites

Make sure you have the following software installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for testing payments locally)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create the environment file:**
    Create a file named `backend/.env` with the necessary variables.

3.  **Install backend dependencies:**
    ```bash
    npm install
    ```
4.  **Run the Database Migration:**
    **This is a critical step.** The application will fail without it.
    
    a. **Temporarily change the `DATABASE_URL` in `backend/.env`** to point to `localhost`.
    b. **Start only the database** container: `docker-compose up -d db`.
    c. **Run the migration from your local terminal**: `npx prisma migrate dev`.
    d. **IMPORTANT: Change the `DATABASE_URL` back** to use the service name `db`.

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

### Running the Application

You need **two separate terminals** to run both services concurrently.

1.  **Terminal 1: Start the Backend**
    ```bash
    cd backend
    docker-compose up --build
    ```
    The API will be available at `http://127.0.0.1:3000`.

2.  **Terminal 2: Start the Frontend**
    **Note:** Ensure the backend is running before starting the frontend.
    ```bash
    cd frontend
    npm run dev
    ```
    The React application will be available at `http://localhost:5173`.

### Testing Stripe Webhooks Locally
To test the payment confirmation flow, you need a **third terminal**.

1.  **Terminal 3: Stripe CLI**
    Run the `listen` command to forward Stripe events to your local server.
    ```bash
    stripe listen --forward-to [http://127.0.0.1:3000/api/payments/webhook](http://127.0.0.1:3000/api/payments/webhook)
    ```
2.  **Payment Confirmation**
    After creating a Payment Intent via the API, use its ID in this command:
    ```bash
    stripe payment_intents confirm <payment_intent_id>
    ```

## API Endpoints

### Auth
*(No changes here)*

### Products
| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/products` | No | - | Get a list of all products. |
| `GET` | `/api/products/:id` | No | - | Get a single product by ID. |
| `GET` | `/api/products/seller/my-products`| Yes | `SELLER` | Get all products for the current seller. | | `POST` | `/api/products` | Yes | `SELLER` | Create a new product (handles file uploads). |
| `PUT` | `/api/products/:id` | Yes | `SELLER` | Update your own product (handles file uploads). |
| `DELETE`| `/api/products/:id` | Yes | `SELLER` | Delete your own product. |

### Cart
| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/cart` | Yes | Logged In | Get the user's current cart. | | `POST` | `/api/cart/items` | Yes | Logged In | Add an item to the cart. | | `PUT` | `/api/cart/items/:itemId` | Yes | Logged In | Update the quantity of an item in the cart. | | `DELETE`| `/api/cart items/:itemId` | Yes | Logged In | Remove an item from the cart. | ### Orders & Payments
| `GET` | `/api/cart` | Yes | `BUYER` | Get the user's current cart. |
| `POST` | `/api/cart/items` | Yes | `BUYER` | Add an item to the cart. | | `DELETE`| `/api/cart/items/:itemId` | Yes | `BUYER` | Remove an item from the cart. |

### Orders
| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `POST` | `/api/orders` | Yes | `BUYER` | Create an order from the cart. |
| `GET` | `/api/orders` | Yes | `BUYER` | Get the user's order history. |

### Payments
| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `POST` | `/api/payments/create-intent` | Yes | `BUYER` | Create a Stripe Payment Intent. |
| `POST` | `/api/payments/webhook` | No | - | Stripe webhook for payment events. |