# Full-Stack E-Commerce Marketplace
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This is a monorepo for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It includes a **React (Vite)** frontend and a **Node.js (Express)** backend API. The entire backend environment is containerized with Docker for easy and consistent setup.

## Features

- **Monorepo Structure:** Backend and frontend code are managed in a single repository.
- **Authentication:** JWT-based user registration and login.
- **User Account Management:** Users can update their profile, change their password, and delete their account.
- **Authorization:** Protected routes and role-based access control (`BUYER`, `SELLER`).
- **Product Management:** Full CRUD for products, including multi-image uploads. Sellers can manage their own listings.
- **Shopping Cart:** Persistent, server-side cart with functionality to add, remove, and update item quantities.
- **Order Management:** Functionality to convert a cart into a persistent order and view order history.
- **Payment Integration:** Secure payment processing using Stripe Payment Intents and Webhooks.
- **Wishlist Management:** Users can create multiple wishlists, rename them, delete them, and add or remove products. The product page UI dynamically reflects whether an item is in a wishlist.

## Tech Stack

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **State Management:** React Context
- **File Uploads:** React Dropzone
- **Notifications:** React Toastify

### Backend
- **Runtime:** Node.js, Express.js
- **File Uploads:** Multer
- **Image Processing:** Sharp
- **Database:** PostgreSQL
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

These instructions use Docker and are cross-platform. They will work on **Windows** (with WSL 2 for Docker Desktop), **macOS**, and **Linux**.

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

## API Endpoints

### Auth
| Method | Path | Protected | Description |
|:---    |:---                  |:---       |:---         |
| `POST` | `/api/auth/register` | No        | Register a new user. |
| `POST` | `/api/auth/login`    | No        | Login and receive a JWT. |
| `GET`  | `/api/auth/me`       | Yes       | Get the current user's profile. |

### Users
| Method | Path | Protected | Description |
|:---    |:---                         |:---       |:---         |
| `PUT`  | `/api/users/me`             | Yes       | Update the current user's name. |
| `POST` | `/api/users/me/change-password`| Yes       | Change the current user's password. |
| `DELETE`| `/api/users/me`            | Yes       | Delete the current user's account. |

### Products
| Method | Path | Protected | Role | Description |
|:---    |:---                               |:---       |:---      |:---         |
| `GET`  | `/api/products`                   | No        | -        | Get a list of all products (accepts `?search=` query). |
| `GET`  | `/api/products/:id`               | No        | -        | Get a single product by ID. |
| `GET`  | `/api/products/seller/my-products`| Yes       | `SELLER` | Get all products for the current seller. |
| `POST` | `/api/products`                   | Yes       | `SELLER` | Create a new product (handles file uploads). |
| `PUT`  | `/api/products/:id`               | Yes       | `SELLER` | Update your own product (handles file uploads). |
| `DELETE`| `/api/products/:id`              | Yes       | `SELLER` | Delete your own product. |

### Cart
| Method | Path | Protected | Description |
|:---    |:---                         |:---       |:---         |
| `GET`  | `/api/cart`                   | Yes       | Get the user's current cart. |
| `POST` | `/api/cart/items`             | Yes       | Add an item to the cart. |
| `PUT`  | `/api/cart/items/:itemId`     | Yes       | Update the quantity of an item in the cart. |
| `DELETE`| `/api/cart/items/:itemId`    | Yes       | Remove an item from the cart. |

### Wishlists
| Method | Path | Protected | Description |
|:---    |:---                                     |:---       |:---         |
| `GET`  | `/api/wishlists`                        | Yes       | Get all wishlists for the current user. |
| `POST` | `/api/wishlists`                        | Yes       | Create a new wishlist. |
| `GET`  | `/api/wishlists/:id`                    | Yes       | Get a single wishlist by ID. |
| `PATCH`| `/api/wishlists/:id`                    | Yes       | Update (rename) a wishlist. |
| `DELETE`| `/api/wishlists/:id`                   | Yes       | Delete a wishlist. |
| `POST` | `/api/wishlists/:wishlistId/items`      | Yes       | Add a product to a wishlist. |
| `DELETE`| `/api/wishlists/items/by-product/:productId`| Yes   | Remove a product from the user's wishlists. |

### Orders & Payments
*(Functionality exists on the backend but is not yet fully integrated into the frontend workflow)*

| Method | Path | Protected | Role | Description |
|:---    |:---                         |:---       |:---      |:---         |
| `POST` | `/api/orders`                   | Yes       | Logged In  | Create an order from the cart. |
| `GET`  | `/api/orders`                   | Yes       | Logged In  | Get the user's order history. |
| `POST` | `/api/payments/create-intent`   | Yes       | Logged In  | Create a Stripe Payment Intent. |
| `POST` | `/api/payments/webhook`         | No        | -        | Stripe webhook for payment events. |

## License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for full details.  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)