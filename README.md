# Stacoll Web Application

A full-stack web application built with modern web technologies.

## Project Structure

This project is divided into two main directories:

- **`/frontend`**: The user interface built with Next.js and React.
- **`/backend`**: The API and server logic built with Elysia (Bun) and MongoDB.

## Technologies Used

### Frontend
- **Framework:** [Next.js](https://nextjs.org/)
- **UI Library:** [React](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** TypeScript

### Backend
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Runtime:** [Bun](https://bun.sh/)
- **Database:** MongoDB (using [Mongoose](https://mongoosejs.com/))
- **Environment Management:** dotenv
- **Language:** TypeScript

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) & npm (or yarn/pnpm)
- [Bun](https://bun.sh/)
- MongoDB (local or Atlas instance)

### Installation & Setup

#### 1. Clone the repository
```bash
git clone <your-repository-url>
cd stacoll-webapplication
```

#### 2. Backend Setup
```bash
cd backend
# Install dependencies
bun install

# Create a .env file and add your MongoDB URI
echo "MONGODB_URI=your_mongodb_connection_string" > .env

# Run the development server
bun run dev
```
The backend server will typically run on `http://localhost:3000` (or another port depending on your Elysia configuration).

#### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
# Install dependencies
npm install

# Run the development server
npm run dev
```
The frontend application will be available at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied by the backend).

## License
This project is licensed under the MIT License.
