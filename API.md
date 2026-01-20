# Metaverse API Documentation

## Authentication

### Signup
- **Endpoint**: `POST /api/v1/signup`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "type": "admin" | "user"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "userId": "string"
  }
  ```

### Login
- **Endpoint**: `POST /api/v1/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "string"
  }
  ```

## User
- PUT `/api/v1/user/metadata`
- GET `/api/v1/user/metadata/bulk`

## Spaces
- POST `/api/v1/space`
- DELETE `/api/v1/space/:id`
- GET `/api/v1/space/all`

## Admin
- POST `/api/v1/admin/element`
- PUT `/api/v1/admin/element/:id`
- POST `/api/v1/admin/map`
