# Metaverse API Documentation

## Security & Authentication
All endpoints, except for signup and login, require a valid JWT token passed in the `Authorization` header as a Bearer token:
`Authorization: Bearer <your_jwt_token>`

## Rate Limiting
To ensure system stability, the following rate limits apply:
- **Authentication**: 5 requests per minute.
- **General APIs**: 100 requests per minute.
- **Admin APIs**: 50 requests per minute.

## Rate Limiting
To ensure system stability, the following rate limits apply:
- **Authentication**: 5 requests per minute.
- **General APIs**: 100 requests per minute.
- **Admin APIs**: 50 requests per minute.

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

### List Avatars
- **Endpoint**: `GET /api/v1/avatars`
- **Response (200 OK)**:
  ```json
  {
    "avatars": [
      {
        "id": "string",
        "imageUrl": "string",
        "name": "string"
      }
    ]
  }
  ```

### Update Metadata
- **Endpoint**: `PUT /api/v1/user/metadata`
- **Request Body**:
  ```json
  {
    "avatarId": "string"
  }
  ```
- **Response (200 OK)**: Metadata updated successfully.

### Bulk Metadata
- **Endpoint**: `GET /api/v1/user/metadata/bulk?ids=[id1,id2]`
- **Note**: This endpoint supports up to 100 IDs per request for optimal performance.
- **Note**: This endpoint does not support pagination.
- **Response (200 OK)**:
  ```json
  {
    "avatars": [
      {
        "userId": "string",
        "avatarId": "string"
      }
    ]
  }
  ```

## Spaces

### Create Space
- **Endpoint**: `POST /api/v1/space`
- **Request Body**:
  ```json
  {
    "name": "string",
    "dimensions": "string",
    "mapId": "string"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "spaceId": "string"
  }
  ```

### Delete Space
- **Endpoint**: `DELETE /api/v1/space/:id`
- **Response (200 OK)**: Space deleted successfully.

### List All Spaces
- **Endpoint**: `GET /api/v1/space/all`
- **Response (200 OK)**:
  ```json
  {
    "spaces": [
      {
        "id": "string",
        "name": "string",
        "dimensions": "string",
        "thumbnail": "string"
      }
    ]
  }
  ```

## Admin

### Create Element
- **Endpoint**: `POST /api/v1/admin/element`
- **Request Body**:
  ```json
  {
    "imageUrl": "string",
    "width": "number",
    "height": "number",
    "static": "boolean"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "string"
  }
  ```

### Update Element
- **Endpoint**: `PUT /api/v1/admin/element/:id`
- **Request Body**:
  ```json
  {
    "imageUrl": "string"
  }
  ```
- **Response (200 OK)**: Element updated successfully.
### Create Map
- **Endpoint**: `POST /api/v1/admin/map`
- **Request Body**:
  ```json
  {
    "thumbnail": "string",
    "dimensions": "string",
    "name": "string",
    "defaultElements": [
      { "elementId": "string", "x": "number", "y": "number" }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "string"
  }
  ```
