# Gauri Cooks - Food Ordering Platform

This is the frontend for "Gauri Cooks", a modern, full-stack food ordering application built with React. It features separate user and admin dashboards, robust authentication, and a responsive, intuitive user interface.

## ✨ Features

### User Features
- **Authentication**: Secure user registration and login with email/password and Google OAuth2.
- **Password Management**: Forgot password and reset password functionality.
- **Menu Browsing**: View available food items on the user dashboard.
- **Shopping Cart**: Add/remove items, adjust quantities, and view the total price.
- **Order Placement**: Place orders with the number of people and special instructions.
- **Profile Management**: View and update personal details (name, email, phone number) and change password.
- **Order History**: View past orders and their statuses on the profile page.

### Admin Features
- **Admin Dashboard**: View key statistics like total users, items, and orders.
- **User Management**: View all users, edit user details (name, email, role), and add new admins.
- **Item Management**: Add, edit, and delete food items from the menu.
- **Order Management**: View all user orders, see order details, and update order statuses (e.g., Pending, Confirmed, Completed).

### Technical Features
- **JWT Authentication**: Secure API communication using JSON Web Tokens with automatic token refresh.
- **Role-Based Access Control**: Protected routes for users and admins.
- **Responsive Design**: A mobile-first, fully responsive UI built with Tailwind CSS.
- **Client-Side Routing**: Seamless navigation powered by React Router.
- **API Integration**: Asynchronous communication with the backend API via Axios.
- **State Management**: Centralized authentication state using React Context.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **State Management**: [React Context](https://reactjs.org/docs/context.html), [TanStack Query](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repository-url>
    cd V1-frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables. This file is included in the [`.gitignore`](.gitignore) and should not be committed to version control.

    ```env
    # The base URL of your backend API
    VITE_API_BASE_URL=http://localhost:8080/api

    # Your Google Client ID for OAuth2 authentication
    VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
    ```

### Running the Application

-   **Development Mode:**
    This command starts the Vite development server with hot-reloading.
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

-   **Production Build:**
    This command builds the application for production in the `dist` folder.
    ```sh
    npm run build
    ```

-   **Preview Production Build:**
    This command serves the production build locally.
    ```sh
    npm run preview
    ```

## 📜 Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm run lint`: Lints the source code using ESLint.
-   `npm run preview`: Serves the production build locally.

## 📁 Project Structure

The project follows a feature-oriented structure:

```
src/
├── assets/         # Static assets like images and fonts
├── components/     # Reusable UI components
│   ├── admin/      # Components specific to the admin dashboard
│   ├── auth/       # Login, Register forms
│   ├── common/     # Shared components (Button, Card, Modal)
│   └── user/       # Components specific to the user dashboard
├── contexts/       # React contexts (e.g., AuthContext)
├── layouts/        # Layout wrappers for different parts of the app
├── pages/          # Page components mapped to routes
│   ├── admin/
│   ├── public/
│   └── user/
├── router/         # Protected route components
├── services/       # API client configuration (apiClient.js)
├── styles/         # Global styles
└── main.jsx        # Main application entry point
```