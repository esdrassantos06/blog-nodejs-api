# Blog API - RESTful API with Node.js, Express & PostgreSQL

A RESTful API for blog management with JWT authentication, role-based authorization, and comprehensive error handling.

## Key Features

- **Tech Stack**: Node.js, Express, PostgreSQL, Sequelize ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **Authorization**: Role-based access control (admin > editor > user)
- **Security**: Helmet, CORS, XSS protection, rate limiting
- **Validation**: Express-validator & Zod
- **Documentation**: Swagger/OpenAPI

## Quick Start

## Documentation

API documentation is available at:
https://blog-api.apidocumentation.com/guide/getting-started-with-the-blog-api

### Prerequisites

- Node.js v20.x
- Docker
- npm or yarn or bun

### Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/esdrassantos06/blog-nodejs-api.git
cd blog-nodejs-api
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
bun install
```

3. **Start PostgreSQL database with Docker Compose**

### The project includes a docker-compose.yml file to easily spin up a PostgreSQL container:

```bash
docker-compose up -d
```

This will create a PostgreSQL database with the following configuration:

- User: docker
- Password: docker
- Database: polls
- Port: 5433 (host) → 5432 (container)

*Note: Make sure port 5433 is available on your machine.*



4. **Configure environment variables**

Create a `.env` file in the project root:

```
# Database
DATABASE_URI=postgres://docker:docker@localhost:5433/polls

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:3000,

# Logging
LOG_LEVEL=info
```

5. **Start the server**

```bash
npm start
```

## Initial Admin Account Setup

Since registration requires admin privileges, create the first admin directly in the database:

```sql
INSERT INTO "Users" (
  username, email, password, role, "isActive", "createdAt", "updatedAt"
) VALUES (
  'admin',
  'admin@example.com',
  'yourHashedPass', -- use testhash.js
  'admin',
  true,
  NOW(),
  NOW()
);
```

## Authentication

1. **Login**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

2. **Use the returned JWT token for authenticated requests**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"username":"editor","email":"editor@example.com","password":"password123","role":"editor"}'
```

## API Endpoints

### Authentication

- `POST /auth/login` - Login and get JWT token
- `POST /auth/register` - Register new user (admin only)

### Users (admin only)

- `GET /users/all` - List all users (optional `?inactive=true`)
- `GET /users/:id` - Get user by ID
- `DELETE /users/:id` - Deactivate user (soft delete)
- `POST /users/:id/restore` - Restore deactivated user

### Blogs

- `GET /` - List blogs with pagination and filters
  - Filters: `page, limit, search, author, title, minAge, maxAge, sortBy, sortOrder`
- `GET /:id` - Get specific blog
- `POST /` - Create new blog (editor/admin)
- `PUT /:id` - Update blog (editor/admin)
- `DELETE /:id` - Remove blog (admin)
- `POST /:id/restore` - Restore removed blog (admin)

## Project Structure

```
src/
├── config/            # Server, database, logger configurations
├── controllers/       # Route controllers
├── middlewares/       # Auth, validation, error handlers
├── models/            # Data models
├── routes/            # API routes
├── services/          # Business logic
└── app.js             # Application entry point
```

## Authorization Hierarchy

- **Admin**: Full access to all operations
- **Editor**: Can create and modify blogs
- **User**: Read-only access
- **Guest**: Public access to blog listings

## License

[MIT License](LICENSE)
