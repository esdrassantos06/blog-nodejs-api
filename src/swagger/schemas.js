/**
 * @swagger
 * components:
 *  schemas:
 *    Blog:
 *      type: object
 *      required:
 *        - title
 *        - author
 *      properties:
 *        id:
 *          type: integer
 *          description: Unique blog ID
 *        title:
 *          type: string
 *          description: Blog title
 *        author:
 *          type: string
 *          description: Blog author
 *        description:
 *          type: string
 *          description: Blog content
 *        age:
 *          type: integer
 *          description: Age related to content
 *        isDeleted:
 *          type: boolean
 *          description: Indicates if the blog has been deleted
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: Creation date
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: Last update date
 *      example:
 *        id: 1
 *        title: "Introduction to Node.js"
 *        author: "John Smith"
 *        description: "A practical guide to Node.js"
 *        age: 25
 *        isDeleted: false
 *        createdAt: "2025-03-07T12:00:00Z"
 *        updatedAt: "2025-03-07T12:00:00Z"
 *
 *    User:
 *      type: object
 *      required:
 *        - username
 *        - email
 *        - password
 *      properties:
 *        id:
 *          type: integer
 *          description: Unique user ID
 *        username:
 *          type: string
 *          description: Username
 *        email:
 *          type: string
 *          format: email
 *          description: User email
 *        role:
 *          type: string
 *          enum: [user, editor, admin]
 *          description: User permissions
 *        isActive:
 *          type: boolean
 *          description: User status
 *        createdAt:
 *          type: string
 *          format: date-time
 *          description: Creation date
 *        updatedAt:
 *          type: string
 *          format: date-time
 *          description: Last update date
 *      example:
 *        id: 1
 *        username: "johnsmith"
 *        email: "john@example.com"
 *        role: "editor"
 *        isActive: true
 *        createdAt: "2025-03-07T12:00:00Z"
 *        updatedAt: "2025-03-07T12:00:00Z"
 *
 *    Error:
 *      type: object
 *      properties:
 *        message:
 *          type: string
 *          description: Error message
 *      example:
 *        message: "Internal server error"
 */

/**
 * @swagger
 * tags:
 *   - name: Blogs
 *     description: Blog management operations
 *   - name: Authentication
 *     description: Authentication and registration operations
 *   - name: Users
 *     description: User management operations
 */