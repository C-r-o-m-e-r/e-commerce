# Full-Stack E-Commerce Marketplace
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This is a monorepo for a full-featured e-commerce marketplace, similar to Etsy or Amazon. It includes a **React (Vite)** frontend and a **Node.js (Express)** backend API. The entire backend environment is containerized with Docker for easy and consistent setup.

## Features

- **Monorepo Structure:** Backend and frontend code are managed in a single repository.
- **Authentication:** JWT-based user registration and login.
- **User Account Management:** A unified account page with nested routing where users can update their profile, change their password, and delete their account.
- **Seller Dashboard:** A dedicated dashboard for sellers to view sales statistics, recent orders, and low-stock items.
- **Authorization:** Protected routes and role-based access control (`BUYER`, `SELLER`).
- **Product Management:** Full CRUD for products, including multi-image uploads. Sellers can manage their own listings.
- **Advanced Product Discovery:**
    - **Filtering:** A hierarchical category system with infinite nesting for subcategories.
    - **Sorting:** Sort products by newest, price ascending, and price descending.
    - **Pagination:** Product lists are paginated for better performance and usability.
    - **Search Autocomplete:** Rich search suggestions (with product image, title, and price) appear as the user types.
- **Shopping Cart:** Persistent, server-side cart with functionality to add, remove, and update item quantities.
- **Wishlist Management:** Users can create multiple wishlists, rename them, delete them, and add or remove products.
- **Order History:** Users can view a list of all their past orders and see a detailed breakdown of each one.
- **Product Reviews & Ratings:** Users who have purchased a product can leave a star rating (1-5) and a written review.
- **Payment Integration:** Secure payment processing using Stripe Payment Intents and Webhooks.

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
       ```bash
       cd backend
       docker-compose up -d db
       ```

    c. **Run the migration from your first terminal**. This command will apply any existing migrations and prompt you to create a new one if you've changed the schema.
       ```bash
       npx prisma migrate dev
       ```

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

## API Endpoints

### Auth
| Method | Path | Protected | Description |
|:---    |:---                   |:---       |:---             |
| `POST` | `/api/auth/register` | No        | Register a new user. |
| `POST` | `/api/auth/login`    | No        | Login and receive a JWT. |
| `GET`  | `/api/auth/me`       | Yes       | Get the current user's profile. |

### Users
| Method | Path | Protected | Description |
|:---    |:---                          |:---       |:---             |
| `PUT`  | `/api/users/me`               | Yes       | Update the current user's name. |
| `POST` | `/api/users/me/change-password`| Yes       | Change the current user's password. |
| `DELETE`| `/api/users/me`               | Yes       | Delete the current user's account. |

### Products
| Method | Path | Protected | Role | Description |
|:---    |:---                                 |:---       |:---      |:---             |
| `GET`  | `/api/products`                     | No        | -        | Get products. Accepts `search`, `category`, `sortBy`, `page`, `limit`. |
| `GET`  | `/api/products/suggestions`         | No        | -        | Get search suggestions (for autocomplete). |
| `GET`  | `/api/products/:id`                 | No        | -        | Get a single product by ID. |
| `GET`  | `/api/products/seller/my-products`| Yes       | `SELLER` | Get all products for the current seller. |
| `POST` | `/api/products`                     | Yes       | `SELLER` | Create a new product. |
| `PUT`  | `/api/products/:id`                 | Yes       | `SELLER` | Update your own product. |
| `DELETE`| `/api/products/:id`                 | Yes       | `SELLER` | Delete your own product. |

### Seller
| Method | Path | Protected | Role | Description |
|:---    |:---                                 |:---       |:---      |:---             |
| `GET`  | `/api/seller/dashboard`             | Yes       | `SELLER` | Get statistics for the seller dashboard. |
| `GET`  | `/api/seller/orders`                | Yes       | `SELLER` | Get a list of orders containing the seller's products. |
| `GET`  | `/api/seller/orders/:id`            | Yes       | `SELLER` | Get a single order by ID. |
| `PATCH`| `/api/seller/orders/:id/status`     | Yes       | `SELLER` | Update the status of an order. |

### Categories
| Method | Path | Protected | Description |
|:---    |:---                |:---       |:---             |
| `GET`  | `/api/categories`  | No        | Get a nested tree of all categories. |

### Cart
| Method | Path | Protected | Description |
|:---    |:---                        |:---       |:---             |
| `GET`  | `/api/cart`                 | Yes       | Get the user's current cart. |
| `POST` | `/api/cart/items`           | Yes       | Add an item to the cart. |
| `PUT`  | `/api/cart/items/:itemId`   | Yes       | Update the quantity of an item in the cart. |
| `DELETE`| `/api/cart/items/:itemId`   | Yes       | Remove an item from the cart. |

### Wishlists
| Method | Path | Protected | Description |
|:---    |:---                                         |:---       |:---             |
| `GET`  | `/api/wishlists`                            | Yes       | Get all wishlists for the current user. |
| `POST` | `/api/wishlists`                            | Yes       | Create a new wishlist. |
| `GET`  | `/api/wishlists/:id`                        | Yes       | Get a single wishlist by ID. |
| `PATCH`| `/api/wishlists/:id`                        | Yes       | Update (rename) a wishlist. |
| `DELETE`| `/api/wishlists/:id`                        | Yes       | Delete a wishlist. |
| `POST` | `/api/wishlists/:wishlistId/items`          | Yes       | Add a product to a wishlist. |
| `DELETE`| `/api/wishlists/items/by-product/:productId`| Yes       | Remove a product from the user's wishlists. |

### Reviews
| Method | Path | Protected | Description |
|:---    |:---                      |:---       |:---             |
| `GET`  | `/api/reviews/:productId`   | No        | Get all reviews for a product. |
| `POST` | `/api/reviews/:productId`   | Yes       | Create or update a review for a product (user must have purchased it). |

### Orders
| Method | Path | Protected | Description |
|:---    |:---                |:---       |:---             |
| `GET`  | `/api/orders`       | Yes       | Get the user's order history. |
| `GET`  | `/api/orders/:id`   | Yes       | Get a single order by ID. |
| `POST` | `/api/orders`       | Yes       | Create an order from the cart. |

### Payments
| Method | Path | Protected | Description |
|:---    |:---                          |:---       |:---             |
| `POST` | `/api/payments/create-intent` | Yes       | Create a Stripe Payment Intent. |
| `POST` | `/api/payments/webhook`       | No        | Stripe webhook for payment events. |

## License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for full details.  

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)