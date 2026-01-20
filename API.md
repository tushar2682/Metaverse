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
- DELETE `/api/v1/space/:id`
- GET `/api/v1/space/all`

## Admin
- POST `/api/v1/admin/element`
- PUT `/api/v1/admin/element/:id`
- POST `/api/v1/admin/map`
