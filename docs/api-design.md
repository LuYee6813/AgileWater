# Agile Water Server API Design

All request and response are in JSON format.

Overall, it follows the RESTful style.

[toc]

## `/auth`

### POST `/login`

Login with username and password.

#### Request Body

```json
{
  "username": "admin",
  "password": "password"
}
```

#### Response Body

##### 200 - Success

Return a session token.

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIn0.6WIxhNowaUHh4FvcedDL6AqOjcfqPphPcDwX0SwZf7c"
}
```

##### 401 - Unauthorized

Invalid username or password

### POST `/register`

Regiser a new user.

#### Request Body

```json
{
  "username": "user",
  "password": "password",
  "nickname": "User"
}
```

#### Response Body

##### 201 - Created

Return a new user.

```json
{
  "username": "user",
  "nickname": "User",
  "admin": false
}
```

##### 409 - Conflict

User is exist. (Two users with the same username cannot exist at the same time.)

## `/users`

### GET `/`

Get all user list.

> Permission:
>
> - logged with valid session
> - admin user

#### Response Body

##### 200 - Success

```json
[
  {
    "username": "user",
    "nickname": "User",
    "admin": true
  },
  {
    "username": "user2",
    "nickname": "User 2",
    "admin": false
  },
]
```

##### 401 - Unauthorized

Invalid session.

### POST `/`

Create a new user.

>  Permission:
>
> - logged with valid session
> - admin user

#### Request Body

```json
{
  "username": "user",
  "password": "password",
  "nickname": "User",
  "admin": true
}
```

#### Response Body

##### 201 - Created

Return a new user.

```json
{
  "username": "user",
  "nickname": "User",
  "admin": true
}
```

##### 401 - Unauthorized

Invalid session.

##### 409 - Conflict

User is exist. (Two users with the same username cannot exist at the same time.)

### PUT `/{username}`

Update specific user information.

> Permission:
>
> - logged with valid session
> - Admin user: 
>   - Can modify any user's information
> - General user:
>   - Can only modify his own information.

#### Request Body

```json
{
  "password": "new password", // optional
  "nickname": "new nickname", // optional
  "admin": true // optional
}
```

#### Response Body

##### 200 - Success

```json
{
  "username": "user",
  "nickname": "User",
  "admin": true // optional
}
```

##### 401 - Unauthorized

Invalid session.

##### 403 - Forbidden

General user can't modify other user's information.

### DELETE `/{username}`

> Permission:
>
> - logged with valid session
> - Admin user: 
>   - Can deleter any user's information
> - General user:
>   - Can only delete his own information.

#### Response Body

##### 204 - No Content

Success delete a user.

##### 401 - Unauthorized

Invalid session.

##### 403 - Forbidden

General user can't delete other user's information.

## `/water_dispensers`

### GET `/`

Get water dispensers list.

Permission:

> Permission:
>
> - logged with valid session

#### Params

- `offset`
- `limit` - optional
- `lat`: search latitude - optional
- `lng`: search longitude - optional
- `radius`: search radius - optional
- `iced`: is have iced? - optional
- `warm`: is have warm? - optional
- `hot`: is have hot? - optional
- `name` - optional

#### Response Body

##### 200 - Success

```json
[
    {
        "sn":4,
        "lat":"25.08271",
        "lng":"121.5829",
        "access":"公開",
        "name":"碧湖公園",
        "addr":"",
        "iced":"no",
        "cold":"no",
        "warm":"yes",
        "hot":"no",
        "opening_hours":"00:00 - 00:00",
        "description":"閱覽室門口。24HR",
        "rate":0.0,
        "review":[]
    },
    {
        "sn":5,
        "lat":"24.79562",
        "lng":"120.9967",
        "access":"公開",
        "name":"",
        "addr":"",
        "iced":"no",
        "cold":"yes",
        "warm":"yes",
        "hot":"yes",
        "opening_hours":"",
        "description":"研發飲水機",
        "rate":0.0,
        "review":[]
    },
    {
        "sn":6,
        "lat":"24.99223",
        "lng":"121.5407",
        "access":"公開",
        "name":"捷運景美站",
        "addr":"",
        "iced":"no",
        "cold":"yes",
        "warm":"yes",
        "hot":"no",
        "opening_hours":"06:00 - 23:00",
        "description":"靠1號出口直飲台，有方便裝水的設計",
        "rate":0.0,
        "review":[]
    },
]
```

### GET `/{water_dispenser_sn}`

Get a detail information of water dispenser.

Permission:

> Permission:
>
> - logged with valid session

#### Response Body

##### 200 - Success

```json
{
    "sn":4,
    "lat":"25.08271",
    "lng":"121.5829",
    "access":"公開",
    "name":"碧湖公園",
    "addr":"",
    "iced":"no",
    "cold":"no",
    "warm":"yes",
    "hot":"no",
    "opening_hours":"00:00 - 00:00",
    "description":"閱覽室門口。24HR",
    "rate":0.0,
    "review":[]
}
```

##### 401 - Unauthorized

Invalid session.

##### 404 - Not Found

Invalid water dispenser sn.

### POST `/{water_dispenser_sn}/review`

Create a new review for water dispenser.

> Permission:
>
> - logged with valid session

#### Request Body

```json
{
  "star": "1.0", // range: 1.0 ~ 5.0
  "content": "噴水池，不是飲水機"
}
```

#### Response Body

##### 201 - Created

```json
{
  "sn": 1056,
  "time": "2020.08.30",
  "star": "1.0",
  "content": "噴水池，不是飲水機",
  "name": "K",
  "img": "1717044665_v5usawmfygl.png",
  "usn": 32476,
  "cmnt_img": "1718570502_octphcunrb0.png",
  "stolen": true // Indicates that the comment was stolen.
}
```

##### 401 - Unauthorized

Invalid session.

##### 404 - Not Found

Invalid water dispenser sn.

### PUT `/{water_dispenser_sn}/review/{review_sn}`

Update review for water dispenser.

> Permission:
>
> - logged with valid session

#### Request Body

```json
{
  "star": "1.0", // optional
  "content": "噴水池，不是飲水機" // optional
}
```

#### Response Body

##### 200 - Success

```json
{
  "sn": 1056,
  "time": "2020.08.30",
  "star": "1.0",
  "content": "噴水池，不是飲水機",
  "name": "K",
  "img": "1717044665_v5usawmfygl.png",
  "usn": 32476,
  "cmnt_img": "1718570502_octphcunrb0.png",
  "stolen": true // Indicates that the comment was stolen.
}
```

##### 401 - Unauthorized

Invalid session.

##### 404 - Not Found

Invalid water dispenser sn or review sn.

### DELETE `/{water_dispenser_sn}/review/{review_sn}`

Delete review for water dispenser.

> Permission:
>
> - logged with valid session
> - Admin user: 
>   - Can deleter any user's review
> - General user:
>   - Can only delete his own review

#### Response Body

##### 204 - No Content

Success delete a review.

##### 401 - Unauthorized

Invalid session.

##### 404 - Not Found

Invalid water dispenser sn or review sn.

## Middleware

### Auth

If a point has a permission tag of **logged with valid session**, it needs to carry the session token in the header folder.

#### Example Header

```
GET /water_dispensers HTTP/1.1
Host: server.example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIXVCJ9TJV...r7E20RMHrHDcEfxjoYZgeFONFh7HgQ
```

## General Errors

##### 400 - Bad Request

Contains invalid data or is incorrectly formatted.

##### 401 - Unauthorized

Invalid session.

##### 404 - Not Found

Invalid path.

##### 500 - Internal Server Error

Unexpected server errors.

### Example Response

```json
HTTP/1.1 400 Bad Request
Content-Type: application/json
Location: http://server.example.com/users

{
  "errors": [
    {
      "error": "Invalid request data",
      "message": "nickname: Expected string but got number"
    }
  ]
}
```

