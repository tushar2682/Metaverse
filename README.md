# Metaverse 2D: Next-Generation Virtual Workspace

Metaverse 2D is a high-performance, scalable virtual workspace platform. It enables users to interact in a seamless 2D environment, manage customizable digital avatars, and build unique spaces for collaboration, social interaction, and productivity.

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

## Quick Start

Get the system up and running in minutes:
1. **Bootstrap**: `npm install`
2. **Environment**: Setup `.env` with your DB credentials.
3. **Database**: `npx prisma migrate dev`
4. **Launch**: `npm run dev`

## Architecture

The system follows a modular architecture:
1. **Controller Layer**: Handles HTTP requests and response formatting.
2. **Middleware Layer**: Manages authentication, validation, and error handling.
3. **Logic Layer**: Implements core business rules for spatial interactions.
4. **Data Access Layer**: Provides an abstraction over the PostgreSQL database using Prisma.

## Project Folder Structure

```text
├── Tests/            # Integration and Unit Test Suite
├── prisma/           # Database Schema and Migrations
├── src/              # Source Code (Controllers, Middleware, Logic)
├── .env.example      # Environment Configuration Template
├── README.md         # Project Documentation
└── jest.config.js    # Test Runner Configuration
```

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

## Contributing

We welcome contributions to the Metaverse 2D project!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.