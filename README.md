# 🐾 Pet Store Web App (Frontend + Backend)

This is a full-stack e-commerce web application for a pet store built using **Angular 18 (Frontend)** and **Node.js + MongoDB (Backend)**.

---

## Tech Stack

- **Frontend**: Angular 18, HTML, CSS, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Version Control**: Git & GitHub

---

## Features

- 🐶 Product listing with images and prices  
- 🛒 Add to cart & remove from cart  
- 🔍 View product details in a popup  
- 👩‍💼 Admin panel for managing products  
- 📡 API integration with MongoDB backend  

---
## 📸 Screenshots
![Home Page](screenshots/home.png)
![Sign Up Page](screenshots/signup.png)
![Sign in Page](screenshots/signin.png)
![Product list Page](screenshots/productlist.png)
![Cart Page](screenshots/cart.png)
![Checkout Page](screenshots/checkout.png)
![Order history Page](screenshots/cart.png)
![Admin Page](screenshots/adminpanel.png)
![Order management Page](screenshots/ordermanagement.png)
![Product management Page](screenshots/productmanagement.png)

---
## 📁 Project Structure

project-root/
├── backend/                    # Node.js backend server
│   ├── config/                 # Database configuration and environment settings
│   ├── controllers/           # Logic to handle requests and responses
│   ├── models/                # Mongoose models (schemas)
│   ├── routes/                # API route definitions
│   ├── app.js                 # Main backend entry point
│   ├── package.json           # Backend dependencies and scripts
│   └── package-lock.json
│
├── frontend/                  # Angular frontend application
│   ├── .angular/              # Angular internal settings
│   ├── .vscode/               # VS Code workspace settings
│   ├── node_modules/          # Frontend dependencies
│   ├── public/                # Public assets (if any)
│   └── src/
│       ├── app/               # Angular components and services
│       │   ├── admin-panel/   # Admin features (e.g., product management)
│       │   ├── cart/          # Cart component and logic
│       │   ├── checkout/      # Checkout functionality
│       │   ├── guards/        # Route guards (e.g., auth protection)
│       │   ├── home/          # Homepage UI and logic
│       │   ├── order-history/ # Display past orders
│       │   ├── pages/         # Common or shared pages
│       │   ├── product-list/  # Product listing component
│       │   ├── profile/       # User profile component
│       │   ├── api.service.ts         # API service for backend communication
│       │   ├── api.service.spec.ts    # Test file for API service
│       │   ├── app.component.html     # Main component HTML
│       │   └── app.component.css      # Styling for main component
│
├── README.md                  # Project documentation
└── .gitignore                 # Files to ignore in git

