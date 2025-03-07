# API Documentation - blog-nodejs-api

This documentation describes the API developed with Express and PostgreSQL for blog management. The API allows creating, reading, updating, and deleting blog records stored in PostgreSQL, with access restrictions for modification methods.

---

## Table of Contents

- [Technologies Used](#technologies-used)
- [Installation and Configuration](#installation-and-configuration)
- [Environment Variables](#environment-variables)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [ID Management](#id-management)
- [Security](#security)
- [Endpoints](#endpoints)
  - [GET /](#get-)
  - [GET /:id](#get-id)
  - [POST /](#post-)
  - [PUT /:id](#put-id)
  - [DELETE /:id](#delete-id)
  - [POST /admin/reorganize-ids](#post-adminreorganize-ids)
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
- **dotenv** – Loading environment variables.
- **cors** – Middleware for enabling CORS.
- **helmet** – Middleware for HTTP security.
- **express-rate-limit** – Limits requests by IP.
- **express-validator** – Data validation for requests.
- **winston** – Logging system for the application.

---

## Installation and Configuration

1. **Clone the repository:**

   ```bash
   git clone https://github.com/esdrassantos06/blog-nodejs-api
   cd blog-nodejs-api
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```
   
3. **Environment variables file configuration (.env):**

   Create a `.env` file in the project root and define the following variables:

   ```bash
   DATABASE_URI=postgres://username:password@host:port/database
   PORT=3000
   API_KEY=your_secret_key_here
   ALLOWED_ORIGINS=http://localhost:3000,https://yoursite.com
   NODE_ENV=production
   ```
   
   Make sure to replace `postgres://username:password@host:port/database` with your PostgreSQL connection URL and `your_secret_key_here` with a strong and unique API key.

## Environment Variables

- `DATABASE_URI`: PostgreSQL database connection URL.
- `PORT`: Port on which the server will run (default: 3000).
- `API_KEY`: Secret key to authorize modification operations (POST, PUT, DELETE).
- `ALLOWED_ORIGINS`: List of allowed origins for CORS (comma-separated).
- `NODE_ENV`: Execution environment (development, production).

## Data Model

The data model used is **Blog** with the following fields:

```json
{
  "id": "Integer (auto-increment)", // Sequential numeric ID automatically generated
  "title": "String", // Blog title. Required, between 1 and 200 characters.
  "author": "String", // Blog author. Required, between 1 and 100 characters.
  "description": "String", // Blog description or content. Maximum 5000 characters.
  "age": "Integer", // Integer between 0 and 150.
  "createdAt": "Date", // Record creation date (automatically generated)
  "updatedAt": "Date" // Last update date (automatically generated)
}
```

---

## Authentication

This API implements a token-based authentication system to protect data modification operations:

- **GET** endpoints are public and can be accessed by anyone without authentication (except administrative routes).
- **POST**, **PUT**, **DELETE** endpoints and all **/admin/** routes require API token authentication.

To use protected methods, you must include the authorization header in your requests:

```
Authorization: Bearer your_secret_key_here
```

Where `your_secret_key_here` must match the key defined in the `API_KEY` environment variable.

### Using Postman to Access Protected Methods

1. Open Postman and create a new request
2. Select the desired method (POST, PUT, or DELETE)
3. Enter your API URL
4. In the "Headers" tab, add:
   - Key: `Authorization`
   - Value: `Bearer your_secret_key_here`
5. For POST and PUT methods, configure the request body in the "Body" tab:
   - Select "raw" and "JSON"
   - Add the JSON with the blog data
6. Click "Send" to send the request

If the authentication is correct, the API will process your request. Otherwise, you will receive a 401 error (Unauthorized).

---

## Security

The API implements several security layers:

- **Helmet**: HTTP headers configuration for protection against common vulnerabilities
- **Rate Limiting**: Limit of 100 requests per IP in 15-minute windows
- **Payload Size Limitation**: Maximum of 1MB for JSON requests
- **SSL Verification**: In production environment, requires valid SSL connections
- **Configurable CORS**: Origin restriction based on environment configuration
- **Input Validation**: Strict verification of all received data

---

## ID Management

The API implements an advanced ID management system to keep blog records in sequential order:

### ID Reorganization Features

- **Reset and Reordering**: `reorganizeIds` function to reset and reorder blog post IDs
- **Automatic Sequence Adjustment**: Updates PostgreSQL ID sequence during initialization
- **Sorting by ID**: Returns blogs sorted by ID in the main GET route
- **Administration Route**: Specific endpoint for manual ID reorganization
- **Reorganization After Deletion**: Automatic ID reorganization after a blog deletion
- **Error Handling**: Robust error handling and logging system

### How It Works

1. **During initialization**: The system adjusts the PostgreSQL sequence to match the existing maximum ID
2. **After deletion**: When a blog is deleted, all IDs are automatically reorganized
3. **Maintenance**: An administrative route allows triggering reorganization manually when needed

This functionality ensures that IDs remain sequential and without gaps, facilitating navigation and reference to blog records.

---

## Data Validation

The API uses express-validator to ensure all received data meets the defined criteria:

- **title**: Required string between 1 and 200 characters
- **author**: Required string between 1 and 100 characters
- **description**: Optional string with maximum 5000 characters
- **age**: Optional integer between 0 and 150
- **id**: Validation in route parameters to ensure they are integers

Validation errors are returned with status 400 and include details about each invalid field.

---

## Logging

The API implements a complete logging system with Winston:

- **Console**: In development environment, logs are also displayed in the console
- **Log Levels**: 
  - INFO: Normal operations, initialization, resource creation
  - ERROR: System failures, database errors
  - WARN: Unauthorized access attempts
  - DEBUG: SQL query logs (when enabled)

Logs include timestamps and contextual details to facilitate debugging.

---

## Endpoints

### **GET /**

**Description:** Returns all registered blogs, sorted by ID.

**Request:**

- **Method:** `GET`
- **URL:** `/`
- **Authentication:** Not required

**Success Response (200):**

```json
[
  {
    "id": 1,
    "title": "My First Blog",
    "author": "John Smith",
    "description": "Blog description...",
    "age": 30,
    "createdAt": "2025-03-06T10:00:00.000Z",
    "updatedAt": "2025-03-06T10:00:00.000Z"
  },
  {
    "id": 2,
    "title": "Another Blog",
    "author": "Mary Johnson",
    "description": "Another description...",
    "age": 25,
    "createdAt": "2025-03-06T11:30:00.000Z",
    "updatedAt": "2025-03-06T11:30:00.000Z"
  }
]
```

**Error Response (500):**

```json
{
  "message": "Internal server error"
}
```

---

### **GET /:id**

**Description:** Returns a specific blog based on the provided ID.

**Request:**

- **Method:** `GET`
- **URL:** `/:id`
- **Authentication:** Not required
- **Validation:** ID must be an integer

**Success Response (200):**

```json
{
  "id": 1,
  "title": "My First Blog",
  "author": "John Smith",
  "description": "Blog description...",
  "age": 30,
  "createdAt": "2025-03-06T10:00:00.000Z",
  "updatedAt": "2025-03-06T10:00:00.000Z"
}
```

**Error Response (404):**

```json
{
  "message": "Blog not Found"
}
```

**Error Response (400) - Validation:**

```json
{
  "errors": [
    {
      "param": "id",
      "msg": "ID must be an integer",
      "location": "params"
    }
  ]
}
```

---

### **POST /**

**Description:** Creates a new blog.

**Request:**

- **Method:** `POST`
- **URL:** `/`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer your_secret_key_here`
- **Validation:** 
  - title: Required string between 1 and 200 characters
  - author: Required string between 1 and 100 characters
  - description: Optional string with maximum 5000 characters
  - age: Optional integer between 0 and 150

**Body:**

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
  "createdAt": "2025-03-07T15:20:30.000Z",
  "updatedAt": "2025-03-07T15:20:30.000Z"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

**Error Response (400) - Validation:**

```json
{
  "errors": [
    {
      "param": "title",
      "msg": "Title must be between 1 and 200 characters",
      "location": "body"
    }
  ]
}
```

---

### **PUT /:id**

**Description:** Updates an existing blog based on the provided ID.

**Request:**

- **Method:** `PUT`
- **URL:** `/:id`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer your_secret_key_here`
- **Validation:**
  - id: Must be an integer
  - title: Optional string between 1 and 200 characters
  - author: Optional string between 1 and 100 characters
  - description: Optional string with maximum 5000 characters
  - age: Optional integer between 0 and 150

**Body:**

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

**Error Response (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

**Error Response (400) - Validation:**

```json
{
  "errors": [
    {
      "param": "age",
      "msg": "Age must be between a and 150",
      "location": "body"
    }
  ]
}
```

---

### **DELETE /:id**

**Description:** Deletes a blog based on the provided ID and automatically reorganizes IDs.

**Request:**

- **Method:** `DELETE`
- **URL:** `/:id`
- **Headers:**
  - `Authorization: Bearer your_secret_key_here`
- **Validation:** ID must be an integer

**Success Response (200):**

```json
{
  "message": "Blog deleted successfully"
}
```

**Error Response (404):**

```json
{
  "message": "Blog not Found"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

**Error Response (400) - Validation:**

```json
{
  "errors": [
    {
      "param": "id",
      "msg": "ID must be an integer",
      "location": "params"
    }
  ]
}
```

---

### **POST /admin/reorganize-ids**

**Description:** Manually reorganizes the IDs of all blogs in the database.

**Request:**

- **Method:** `POST`
- **URL:** `/admin/reorganize-ids`
- **Headers:**
  - `Authorization: Bearer your_secret_key_here`

**Success Response (200):**

```json
{
  "message": "IDs successfully reorganized"
}
```

**Error Response (401):**

```json
{
  "message": "Unauthorized. Missing or invalid token."
}
```

**Error Response (500):**

```json
{
  "message": "Internal server error"
}
```

---

## Error Handling

The API implements error handling at multiple levels:

- **Error Middleware**: Captures unhandled exceptions and returns standardized messages
- **Request Validation**: Verifies input data before processing
- **Exception Handling**: Try/catch in all database operations
- **Error Logging**: Detailed recording of all errors for debugging
- **Process Handlers**: Capturing of unhandled exceptions and rejected promises at the process level
- **Appropriate HTTP status codes**: Proper use of status codes (400, 401, 404, 500)

---

## Request and Response Examples

### **Example of creating a new blog (POST)**

**Request:**

```http
POST / HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer your_secret_key_here

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
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:45:20.000Z"
}
```

---

### **Example of updating a blog (PUT)**

**Request:**

```http
PUT /4 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer your_secret_key_here

{
  "title": "How to learn Node.js - Updated",
  "author": "Carlos Eduardo",
  "description": "Updated content with new tips.",
  "age": 32
}
```

**Response:**

```json
{
  "id": 4,
  "title": "How to learn Node.js - Updated",
  "author": "Carlos Eduardo",
  "description": "Updated content with new tips.",
  "age": 32,
  "createdAt": "2025-03-07T16:45:20.000Z",
  "updatedAt": "2025-03-07T16:50:15.000Z"
}
```

---

### **Example of manual ID reorganization (POST)**

**Request:**

```http
POST /admin/reorganize-ids HTTP/1.1
Host: localhost:3000
Authorization: Bearer your_secret_key_here
```

**Response:**

```json
{
  "message": "IDs successfully reorganized"
}
```

---

## Running the Application

**Start the server:**

```bash
npm run start
```

**Access:**

The server will be running on the port defined in the environment variable (default: `3000`).

Example: [http://localhost:3000](http://localhost:3000)

**Logs:**

The application generates logs in the terminal.