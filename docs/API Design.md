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

#### Response Header

```
X-Total-Count: 2 // total users
```

### GET `/current`

Get current user.

> Permission:
>
> - logged with valid session

#### Response Body

##### 200 - Success

```json
{
  "username": "user",
  "nickname": "User",
  "admin": true
}
```

##### 401 - Unauthorized

Invalid session.

### GET `/{username}`

Get user by username.

> Permission:
>
> - logged with valid session

#### Response Body

##### 200 - Success

```json
{
  "username": "user",
  "nickname": "User",
  "admin": true
}
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

##### 403 - Forbidden

Only admin user can create a new user.

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
  "admin": true // optional, only admin user can modify this
}
```

#### Response Body

##### 200 - Success

```json
{
  "username": "user",
  "nickname": "User",
  "admin": true
}
```

##### 401 - Unauthorized

Invalid session.

##### 403 - Forbidden

General user can't modify other user's information.

##### 404 - Not Found

User not found.

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

##### 404 - Not Found

User not found.

## `/water_dispensers`

### GET `/`

Get water dispensers list.

Permission:

> Permission:
>
> - logged with valid session

#### Params

- `offset` - optional (default: `0`)
- `limit` - optional (default: `10`, `-1` = unlimited)
- `lat`: search latitude - optional
- `lng`: search longitude - optional
- `radius`: search radius (meters, `-1` = unlimited) - optional
- `iced`: is have iced? - optional
- `cold`: is have cold? - optional
- `warm`: is have warm? - optional
- `hot`: is have hot? - optional
- `name` - optional
- `sort` - optional (default: `distance`)

#### Response Body

##### 200 - Success

```json
[
  {
    "sn": 22812,
    "type": "飲水機",
    "location": {
      "lng": 121.513152,
      "lat": 24.986225
    },
    "name": "崇南市民活動中心",
    "addr": "新北市中和區景新街496巷26弄2號", // optional
    "iced": false,
    "cold": false,
    "warm": false,
    "hot": false,
    "openingHours": "00:00~00:00", // optional
    "description": "",
    "rate": 3,
    "photos": [],
    "path": "",
    "reviews": [
      {
        "sn": 1,
        "username": "littlemay Tseng",
        "cmntImg": "", // optional
        "star": 3,
        "content": "水很好喝",
        "time": "2024-05-24T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 3,
        "username": "test",
        "star": 1,
        "content": "阿巴阿巴qwq",
        "time": "2024-12-07T23:17:51.219Z",
        "stolen": false
      },
      {
        "sn": 4,
        "username": "test",
        "star": 5,
        "content": "阿巴阿巴",
        "time": "2024-12-07T23:18:20.338Z",
        "stolen": false
      }
    ],
    "distance": 253.17609315769488 // optional, only show when lat, lng provided
  },
  {
    "sn": 8858,
    "type": "飲水機",
    "location": {
      "lng": 121.5131,
      "lat": 24.98884
    },
    "name": "遠傳中和景新門市",
    "iced": false,
    "cold": true,
    "warm": true,
    "hot": false,
    "openingHours": "12:00 - 21:30", // optional
    "description": "",
    "rate": 3,
    "photos": [
      "1650752839_wff5jr4ru3u.png"
    ],
    "path": "/app/fup",
    "reviews": [
      {
        "sn": 1,
        "username": "Bally Hsu",
        "cmntImg": "", // optional
        "star": 3,
        "content": "水很好喝",
        "time": "2024-07-19T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 2,
        "username": "User-1676056597",
        "cmntImg": "", // optional
        "star": 3,
        "content": "極力推薦",
        "time": "2024-07-05T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 3,
        "username": "朱朱",
        "cmntImg": "", // optional
        "star": 3,
        "content": "特別的奉茶站",
        "time": "2024-03-22T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 4,
        "username": "朱朱",
        "cmntImg": "", // optional
        "star": 3,
        "content": "特別的奉茶站",
        "time": "2023-01-22T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 5,
        "username": "朱朱",
        "cmntImg": "", // optional
        "star": 3,
        "content": "特別的奉茶站",
        "time": "2022-11-18T16:00:00.000Z",
        "stolen": true
      }
    ],
    "distance": 277.4015784103799 // optional, only show when lat, lng provided
  },
  {
    "sn": 20964,
    "type": "飲水機",
    "location": {
      "lng": 121.518178,
      "lat": 24.984615
    },
    "name": "新和國民小學",
    "addr": "新北市新店區永安里3鄰安和路三段100號", // optional
    "iced": true,
    "cold": false,
    "warm": true,
    "hot": false,
    "openingHours": "17:50~20:30", // optional
    "description": "室外1樓 。公休日：周末、例假日。",
    "rate": 3,
    "photos": [],
    "path": "",
    "reviews": [
      {
        "sn": 1,
        "username": "Bally Hsu",
        "cmntImg": "", // optional
        "star": 3,
        "content": "極力推薦",
        "time": "2024-07-19T16:00:00.000Z",
        "stolen": true
      }
    ],
    "distance": 420.96827743993316 // optional, only show when lat, lng provided
  }
]
```

#### Response Header

```
X-Total-Count: 14384 // total items found with the filter
```

### GET `/{water_dispenser_sn}`

Get a detail information of water dispenser.

Permission:

> Permission:
>
> - logged with valid session

#### Params

- `lat`: current latitude to caculate distance - optional
- `lng`: current longitude to caculate distance - optional

#### Response Body

##### 200 - Success

```json
{
  "sn": 22812,
  "type": "飲水機",
  "location": {
    "lng": 121.513152,
    "lat": 24.986225
  },
  "name": "崇南市民活動中心",
  "addr": "新北市中和區景新街496巷26弄2號", // optional
  "iced": false,
  "cold": false,
  "warm": false,
  "hot": false,
  "openingHours": "00:00~00:00", // optional
  "description": "",
  "rate": 3,
  "photos": [],
  "path": "",
  "reviews": [
    {
      "sn": 1,
      "username": "littlemay Tseng",
      "cmntImg": "", // optional
      "star": 3,
      "content": "水很好喝",
      "time": "2024-05-24T16:00:00.000Z",
      "stolen": true
    },
    {
      "sn": 3,
      "username": "test",
      "star": 1,
      "content": "阿巴阿巴qwq",
      "time": "2024-12-07T23:17:51.219Z",
      "stolen": false
    },
    {
      "sn": 4,
      "username": "test",
      "star": 5,
      "content": "阿巴阿巴",
      "time": "2024-12-07T23:18:20.338Z",
      "stolen": false
    }
  ],
  "distance": 253.17609315769488 // optional, only show when lat, lng provided
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
  "sn": 2,
  "username": "test",
  "star": 1,
  "content": "噴水池，不是飲水機",
  "time": "2024-12-07T21:48:26.744Z",
  "stolen": false
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
  "sn": 2,
  "username": "test",
  "star": 1,
  "content": "噴水池，不是飲水機",
  "time": "2024-12-07T21:48:26.744Z",
  "stolen": false
}
```

##### 401 - Unauthorized

Invalid session.

##### 403 - Forbidden

General user can't modify other's review.

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

##### 403 - Forbidden

General user can't delete other's review.

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

##### 403 - Forbidden

Session is valid, but the user has insufficient privileges.

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
  "error": "Invalid request data",
  "message": "nickname: Expected string but got number"
}
```

