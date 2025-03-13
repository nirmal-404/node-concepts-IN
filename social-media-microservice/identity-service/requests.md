# Register Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3001/api/auth/register`

## Request Body

```json
{
    "username": "username",
    "email": "email@example.com",
    "password": "password"
}
```

## Response (Success)

```json
{
    "success": true,
    "message": "User registered successfully !",
    "accessToken": "<accessToken>",
    "refreshToken": "<refreshToken>"
}
```