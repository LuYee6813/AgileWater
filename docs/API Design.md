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
- `limit` - optional (default: `10`)
- `lat`: search latitude - optional
- `lng`: search longitude - optional
- `radius`: search radius (meters) - optional
- `iced`: is have iced? - optional
- `warm`: is have warm? - optional
- `hot`: is have hot? - optional
- `name` - optional

#### Response Body

##### 200 - Success

```json
[
  {
    "location": {
      "coordinates": [
        121.5829,
        25.08271
      ],
      "type": "Point"
    },
    "sn": 4,
    "type": "直飲台",
    "name": "碧湖公園",
    "iced": false,
    "cold": false,
    "warm": true,
    "hot": false,
    "openingHours": "00:00 - 00:00",
    "description": "閱覽室門口。24HR",
    "rate": 3,
    "photos": [
      "1669827740_bpm5pa4j05l.png",
      "1669827903_bd50c1rwhde.png"
    ],
    "path": "/app/fup",
    "reviews": [
      {
        "sn": 1,
        "username": "Rouf Hung",
        "cmntImg": "",
        "star": 3,
        "content": "極力推薦",
        "time": "2023-07-14T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 2,
        "username": "Yu",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2023-07-14T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 3,
        "username": "海堤",
        "cmntImg": "1669396511_cc5xsjgj4xh.png",
        "star": 3,
        "content": "高低2個喝水站，高度大人小孩都適合",
        "time": "2022-11-24T16:00:00.000Z",
        "stolen": true
      }
    ]
  },
  {
    "location": {
      "coordinates": [
        120.9967,
        24.79562
      ],
      "type": "Point"
    },
    "sn": 5,
    "type": "飲水機",
    "name": "No name",
    "iced": false,
    "cold": true,
    "warm": true,
    "hot": true,
    "description": "研發飲水機",
    "rate": 3,
    "photos": [],
    "path": "",
    "reviews": [
      {
        "sn": 1,
        "username": "蘆葦",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-09-01T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 2,
        "username": "Jay",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2022-07-01T16:00:00.000Z",
        "stolen": true
      }
    ]
  },
  {
    "location": {
      "coordinates": [
        121.5407,
        24.99223
      ],
      "type": "Point"
    },
    "sn": 6,
    "type": "直飲台",
    "name": "捷運景美站",
    "iced": false,
    "cold": true,
    "warm": true,
    "hot": false,
    "openingHours": "06:00 - 23:00",
    "description": "靠1號出口直飲台，有方便裝水的設計",
    "rate": 3.2,
    "photos": [
      "1649279785_53ivfc5sm5j.png"
    ],
    "path": "/app/fup",
    "reviews": [
      {
        "sn": 1,
        "username": "！！！",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-08-21T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 2,
        "username": "潼恩1704611364",
        "cmntImg": "",
        "star": 3,
        "content": "特別的奉茶站",
        "time": "2024-08-13T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 3,
        "username": "Crystal912 ",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-08-10T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 4,
        "username": "娜",
        "cmntImg": "",
        "star": 3,
        "content": "極力推薦",
        "time": "2024-07-28T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 5,
        "username": "x420420x",
        "cmntImg": "",
        "star": 4,
        "content": "極力推薦",
        "time": "2024-07-22T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 6,
        "username": "Peggy",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-07-20T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 7,
        "username": " 小乖",
        "cmntImg": "",
        "star": 3,
        "content": "極力推薦",
        "time": "2024-07-13T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 8,
        "username": "Crystal912 ",
        "cmntImg": "",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-06-19T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 9,
        "username": "Jia Rui Wang",
        "cmntImg": "1718570502_octphcunrb0.png",
        "star": 3,
        "content": "水很好喝",
        "time": "2024-06-15T16:00:00.000Z",
        "stolen": true
      },
      {
        "sn": 10,
        "username": "娜",
        "cmntImg": "",
        "star": 3,
        "content": "極力推薦",
        "time": "2024-06-15T16:00:00.000Z",
        "stolen": true
      }
    ]
  }
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
  "location": {
    "coordinates": [
      121.513152,
      24.986225
    ],
    "type": "Point"
  },
  "sn": 22812,
  "type": "飲水機",
  "name": "崇南市民活動中心",
  "addr": "新北市中和區景新街496巷26弄2號",
  "iced": false,
  "cold": false,
  "warm": false,
  "hot": false,
  "openingHours": "00:00~00:00",
  "description": "",
  "rate": 4,
  "photos": [],
  "path": "",
  "reviews": [
    {
      "sn": 1,
      "username": "littlemay Tseng",
      "cmntImg": "",
      "star": 3,
      "content": "水很好喝",
      "time": "2024-05-24T16:00:00.000Z",
      "stolen": true
    },
    {
      "sn": 2,
      "username": "test",
      "star": 1,
      "content": "阿巴阿巴qwq",
      "time": "2024-12-07T21:48:26.744Z",
      "stolen": false
    }
  ]
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
  "error": "Invalid request data",
  "message": "nickname: Expected string but got number"
}
```

