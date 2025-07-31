# E-Commerce Marketplace API

This is the backend API for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It is built with a modern tech stack including Node.js, Express, PostgreSQL, and Prisma, and is fully containerized with Docker for easy setup and deployment.

## Features

-   **Authentication:** JWT-based user registration and login.
-   **Authorization:** Protected routes and role-based access control (`BUYER`, `SELLER`).
-   **Product Management:** Full CRUD (Create, Read, Update, Delete) functionality for products.
-   **Shopping Cart:** Persistent, server-side cart management for authenticated users.
-   **Order Management:** Functionality to convert a cart into a persistent order and view order history.
-   **Payment Integration:** Secure payment processing using Stripe Payment Intents and Webhooks to handle payment confirmation.
-   **Security:** Password hashing with `bcryptjs` and ownership checks to ensure sellers can only manage their own products.
-   **Containerized:** Fully dockerized environment for consistent setup and easy deployment.

## Tech Stack

-   **Backend:** Node.js, Express.js
-   **Database:** PostgreSQL
-   **ORM:** Prisma
-   **Payments:** Stripe
-   **Authentication:** JSON Web Tokens (JWT)
-   **Containerization:** Docker & Docker Compose
-   **Development:** Nodemon for live reloading

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

Make sure you have the following software installed:
-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with WSL 2 enabled on Windows)
-   [Git](https://git-scm.com/)
-   [Stripe CLI](https://stripe.com/docs/stripe-cli) (for testing payments locally)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd e-commerce
    ```

2.  **Create the environment file:**
    Create a file named `.env` in the project root and add the following variables.

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

    # Stripe Keys
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    ```

3.  **Install project dependencies:**
    ```bash
    npm install
    ```

4.  **Run the Database Migration:**
    This is a critical step to create the tables in your database.
    
    a. **Temporarily change the `DATABASE_URL` in your `.env` file** to point to `localhost`.
    b. **Start only the database** container: `docker-compose up -d db`.
    c. **Run the migration** from your local terminal: `npx prisma migrate dev`.
    d. **IMPORTANT: Change the `DATABASE_URL` back to use `db`** in your `.env` file.

5.  **Run the application:**
    ```bash
    docker-compose up --build
    ```
    The API will be available at `http://127.0.0.1:3000`.

### Testing Stripe Webhooks Locally
To test the payment confirmation flow, you need two terminals running simultaneously with your application:

1.  **Terminal 1: Your Application**
    ```bash
    docker-compose up
    ```

2.  **Terminal 2: Stripe CLI**
    Run the `listen` command to forward Stripe events to your local server. This will also give you the `STRIPE_WEBHOOK_SECRET` to put in your `.env` file.
    ```bash
    stripe listen --forward-to [http://127.0.0.1:3000/api/payments/webhook](http://127.0.0.1:3000/api/payments/webhook)
    ```
3.  **Terminal 3 (or any other): Payment Confirmation**
    After creating a Payment Intent via the API, use its ID to confirm the payment.
    ```bash
    stripe payment_intents confirm <payment_intent_id> --payment-method=pm_card_visa --return-url="[https://example.com/success](https://example.com/success)"
    ```

## API Endpoints

### Auth
| Method | Path                 | Protected | Role | Description                  |
|:-------|:---------------------|:----------|:-----|:-----------------------------|
| `POST` | `/api/auth/register` | No        | -    | Register a new user.         |
| `POST` | `/api/auth/login`    | No        | -    | Login and receive a JWT.     |
| `GET`  | `/api/auth/me`       | Yes       | Any  | Get the current user's profile.|

### Products
| Method   | Path                  | Protected | Role     | Description                     |
|:---------|:----------------------|:----------|:---------|:--------------------------------|
| `GET`    | `/api/products`       | No        | -        | Get a list of all products.     |
| `GET`    | `/api/products/:id`   | No        | -        | Get a single product by ID.     |
| `POST`   | `/api/products`       | Yes       | `SELLER` | Create a new product.           |
| `PUT`    | `/api/products/:id`   | Yes       | `SELLER` | Update your own product.        |
| `DELETE` | `/api/products/:id`   | Yes       | `SELLER` | Delete your own product.        |

### Cart
| Method   | Path                         | Protected | Role    | Description                  |
|:---------|:-----------------------------|:----------|:--------|:-----------------------------|
| `GET`    | `/api/cart`                  | Yes       | `BUYER` | Get the user's current cart. |
| `POST`   | `/api/cart/items`            | Yes       | `BUYER` | Add an item to the cart.     |
| `DELETE` | `/api/cart/items/:itemId`    | Yes       | `BUYER` | Remove an item from the cart.|

### Orders
| Method | Path            | Protected | Role    | Description                       |
|:-------|:----------------|:----------|:--------|:----------------------------------|
| `POST` | `/api/orders`   | Yes       | `BUYER` | Create an order from the cart.    |
| `GET`  | `/api/orders`   | Yes       | `BUYER` | Get the user's order history.     |

### Payments
| Method | Path                           | Protected | Role    | Description                       |
|:-------|:-------------------------------|:----------|:--------|:----------------------------------|
| `POST` | `/api/payments/create-intent`  | Yes       | `BUYER` | Create a Stripe Payment Intent.   |
| `POST` | `/api/payments/webhook`        | No        | -       | Stripe webhook for payment events.|

### Users (for Testing)
| Method | Path                 | Protected | Role | Description                  |
|:-------|:---------------------|:----------|:-----|:-----------------------------|
| `PUT`  | `/api/users/:id/role`| Yes       | Any  | Update a user's role (e.g., to `SELLER`). |