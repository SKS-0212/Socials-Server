# Socials-Server

A monorepo backend for the Socials platform, built with Node.js and TypeScript. It includes multiple services for authentication, user management, and API gateway, organized for scalability and maintainability.

## Project Structure

- `packages/common`: Shared utilities and models used across all services.
- `services/api-gateway`: Handles routing and proxying requests to other services.
- `services/auth-service`: Manages authentication, email verification, and Google OAuth.
- `services/user-service`: Manages user data, profiles, and user-related operations.
- `Socials-bruno`: Bruno API collections for testing endpoints.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PNPM package manager
- MongoDB (local or remote instance)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/SKS-0212/Socials-Server.git
   cd Socials-Server
   ```

2. Install dependencies:

   ```sh
   pnpm install
   ```

3. Configure environment variables for each service:

   - Copy each service's `env.example.txt` to `.env`
   - Update the values with your configuration

   ```sh
   cd services/api-gateway
   cp env.example.txt .env
   # Repeat for other services
   ```

4. Start services:

   ```sh
   pnpm run start
   ```

   Or, to start services individually:

   ```sh
   pnpm run --filter auth-service start
   pnpm run --filter user-service start
   pnpm run --filter api-gateway start
   ```

5. For development mode with auto-restart:
   ```sh
   pnpm run dev
   ```

## Services

### API Gateway

The API Gateway serves as the entry point for all client requests and routes them to the appropriate services.

- Port: 3000 (default)
- Main endpoints:
  - `/auth/*`: Routes to auth-service
  - `/users/*`: Routes to user-service
  - `/health`: Health check endpoint

### Auth Service

Handles all authentication and authorization related operations.

- Port: 3001 (default)
- Features:
  - Email/password authentication
  - Google OAuth
  - JWT token management
  - Email verification

### User Service

Manages user profiles and related data.

- Port: 3002 (default)
- Features:
  - User profile management
  - Username availability check
  - User data retrieval and updates

## API Testing with Bruno

The project includes a complete set of Bruno API collections for testing endpoints.

1. Install Bruno: https://www.usebruno.com/
2. Open the `Socials-bruno` directory in Bruno
3. Use the collections to test API endpoints

## Docker Support

The project includes Docker configuration for containerized deployment.

To build and run with Docker:

```sh
# Build the Docker image
docker build -t socials-server .

# Run the container
docker run -p 3000:3000 socials-server
```

## Development

### Monorepo Commands

- Build all packages and services:

  ```sh
  pnpm run build
  ```

- Run tests:

  ```sh
  pnpm test
  ```

- Lint code:
  ```sh
  pnpm lint
  ```

## License

MIT
