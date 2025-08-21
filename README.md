# Full-Stack E-Commerce Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This is a monorepo for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It includes a **React (Vite)** frontend and a **Node.js (Express)** backend API. The entire backend environment is containerized with Docker for easy and consistent setup.

-----

## Features

### Core Functionality

-   **Monorepo Structure:** Backend and frontend code are managed in a single repository.
-   **Authentication & Authorization:** JWT-based user registration, login, and role-based access control (`BUYER`, `SELLER`).
-   **Product Management:** Full CRUD for products, including multi-image uploads. Sellers can manage their own listings.
-   **Seller Dashboard:** A dedicated dashboard for sellers to view sales statistics, recent orders, and low-stock items.
-   **Coupon System:** Sellers can create percentage-based or fixed-amount discount codes with optional expiration dates. Buyers can apply these codes in the cart to receive a discount.
-   **Shopping Cart:** Persistent, server-side cart with functionality to add, remove, and update item quantities. **Supports both guest and authenticated users**, with seamless cart merging upon login.
-   **Comprehensive Admin Panel:**
    -   A central **dashboard** with site-wide statistics (total users, products, sales).
    -   Full **user management** (view all, edit roles, block/unblock, delete, search & filter).
    -   Full **product management**, including the ability to approve/reject new products from sellers, edit any product's details, and delete products from the marketplace.
    -   Full **order management** with the ability to view all orders, filter by status, see order details, update status (e.g., Pending -> Shipped), and process full refunds via Stripe.
    -   **Site-wide moderation** including full CRUD for **categories**, and the ability to view and delete all user **reviews** and seller-created **coupons**.
-   **Wishlist Management:** Users can create and manage multiple wishlists.
-   **Order History:** Users can view a list of all their past orders and see a detailed breakdown of each one.
-   **Product Reviews & Ratings:** Users who have purchased a product can leave a star rating (1-5) and a written review.
-   **Payment Integration:** Secure payment processing using Stripe Payment Intents and Webhooks.

### UI/UX Enhancements

-   **Advanced Product Discovery:**
    -   **Filtering:** A hierarchical category system with infinite nesting for subcategories.
    -   **Sorting:** Sort products by newest, price ascending, and price descending.
    -   **Pagination:** Product lists are paginated for better performance and usability.
    -   **Search Autocomplete:** Rich search suggestions (with product image, title, and price) appear as the user types.
-   **User Account Management:** A unified account page with nested routing where users can update their profile, change their password, and delete their account.
-   **Automatic Day/Night Theme:** The UI automatically switches between a light and dark theme based on the user's local time.
-   **Quick Add to Cart:** An "Add to Cart" button appears on product cards on hover, allowing for faster shopping.
-   **On-Page Notifications:** Smooth user feedback using React Toastify.
-   **Scroll to Top Button:** A convenient button appears on long pages to quickly return to the top.

-----

## Tech Stack

| Area | Technology |
|:--- |:--- |
| **Frontend** | React, Vite, React Router DOM, React Context, React Toastify, React Dropzone |
| **Backend** | Node.js, Express.js, CORS |
| **Database** | PostgreSQL, Prisma (ORM) |
| **Payments** | Stripe API |
| **File Handling**| Multer, Sharp.js |
| **Authentication**| JSON Web Tokens (JWT) |
| **Testing** | Jest, Supertest |
| **DevOps** | Docker, Docker Compose |

-----

## Project Structure

The repository is organized as a monorepo with two main directories:

  - **/backend**: Contains the Node.js/Express.js API, Prisma schema, Docker configuration, and all server-side logic. Includes an `/uploads` directory for storing product images.
  - **/frontend**: Contains the React (Vite) application, including all components, pages, API services, and styling.

-----

## Local Development Setup

These instructions use Docker and are cross-platform. They will work on **Windows** (with WSL 2 for Docker Desktop), **macOS**, and **Linux**.

### Prerequisites

Make sure you have the following software installed:

  - [Node.js](https://nodejs.org/) (LTS version recommended)
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - [Git](https://git-scm.com/)
  - [Stripe CLI](https://github.com/stripe/stripe-cli/releases) (for testing payments locally)

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
    **This is a critical step.** The application will fail without it. The migration must be run from your local machine, but it will connect to the database running inside the Docker container.

    a. **Temporarily change the `DATABASE_URL` in `backend/.env`** to point to `localhost`. For example:
    `DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"`

    b. **In a new terminal, start only the database** container:
    ` bash cd backend docker-compose up -d db  `

    c. **Run the migration from your first terminal**. This command will apply any existing migrations and prompt you to create a new one if you've changed the schema.
    ` bash npx prisma migrate dev  `

    d. **IMPORTANT: Change the `DATABASE_URL` back** to use the Docker service name `db`. For example:
    `DATABASE_URL="postgresql://user:password@db:5432/mydb?schema=public"`

### Frontend Setup

1.  **Navigate to the frontend directory**:

    ```bash
    cd frontend
    ```

2.  **Create the environment file:**
    Create a file named `frontend/.env` and add your Stripe Publishable Key:
    `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

3.  **Install frontend dependencies:**

    ```bash
    npm install
    ```

### Running the Application

You need **two to three terminals** to run all services for local development.

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

### Testing Payments with Stripe

To test the payment flow, you need to forward Stripe's webhook events to your local backend server. This requires a **third terminal**.

1.  **Log in to the Stripe CLI:**
    ```bash
    stripe login
    ```
2.  **Forward events to your local webhook endpoint:**
    ```bash
    stripe listen --forward-to http://localhost:3000/api/payments/webhook
    ```
3.  The command will output a **webhook signing secret** (it starts with `whsec_...`). **Copy this key.**
4.  Open your `backend/.env` file and paste this key as the value for `STRIPE_WEBHOOK_SECRET`.
5.  **Restart your backend server** to apply the new environment variable.
6.  Keep the `stripe listen` command running in its terminal while you test payments.

-----

## Running Tests

The test suite uses Jest and Supertest to run integration tests against the backend API.

1.  **Ensure the test database is running:**
    From the `backend` directory, start the database container.

    ```bash
    cd backend
    docker-compose up -d db
    ```

2.  **Create a test environment file:**
    Create a file named `backend/.env.test` and copy the variables from your `.env` file. **Important:** Ensure the `DATABASE_URL` in this file uses `localhost` instead of `db` so that Jest (running on your local machine) can connect to the database container.
    `DATABASE_URL="postgresql://user:password@localhost:5432/mydb_test?schema=public"`

3.  **Run the tests:**
    From the `backend` directory, run the test command:

    ```bash
    npm test
    ```

-----

## API Endpoints

### Auth

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | No | Register a new user. |
| `POST` | `/api/auth/login` | No | Login and receive a JWT. |
| `GET` | `/api/auth/me` | Yes | Get the current user's profile. |

### Users

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `PUT` | `/api/users/me` | Yes | Update the current user's name. |
| `POST` | `/api/users/me/change-password`| Yes | Change the current user's password. |
| `DELETE`| `/api/users/me` | Yes | Delete the current user's account. |

### Products

| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/products` | No | - | Get approved products. Accepts `search`, `category`, `sortBy`, `page`, `limit`. |
| `GET` | `/api/products/suggestions` | No | - | Get search suggestions (for autocomplete). |
| `GET` | `/api/products/:id` | No | - | Get a single product by ID. |
| `GET` | `/api/products/seller/my-products`| Yes | `SELLER` | Get all products for the current seller. |
| `POST` | `/api/products` | Yes | `SELLER` | Create a new product. |
| `PUT` | `/api/products/:id` | Yes | **`SELLER`, `ADMIN`** | Update your own product (Seller) or any product (Admin). |
| `DELETE`| `/api/products/:id` | Yes | **`SELLER`, `ADMIN`** | Delete your own product (Seller) or any product (Admin). |

### Seller

| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/seller/dashboard` | Yes | `SELLER` | Get statistics for the seller dashboard. |
| `GET` | `/api/seller/orders` | Yes | `SELLER` | Get a list of orders containing the seller's products. |
| `GET` | `/api/seller/orders/:id` | Yes | `SELLER` | Get a single order by ID. |
| `PATCH`| `/api/seller/orders/:id/status` | Yes | `SELLER` | Update the status of an order. |

### Categories

| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/categories` | No | - | Get a nested tree of all categories. |
| `POST` | `/api/categories` | Yes | `ADMIN` | Create a new category. |
| `PUT` | `/api/categories/:id` | Yes | `ADMIN` | Update a category. |
| `DELETE`| `/api/categories/:id` | Yes | `ADMIN` | Delete a category. |

### Cart

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `GET` | `/api/cart` | Optional | Get the user's or guest's current cart. |
| `POST` | `/api/cart/items` | Optional | Add an item to the cart. |
| `PUT` | `/api/cart/items/:itemId` | Optional | Update the quantity of an item in the cart. |
| `DELETE`| `/api/cart/items/:itemId` | Optional | Remove an item from the cart. |
| `POST` | `/api/cart/apply-coupon` | Optional | Apply a coupon code to the current cart. |

### Coupons (Seller Only)

| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `POST` | `/api/coupons` | Yes | `SELLER` | Create a new coupon. |
| `GET` | `/api/coupons` | Yes | `SELLER` | Get all coupons created by the seller. |
| `PUT` | `/api/coupons/:id` | Yes | `SELLER` | Update an existing coupon. |
| `DELETE`| `/api/coupons/:id` | Yes | `SELLER` | Delete a coupon. |

### Wishlists

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `GET` | `/api/wishlists` | Yes | Get all wishlists for the current user. |
| `POST` | `/api/wishlists` | Yes | Create a new wishlist. |
| `GET` | `/api/wishlists/:id` | Yes | Get a single wishlist by ID. |
| `PATCH`| `/api/wishlists/:id` | Yes | Update (rename) a wishlist. |
| `DELETE`| `/api/wishlists/:id` | Yes | Delete a wishlist. |
| `POST` | `/api/wishlists/:wishlistId/items` | Yes | Add a product to a wishlist. |
| `DELETE`| `/api/wishlists/items/by-product/:productId`| Yes | Remove a product from the user's wishlists. |

### Reviews

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `GET` | `/api/reviews/:productId` | No | Get all reviews for a product. |
| `POST` | `/api/reviews/:productId` | Yes | Create or update a review for a product (user must have purchased it). |

### Orders

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `GET` | `/api/orders` | Yes | Get the user's order history. |
| `GET` | `/api/orders/:id` | Yes | Get a single order by ID. |
| `POST` | `/api/orders` | Yes | Create an order from the cart. |

### Payments

| Method | Path | Protected | Description |
|:---|:---|:---|:---|
| `POST` | `/api/payments/create-intent` | Yes | Create a Stripe Payment Intent. |
| `POST` | `/api/payments/webhook` | No | Stripe webhook for payment events. |

### Admin

| Method | Path | Protected | Role | Description |
|:---|:---|:---|:---|:---|
| `GET` | `/api/admin/dashboard-stats` | Yes | `ADMIN` | Get statistics for the admin dashboard. |
| `GET` | `/api/admin/users` | Yes | `ADMIN` | Get all users. Accepts `search`, `role`. |
| `GET` | `/api/admin/users/:id` | Yes | `ADMIN` | Get a single user's details. |
| `PATCH`| `/api/admin/users/:id/role` | Yes | `ADMIN` | Update a user's role. |
| `PATCH`| `/api/admin/users/:id/status` | Yes | `ADMIN` | Update a user's status (block/unblock). |
| `DELETE`| `/api/admin/users/:id` | Yes | `ADMIN` | Delete a user. |
| `GET` | `/api/admin/products` | Yes | `ADMIN` | Get all products. Accepts `search`, `status`, `categoryId`. |
| `PUT` | `/api/admin/products/:id` | Yes | `ADMIN` | Update any product's details. |
| `PATCH`| `/api/admin/products/:id/status` | Yes | `ADMIN` | Update a product's status (approve/reject). |
| `DELETE`| `/api/admin/products/:id` | Yes | `ADMIN` | Delete any product. |
| `GET` | `/api/admin/orders` | Yes | `ADMIN` | Get all orders. Accepts `status`, `page`, `limit`. |
| `GET` | `/api/admin/orders/:id` | Yes | `ADMIN` | Get a single order's details. |
| `PATCH`| `/api/admin/orders/:id/status` | Yes | `ADMIN` | Update an order's status. |
| `POST` | `/api/admin/orders/:id/refund` | Yes | `ADMIN` | Process a full refund for an order. |
| `GET` | `/api/admin/reviews` | Yes | `ADMIN` | Get all reviews. |
| `DELETE`| `/api/admin/reviews/:id` | Yes | `ADMIN` | Delete a review. |
| `GET` | `/api/admin/coupons` | Yes | `ADMIN` | Get all coupons. |
| `DELETE`| `/api/admin/coupons/:id` | Yes | `ADMIN` | Delete a coupon. |

-----

## License

This project is licensed under the MIT License.
See the [LICENSE](LICENSE) file for full details.