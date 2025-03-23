# 🛒 E-Commerce REST API

Welcome to the **E-Commerce REST API**! This project is a robust and scalable backend server built with **Express.js** to power an e-commerce platform. It provides authentication, business logic, and integrations with third-party services to handle users, products, orders, and payments.

---

## 🚀 Features

### 🔐 Authentication
- **Passport.js** for user authentication.
- **Express-session** to manage user sessions.
- Sessions are securely stored in **MongoDB**.

### 🗄️ Database
- **PostgreSQL** is used to store permanent data, ensuring reliability and scalability.

### 🛠️ Architecture
- **Models**, **Services**, and **Routes** are used to organize the codebase:
  - **Models**: Define the database schema.
  - **Services**: Handle business logic.
  - **Routes**: Expose RESTful endpoints.

### 🛍️ Business Logic
- Manage **users**, **products**, **orders**, **user information**, and **carts**.
- Protected routes for sensitive operations and public routes for general access.

### 💳 Payment Integration
- **Stripe Webhooks** are used to process payments seamlessly.

### ☁️ Image Uploads
- **Cloudinary** is integrated to handle image uploads efficiently.

---

## 📂 Project Structure
server/ 
├── src/ 
│ ├── ClassModels/ # Database models and logic to work with DB data 
│ ├── ServicesLogic/ # Business logic 
│ ├── Routes/ # API routes 
│ ├── Utilities/  
│ ├── config/ 
│ ├── DB/   
│ ├── DBQueries/  
│ ├── middleware/  
├── app.js
├── tests/ # Unit and integration tests 
├── index.js # Entry point 
├── jest.config.js # Testing configuration 
├── variables.env # Environment variables


---

## 🛠️ Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/e-commerce-rest-api.git
   cd e-commerce-rest-api/server

```markdown
2. Install dependencies:
    ```bash
    pnpm install
    ```
```

## 🔑 Environment Variables

Ensure you configure the following environment variables before running the project. Replace `your_data_fake` with your actual credentials:

```env
# Database Configuration
DATABASE_URL=postgresql://your_data_fake
MONGODB=mongodb+srv://your_data_fake

# Stripe Payment Integration
STRIPE_PUBLISHABLE_KEY=your_data_fake
STRIPE_SECRET_KEY=your_data_fake
WEBHOOK_ENDPOINT_SECRET=your_data_fake

# Cloudinary Image Uploads
CLOUDINARY_API_KEY=your_data_fake
CLOUDINARY_API_SECRET=your_data_fake
CLOUDINARY_CLOUD_NAME=your_data_fake
CLOUDINARY_URL=cloudinary://your_data_fake

# Application Configuration
NEXT_PUBLIC_HOST=your_data_fake
JWT_SECRET=your_data_fake

# Email Service
EMAIL_USER=your_data_fake
EMAIL_PASS=your_data_fake
```

---

## 🛠️ Start the Server

Follow these steps to start the server:

1. Ensure all dependencies are installed:
    ```bash
    pnpm install
    ```

2. Start the server:
    ```bash
    pnpm start
    ```

The server will start running on the configured host and port.

## 📖 API Documentation

### 🔐 Authentication
- **POST** `api/auth/login` - Log in a user.
- **POST** `api/auth/register` - Register a new user.
- **GET** `api/auth/logout` - Log out the current user.

### 🛍️ Products
- **GET** `api/products` - Retrieve all products.
- **POST** `api/products` - Add a new product (protected).

### 👤 Users
- **GET** `api/profile` - Retrieve user information (protected).
- **POST** `api/profile` - Add user information (protected).
- **PATCH** `api/profile` - Update user information (protected).

### 📦 Orders
- **GET** `api/orders` - Retrieve user orders (protected).
- **PATCH** `api/orders` - Update order information (protected).

### 🛒 Carts
- **GET** `api/cart` - Retrieve user cart (protected).
- **POST** `api/cart` - Create a new order (protected).

### 💳 Payments
- **POST** `/payments/webhook` - Stripe webhook to process payments.

---

## 🧪 Testing

Run unit and integration tests using **Jest**:

```bash
pnpm test
```

---

## 🌐 Technologies Used

- **Express.js**: Backend framework.
- **PostgreSQL**: Relational database.
- **MongoDB**: Session storage.
- **Passport.js**: Authentication.
- **Stripe**: Payment processing.
- **Cloudinary**: Image uploads.
- **Jest**: Testing framework.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
