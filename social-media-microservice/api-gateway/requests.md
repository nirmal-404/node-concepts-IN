# Register Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3000/v1/auth/register`

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


# Login Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3000/v1/auth/login`

## Request Body

```json
{
    "email": "email@example.com",
    "password": "password"
}
```

## Response (Success)

```json
{
    "accessToken": "<accessToken>",
    "refreshToken": "<refreshToken>",
    "userId": "<userId>"
}
```



# Refresh Token Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3000/v1/auth/refresh-token`

## Request Body

```json
{
    "refreshToken" : "<refreshToken>"
}
```

## Response (Success)

```json
{
    "accessToken": "<accessToken>",
    "refreshToken": "<refreshToken>"
}
```




# Logout Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3000/v1/auth/logout`

## Request Body

```json
{
    "refreshToken" : "<refreshToken>"
}
```

## Response (Success)

```json
{
    "success": true,
    "message": "User logged out successfully"
}
```


# Add post Endpoint Demo Request

## Endpoint

**URL:**\
`POST http://localhost:3000/v1/posts/create-post`

## Request Body

```json
{
    "content" : "<content>"
}
```

## Response (Success)

```json
{
    "success": true,
    "message": "Post created successfully"
}
```


# Get all posts Endpoint Demo Request

## Endpoint

**URL:**\
`GET http://localhost:3000/v1/posts/all-posts`


## Response (Success)

```json
{
    "posts": [
        {
            "_id": "",
            "user": "",
            "content": "",
            "mediaIds": [],
            "createdAt": "",
            "updatedAt": "",
            "__v": 0
        },

    ],
    "currentpage": <pgno>,
    "totalPages": <total_pages>,
    "totalPosts": ,tototal_posts
}
```


# Get a single post Endpoint Demo Request

## Endpoint

**URL:**\
`GET http://localhost:3000/v1/posts/67d52a9ce48b9fdb1c25ac4c`


## Response (Success)

```json
{
    "_id": "",
    "user": "",
    "content": "",
    "mediaIds": [],
    "createdAt": "",
    "updatedAt": "",
    "__v": 
}
```