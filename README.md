# Metaverse 2D - Virtual Workspace Platform

Metaverse 2D is a sophisticated virtual workspace platform inspired by the concepts taught in the 100xDevs cohort. It allows users to interact in a 2D environment, manage digital avatars, and create customizable spaces for collaboration and social interaction.

## Project Overview

This project implements a high-performance backend system for a 2D Metaverse. It features a robust permission system, real-time spatial interactions, and a fully customizable map and element engine.

### Key Capabilities
- **Virtual Avatars**: Users can select and customize their digital presence.
- **Dynamic Spaces**: Create, manage, and interact within virtual rooms.
- **Admin Engine**: Powerful tools for managing elements, maps, and world constraints.
- **RESTful API**: A clean, scalable API architecture for frontend integration.

## Technical Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM (Scalable relational schema)
- **Testing**: Jest with Axios for API level validation
- **Authentication**: JWT (JSON Web Tokens) based secure auth flow

## Architecture

The system follows a modular architecture:
1. **Controller Layer**: Handles HTTP requests and response formatting.
2. **Middleware Layer**: Manages authentication, validation, and error handling.
3. **Logic Layer**: Implements core business rules for spatial interactions.
4. **Data Access Layer**: Provides an abstraction over the PostgreSQL database using Prisma.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tushar2682/Metaverse.git
   cd Metaverse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/metaverse"
   JWT_SECRET="your_secret_key"
   PORT=3000
   ```

## Running the Server

- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```