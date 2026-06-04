# Stacoll Web Application

Stacoll is a full-stack web application designed as a skill wallet, allowing users to manage, showcase, and verify their professional skills. Built with modern web technologies, it features secure authentication, cloud-based image storage, and a responsive user interface.

## 🚀 Features

- **User Authentication**: Secure signup and login with OTP verification (via Resend) or **Google OAuth2** for seamless access.
- **Profile Management**: Users can update their bio, title, projects, and upload profile pictures (stored in **Cloudinary**).
- **Skill Management**: Showcasing and verifying skills with custom icons.
- **Admin Dashboard**: For managing available skills and categories.

## 🏗️ Project Architecture

This project is structured into two main directories:

- **`/frontend`**: The user interface built with Next.js (App Router) and React.
- **`/backend`**: The RESTful API and server logic built with Elysia (Bun) and MongoDB.

## 🛠️ Technologies Used

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** TypeScript

### Backend
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Runtime:** [Bun](https://bun.sh/)
- **Database:** MongoDB (using [Mongoose](https://mongoosejs.com/))
- **Authentication:** JWT, Google OAuth2, Resend (OTP)
- **Cloud Storage:** [Cloudinary](https://cloudinary.com/) (for image uploads)
- **Language:** TypeScript

## ⚙️ Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) & npm (or yarn/pnpm)
- [Bun](https://bun.sh/)
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository

```bash
git clone <repository-url> stacoll-webapplication
cd stacoll-webapplication
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
bun install
```

**Environment Variables:**
Create a `.env` file in the `backend` directory based on the following template:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string

# SMTP settings for OTP Emails (Using Resend or similar)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=your_resend_api_key
SMTP_FROM='"Stacoll Admin" <onboarding@resend.dev>'

# JWT Secret
JWT_SECRET=super_secret_key_change_me_in_production

# Google OAuth2 (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Frontend URL (for redirecting after OAuth)
FRONTEND_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Run the backend server:**
```bash
bun run dev
```
The backend server will run on `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install
```

**Environment Variables:**
Create a `.env.local` (or `.env`) file in the `frontend` directory:

```env
# Base URL for the backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Run the frontend development server:**
```bash
npm run dev
```
The frontend application will be available at `http://localhost:3000`.

## 🚢 Deployment Notes

- **Frontend:** Easily deployable on [Vercel](https://vercel.com/). Ensure you set the `NEXT_PUBLIC_API_URL` environment variable to your production backend URL.
- **Backend:** Can be deployed on platforms like [Render](https://render.com/), Railway, or any VPS that supports Bun or Node.js Docker containers. Remember to update the `FRONTEND_URL` and `GOOGLE_REDIRECT_URI` environment variables for the production environment. Also, update the Google Cloud Console with your production redirect URIs.

## 📄 License
This project is licensed under the MIT License.
