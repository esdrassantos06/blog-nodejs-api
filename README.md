# API Documentation - blog-nodejs-api

This documentation describes the API developed with Express and PostgreSQL for blog management. The API allows creating, reading, updating, and deleting blog records stored in PostgreSQL, with access restrictions using JWT-based authentication.

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Installation and Configuration](#installation-and-configuration)
- [Environment Variables](#environment-variables)
- [Data Models](#data-models)
- [Authentication and Authorization](#authentication-and-authorization)
- [Security](#security)
- [Endpoints](#endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Blog Endpoints](#blog-endpoints)
- [Data Validation](#data-validation)
- [Logging](#logging)
- [Request and Response Examples](#request-and-response-examples)
- [Running the Application](#running-the-application)
- [Error Handling](#error-handling)

---

## Technologies Used

- **Node.js** – JavaScript runtime environment.
- **Express** – Web framework for Node.js.
- **PostgreSQL** – Relational SQL database.
- **Sequelize** – ORM (Object-Relational Mapping) for PostgreSQL.
- **JWT** - JSON Web Tokens for authentication.
- **bcrypt** - Password hashing.
- **dotenv** – Loading environment variables.
- **cors** – Middleware for enabling CORS.
- **helmet** – Middleware for HTTP security.
- **express-rate-limit** – Limits requests by IP.
- **express-validator** and **zod** – Data validation for requests.
- **winston** – Logging system for the application.
- **xss-clean** - XSS protection.
- **mongo-sanitize** - NoSQL injection protection (even though using PostgreSQL).

---

## Project Structure

The project follows a modular architecture for better organization and maintenance:

```
src/
├── config/            # Configurations
│   ├── database.js    # Sequelize configuration
│   ├── logger.js      # Winston configuration
│   └── server.js      # Express configuration
├── controllers/       # Controllers
│   ├── authController.js # Authentication
│   └── blogController.js # Blog operations
├── middlewares/       # Middlewares
│   ├── auth.js        # Authentication
│   ├── error.js       # Error handling
│   ├── validator.js   # Express-validator
│   └── zodValidator.js # Zod validation
├── models/            # Models
│   ├── blog.js        # Blog model
│   └── user.js        # User model
├── routes/            # Routes
│   ├── authRoutes.js  # Authentication routes
│   └── blogRoutes.js  # Blog routes
├── services/          # Services (business logic)
│   ├── authService.js # Authentication service
│   └── blogService.js # Blog service
└── app.js             # Application entry point
```

This structure follows the principles of separation of concerns, making the code more maintainable and easier to test.

---

## Installation and Configuration

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/blog-nodejs-api
   cd blog-nodejs-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up PostgreSQL database:**

   - Install PostgreSQL if not already installed
   - Create a new database for the application
   - Create a user with appropriate permissions
   - Note the connection details for the `.env` file
   
   Example PostgreSQL setup commands:
   ```sql
   CREATE DATABASE blogapi;
   CREATE USER bloguser WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE blogapi TO bloguser;
   ```

4. **Environment variables file configuration (.env):**

   Create a `.env` file in the project root and define the following variables:

   ```bash
   # Database Configuration
   DATABASE_URI=postgres://username:password@host:port/database
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development  # Options: development, production, test
   
   # Security Configuration
   JWT_SECRET=your_jwt_secret_key_here  # Use a strong, random string
   ALLOWED_ORIGINS=http://localhost:3000,https://yoursite.com
   
   # Logging Configuration
   LOG_LEVEL=info  # Options: error, warn, info, debug
   ```
   
   Make sure to replace the values with your actual configuration.
   
   **Notes:**
   - For `JWT_SECRET`, use a strong, unique random string (min. 32 characters)
   - In production, ensure SSL is enabled in your `DATABASE_URI` and set `NODE_ENV=production`
   - For local development, `ALLOWED_ORIGINS` can be set to `*` to allow all origins
   
5. **Initialize database tables:**

   The application will automatically create database tables on first run through Sequelize. No additional setup is required.

## Environment Variables

- `DATABASE_URI`: PostgreSQL database connection URL.
- `PORT`: Port on which the server will run (default: 3000).
- `JWT_SECRET`: Secret key for JWT token generation and validation.
- `ALLOWED_ORIGINS`: List of allowed origins for CORS (comma-separated).
- `NODE_ENV`: Execution environment (development, production).
- `LOG_LEVEL`: Logging level (info, error, debug, etc.)

## Data Models

### User Model

```json
{
  "id": "Integer (auto-increment)",
  "username": "String (unique, 3-30 chars)",
  "email": "String (unique, valid email)",
  "password": "String (hashed, 6-100 chars)",
  "role": "String (enum: user, editor, admin)",
  "isActive": "Boolean (default: true)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Blog Model

```json
{
  "id": "Integer (auto-increment)",
  "title": "String (1-200 chars)",
  "author": "String (1-100 chars)",
  "description": "String (max 5000 chars)",
  "age": "Integer (0-150)",
  "isDeleted": "Boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Authentication and Authorization

This API implements JWT-based authentication with role-based access control:

### JWT Authentication

- The application uses JSON Web Tokens (JWT) for stateless authentication
- Tokens are signed using the JWT_SECRET environment variable
- Tokens contain user data including ID, username, and role
- Tokens expire after 24 hours by default
- The authentication flow is handled in the `auth.js` middleware and `authService.js`

### Initial Setup - Creating the First Admin

Because user registration requires admin privileges, you'll need to manually insert the first admin user into the database:

```sql
INSERT INTO "Users" (
  username, 
  email, 
  password, 
  role, 
  "isActive", 
  "createdAt", 
  "updatedAt"
) VALUES (
  'admin', 
  'admin@example.com', 
  '$2b$10$YOUR_HASHED_PASSWORD', -- Generate using bcrypt with 10 rounds
  'admin', 
  true, 
  NOW(), 
  NOW()
);
```

For development, you can use a pre-hashed password. For example, the bcrypt hash of "admin123" with 10 rounds is:
`$2b$10$FGYGfLOBtLFiVdSmlJGq4etaGIUYqIoLYOeUUgCR52g.IQ3amckZq`

### Authentication Flow

1. **Admin user creation:**
   - The first admin user is created via direct database insertion
   - Only admin users can register new users via the API

2. **User login:**
   - Users authenticate via `/auth/login` with username and password
   - A JWT token is returned upon successful authentication
   - The token must be included in subsequent requests to protected endpoints

3. **Authenticated requests:**
   - Include the token in the Authorization header:
     ```
     Authorization: Bearer your_jwt_token
     ```
   - The server validates the token and extracts user information
   - Access to endpoints is controlled based on the user's role

### Role-Based Permissions

The API implements a hierarchical role system:

- **Guest** (Unauthenticated):
  - Can view blogs (GET endpoints)
  - No access to create, update, or delete operations
  - No access to administrative endpoints

- **User** (Authenticated, basic role):
  - Same permissions as Guest
  - Authenticated but with no additional permissions
  - Useful for future features like commenting or liking blogs

- **Editor** (Authenticated, elevated role):
  - All permissions of User
  - Can create new blogs (POST /)
  - Can update existing blogs (PUT /:id)
  - Cannot delete blogs or access admin endpoints

- **Admin** (Authenticated, highest role):
  - Full access to all endpoints
  - Can register new users (POST /auth/register)
  - Can delete blogs (DELETE /:id)
  - Can restore deleted blogs (POST /:id/restore)
  - Access to all administrative functions

### Authentication Middleware

The API uses two main middleware functions for security:

1. **authenticate**: Verifies the JWT token and attaches user data to the request
2. **authorize**: Checks if the authenticated user has the required role

These middleware functions can be applied to any route to protect it:

```javascript
// Example of a protected route for admins only
router.post('/admin-only-route', 
  authenticate,           // First, verify the token
  authorize('admin'),     // Then, check if user is an admin
  controller.adminAction  // Finally, execute the controller function
);
```

The middleware can also accept an array of roles:

```javascript
// Route accessible to both editors and admins
router.put('/:id',
  authenticate,
  authorize(['editor', 'admin']),
  controller.updateAction
);
```

---

## Security

The API implements comprehensive security measures across multiple layers:

### Network and Transport Security

- **HTTPS/SSL**: In production, the API should be deployed behind HTTPS
- **SSL Verification**: PostgreSQL connection uses SSL in production mode
- **Configurable CORS**: 
  - Origin restriction through the `ALLOWED_ORIGINS` environment variable
  - Supports multiple origins with comma-separated list
  - Methods and headers are strictly controlled

### Authentication and Authorization

- **JWT Implementation**: 
  - Tokens are signed using HMAC-SHA256 (HS256) algorithm
  - Tokens include expiration time (24 hours)
  - Contains minimal user data (id, username, role)
  
- **Password Security**:
  - Passwords are hashed using bcrypt with 10 rounds of salting
  - Original passwords are never stored or logged
  - Password validation enforces minimum length (6 characters)

- **Role-Based Access Control**:
  - Granular permissions based on user roles
  - Hierarchical role structure (admin > editor > user > guest)
  - Each endpoint is specifically protected based on required permissions

### Request Protection

- **Helmet**: Sets secure HTTP headers to protect against:
  - XSS attacks
  - Clickjacking
  - MIME type sniffing
  - And other common web vulnerabilities

- **Rate Limiting**: 
  - General limit: 100 requests per IP in 15-minute windows
  - Login endpoint: 10 attempts per IP in 15-minute windows
  - Helps prevent brute force and DoS attacks

- **Request Sanitization**:
  - XSS Protection: Using xss-clean middleware to sanitize input
  - NoSQL Injection Protection: Using express-mongo-sanitize
  - Payload Size Limitation: Maximum of 1MB for JSON requests

### Data Validation

- **Dual-layer Validation**:
  - Express-validator for authentication routes
  - Zod schema validation for blog routes
  - All user input is validated before processing

- **Schema Enforcement**:
  - Sequelize models include field-level validation
  - Type checking and constraint validation at the database level
  - Prevents invalid data from entering the system

### Logging and Monitoring

- **Comprehensive Logging**:
  - Authentication attempts (successful and failed)
  - Authorization failures
  - API access patterns
  - Error conditions

- **Error Handling**:
  - Structured error responses
  - Error details hidden in production mode
  - All errors logged for monitoring

### Implementation Best Practices

- **Principle of Least Privilege**:
  - Each role has only the permissions it needs
  - Admin-only operations are strictly controlled

- **Defense in Depth**:
  - Multiple security layers working together
  - No single point of security failure
  - Security at transport, application, and database levels

---

## Endpoints

### Authentication Endpoints

#### **POST /auth/register**

**Description:** Registers a new user. Only accessible to administrators.

**Request:**
- **Method:** `POST`
- **URL:** `/auth/register`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer your_jwt_token` (admin token required)
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"  // Optional, defaults to "user"
  }
  ```

**Success Response (201):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:20:30.000Z"
}
```

**Error Response (409):**
```json
{
  "message": "Username or email already exists"
}
```

#### **POST /auth/login**

**Description:** Authenticates a user and returns a JWT token.

**Request:**
- **Method:** `POST`
- **URL:** `/auth/login`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-03-07T15:20:30.000Z",
    "updatedAt": "2025-03-07T15:20:30.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

### Blog Endpoints

#### **GET /**

**Description:** Returns blogs with pagination, searching, and filtering options.

**Request:**
- **Method:** `GET`
- **URL:** `/?page=1&limit=10&search=keyword&author=name&title=something&minAge=18&maxAge=60&sortBy=createdAt&sortOrder=DESC`
- **Authentication:** Not required
- **Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search term in title, author, or description
  - `author`: Filter by author name 
  - `title`: Filter by title
  - `minAge`: Minimum age value
  - `maxAge`: Maximum age value
  - `sortBy`: Field to sort by (id, title, author, age, createdAt, updatedAt)
  - `sortOrder`: Sort direction (ASC or DESC)

**Success Response (200):**
```json
{
  "totalItems": 25,
  "totalPages": 3,
  "currentPage": 1,
  "items": [
    {
      "id": 1,
      "title": "My First Blog",
      "author": "John Smith",
      "description": "Blog description...",
      "age": 30,
      "isDeleted": false,
      "createdAt": "2025-03-06T10:00:00.000Z",
      "updatedAt": "2025-03-06T10:00:00.000Z"
    },
    // More items...
  ]
}
```

#### **GET /:id**

**Description:** Returns a specific blog based on the provided ID.

**Request:**
- **Method:** `GET`
- **URL:** `/:id`
- **Authentication:** Not required

**Success Response (200):**
```json
{
  "id": 1,
  "title": "My First Blog",
  "author": "John Smith",
  "description": "Blog description...",
  "age": 30,
  "isDeleted": false,
  "createdAt": "2025-03-06T10:00:00.000Z",
  "updatedAt": "2025-03-06T10:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Blog not found"
}
```

#### **POST /**

**Description:** Creates a new blog.

**Request:**
- **Method:** `POST`
- **URL:** `/`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer your_jwt_token`
- **Body:**
  ```json
  {
    "title": "New Blog",
    "author": "Ana Paula",
    "description": "Content of the new blog...",
    "age": 28
  }
  ```

**Success Response (201):**
```json
{
  "id": 3,
  "title": "New Blog",
  "author": "Ana Paula",
  "description": "Content of the new blog...",
  "age": 28,
  "isDeleted": false,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:20:30.000Z"
}
```

**Error Response (401):**
```json
{
  "message": "Unauthorized. Authentication required."
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden. Insufficient permissions."
}
```

#### **PUT /:id**

**Description:** Updates an existing blog based on the provided ID.

**Request:**
- **Method:** `PUT`
- **URL:** `/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer your_jwt_token`
- **Body:**
  ```json
  {
    "title": "Updated Blog",
    "author": "Ana Paula",
    "description": "Updated description...",
    "age": 29
  }
  ```

**Success Response (200):**
```json
{
  "id": 3,
  "title": "Updated Blog",
  "author": "Ana Paula",
  "description": "Updated description...",
  "age": 29,
  "isDeleted": false,
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:25:10.000Z"
}
```

**Error Response (404):**
```json
{
  "message": "Blog not found"
}
```

#### **DELETE /:id**

**Description:** Soft deletes a blog based on the provided ID (sets isDeleted to true).

**Request:**
- **Method:** `DELETE`
- **URL:** `/:id`
- **Headers:**
  - `Authorization: Bearer your_jwt_token`

**Success Response (200):**
```json
{
  "message": "Blog deleted successfully"
}
```

**Error Response (404):**
```json
{
  "message": "Blog not found or already deleted"
}
```

#### **POST /:id/restore**

**Description:** Restores a soft-deleted blog.

**Request:**
- **Method:** `POST`
- **URL:** `/:id/restore`
- **Headers:**
  - `Authorization: Bearer your_jwt_token`

**Success Response (200):**
```json
{
  "message": "Blog restored successfully"
}
```

**Error Response (404):**
```json
{
  "message": "Blog not found or not deleted"
}
```

---

## Data Validation

The API uses both express-validator and zod to ensure all received data meets defined criteria:

### Express Validator (Auth Routes)
- **username**: String between 3-30 characters
- **email**: Valid email format
- **password**: String with minimum 6 characters
- **role**: Optional, must be one of: 'user', 'editor', 'admin'

### Zod Validator (Blog Routes)
- **title**: String between 1-200 characters
- **author**: String between 1-100 characters
- **description**: Optional string with maximum 5000 characters
- **age**: Optional integer between 0-150
- **id**: Must be a numeric value in route parameters

Validation errors are returned with status 400 and include details about each invalid field.

---

## Logging and Monitoring

The API implements a comprehensive logging system using Winston, one of the most popular logging libraries for Node.js applications.

### Winston Logging Configuration

The logging configuration is managed in `src/config/logger.js` and uses environment variables to control behavior:

```javascript
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

export default logger;
```

### Log Levels and Their Usage

The API uses standard log levels with specific purposes:

- **ERROR** (`error`): 
  - System failures that prevent correct operation
  - Database connection failures
  - Unhandled exceptions
  - JWT verification failures
  - Usage: `logger.error('Critical error occurred', { details })`

- **WARNING** (`warn`): 
  - Unauthorized access attempts
  - Validation failures
  - Soft error conditions that don't prevent system operation
  - Usage: `logger.warn('Invalid login attempt', { username })`

- **INFO** (`info`): 
  - Server startup and shutdown
  - Database connection established
  - Resource creation/modification/deletion
  - User login/logout events
  - Usage: `logger.info('Server started on port 3000')`

- **DEBUG** (`debug`): 
  - SQL queries (when enabled)
  - Request/response details
  - Authentication flow details
  - Detailed operation tracing
  - Usage: `logger.debug('Processing request', { requestBody })`

### Log Format

Logs are structured for both human readability and machine parsing:

- **Development Environment**:
  - Colorized console output
  - Simplified format for readability

- **Production Environment**:
  - JSON formatted logs
  - Includes timestamps, log level, and message
  - Structured data for easy parsing by log aggregation tools

### Log Contents

Each log entry includes:

- **Timestamp**: When the event occurred
- **Log Level**: Severity of the event
- **Message**: Human-readable description
- **Contextual Data**: Relevant objects or variables (excluding sensitive information)

### Example Log Output

```
[2025-03-07T14:23:45.123Z] INFO: Server started on port 3000
[2025-03-07T14:24:12.456Z] INFO: Database connection established successfully
[2025-03-07T14:25:30.789Z] WARN: Authentication failure: Invalid credentials for user 'testuser'
[2025-03-07T14:26:45.012Z] ERROR: Database query failed: relation "nonexistent_table" does not exist
```

### Monitoring Recommendations

For production deployment, consider extending the logging system with:

1. **File Transport**: Save logs to rotating files
2. **External Log Aggregation**: Send logs to services like ELK Stack, Graylog, or CloudWatch
3. **Error Alerting**: Configure alerts for ERROR level logs
4. **Performance Monitoring**: Add APM tools like New Relic or Datadog

### How to Adjust Log Levels

Set the `LOG_LEVEL` environment variable to control verbosity:

- For production: `LOG_LEVEL=info` (default)
- For troubleshooting: `LOG_LEVEL=debug`
- For minimal logging: `LOG_LEVEL=error`

---

## Request and Response Examples

### Register a new user

**Request:**
```http
POST /auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "neweditor",
  "email": "editor@example.com",
  "password": "password123",
  "role": "editor"
}
```

**Response:**
```json
{
  "id": 2,
  "username": "neweditor",
  "email": "editor@example.com",
  "role": "editor",
  "isActive": true,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:45:20.000Z"
}
```

### Login

**Request:**
```http
POST /auth/login HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "username": "neweditor",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "neweditor",
    "email": "editor@example.com",
    "role": "editor",
    "isActive": true,
    "createdAt": "2025-03-07T16:45:20.000Z",
    "updatedAt": "2025-03-07T16:45:20.000Z"
  }
}
```

### Creating a new blog

**Request:**
```http
POST / HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "How to learn Node.js",
  "author": "Carlos Eduardo",
  "description": "Tips and tricks to master Node.js.",
  "age": 31
}
```

**Response:**
```json
{
  "id": 4,
  "title": "How to learn Node.js",
  "author": "Carlos Eduardo",
  "description": "Tips and tricks to master Node.js.",
  "age": 31,
  "isDeleted": false,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:45:20.000Z"
}
```

### Getting blogs with filtering

**Request:**
```http
GET /?page=1&limit=10&search=Node.js&sortBy=createdAt&sortOrder=DESC HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "totalItems": 1,
  "totalPages": 1,
  "currentPage": 1,
  "items": [
    {
      "id": 4,
      "title": "How to learn Node.js",
      "author": "Carlos Eduardo",
      "description": "Tips and tricks to master Node.js.",
      "age": 31,
      "isDeleted": false,
      "createdAt": "2025-03-07T16:45:20.000Z",
      "updatedAt": "2025-03-07T16:45:20.000Z"
    }
  ]
}
```

---

## Running the Application

### Starting the Server

The application can be started in different modes depending on your needs:

**Production Mode:**
```bash
npm run start
```

**Development Mode with Enhanced Logging:**
```bash
NODE_ENV=development LOG_LEVEL=debug npm run start
```

**With Custom Port:**
```bash
PORT=8080 npm run start
```

**Full Custom Configuration:**
```bash
NODE_ENV=development PORT=8080 LOG_LEVEL=debug npm run start
```

### Server Initialization Process

When started, the application follows this initialization sequence:

1. Loads environment variables from `.env` file
2. Configures the Express server with security middleware
3. Initializes the database connection
4. Synchronizes database models with the database schema
5. Sets up routes and error handlers
6. Starts listening on the configured port

Successful initialization is indicated by this log message:
```
🚀 Server running on port [PORT]
```

### Access and Testing

The server will be running on the port defined in the environment variable (default: `3000`).

**Local Access:**
- API: [http://localhost:3000](http://localhost:3000)
- Health Check: [http://localhost:3000/health](http://localhost:3000/health)

### Initial Setup Tasks

After starting the server for the first time:

1. Create the first admin user via direct database insertion
2. Login with this admin to get a JWT token
3. Use the token to create additional users through the API

### Deployment Considerations

For production deployment, consider:

1. **Process Management**:
   - Use a process manager like PM2:
     ```bash
     npm install -g pm2
     pm2 start src/app.js --name "blog-api"
     ```
   - Or deploy with Docker using the included Dockerfile

2. **Environment Variables**:
   - Set secure, production-appropriate environment variables
   - Use a secrets management solution for sensitive values

3. **Database Connection**:
   - Ensure the database connection uses SSL in production
   - Consider connection pooling for high traffic

4. **SSL/TLS**:
   - Always deploy behind HTTPS in production
   - Can be handled by a reverse proxy like Nginx or AWS load balancer

5. **Monitoring**:
   - Set up monitoring for the application
   - Configure alerts for error conditions

---

## Error Handling

The API implements a robust, multi-layered error handling architecture designed to provide user-friendly responses while ensuring comprehensive debugging capabilities.

### Error Handling Architecture

The error handling implementation spans several architectural layers:

#### 1. Global Error Middleware

Located in `src/middlewares/error.js`, this middleware acts as a safety net to catch any unhandled exceptions throughout the application:

```javascript
// Global middleware to handle errors
const errorMiddleware = (err, req, res, next) => {
    // Log the full error details
    logger.error(`Unhandled error: ${err.message}`, { 
        stack: err.stack,
        method: req.method,
        path: req.path
    });

    // Determine the appropriate status code
    const statusCode = err.status || err.statusCode || 500;

    // Send error response
    res.status(statusCode).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
```

Key features:
- Captures all uncaught errors
- Logs detailed error information for debugging
- Returns appropriate HTTP status codes
- Only includes stack traces in development mode

#### 2. Not Found Route Handler

A dedicated middleware handles requests to non-existent routes:

```javascript
export const notFoundMiddleware = (req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
};
```

#### 3. Service-Level Exception Handling

All service methods use try/catch blocks to handle expected and unexpected errors:

```javascript
async getBlogById(id) {
    try {
        return await Blog.findOne({
            where: {
                id,
                isDeleted: false
            }
        });
    }
    catch (error) {
        logger.error(`Error fetching blog ${id}: ${error.message}`);
        throw error;
    }
}
```

#### 4. Controller-Layer Error Management

Controllers handle service errors and translate them to appropriate HTTP responses:

```javascript
async getBlog(req, res) {
    try {
        const blog = await blogService.getBlogById(req.params.id);
        if (!blog) return res.status(404).json({ message: "Blog not found" });
        res.json(blog);
    } catch (err) {
        logger.error(`Controller error fetching blog: ${err.message}`);
        res.status(500).json({ message: "Internal server error" });
    }
}
```

#### 5. Process-Level Exception Handling

Uncaught exceptions and unhandled promise rejections are captured at the Node.js process level:

```javascript
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});
```

### Error Response Standards

The API uses consistent error response formats and appropriate HTTP status codes:

#### HTTP Status Codes

- **400 Bad Request**: Invalid input data or validation failure
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authentication succeeded but permission denied
- **404 Not Found**: Requested resource does not exist
- **409 Conflict**: Resource already exists (e.g., duplicate username)
- **500 Internal Server Error**: Unexpected server error

#### Error Response Format

```json
{
  "message": "Human-readable error message",
  "errors": [
    {
      "param": "field_name",
      "msg": "Specific validation error message",
      "location": "body"
    }
  ]
}
```

The `errors` array is only included for validation errors.

### Validation Error Handling

#### Express-validator

```json
{
  "errors": [
    {
      "param": "username",
      "msg": "Username must be between 3 and 30 characters",
      "location": "body",
      "value": "ab"
    }
  ]
}
```

#### Zod Validation

```json
{
  "message": "Validation error",
  "errors": {
    "body": {
      "_errors": [],
      "title": {
        "_errors": [
          "String must contain at least 1 character(s)"
        ]
      }
    }
  }
}
```

### Debugging Errors

When troubleshooting production errors:

1. Check logs for the full error details (including stack trace)
2. Error timestamps in logs can be correlated with client requests
3. In development mode, stack traces are included in responses
4. Setting `LOG_LEVEL=debug` provides additional context

### Error Handling Best Practices

The API implementation follows these error handling best practices:

1. **Fail Fast**: Validate input early in the request lifecycle
2. **Fail Securely**: No sensitive information in error messages
3. **Be Specific**: Error messages help clients understand the issue
4. **Be Consistent**: Error format remains consistent across endpoints
5. **Log Thoroughly**: Detailed logs for debugging without exposing details to clients