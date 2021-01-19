# [API] Aircnc
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/DiegoVictor/aircnc-api/CI?logo=github&style=flat-square)](https://github.com/DiegoVictor/gorestaurant-api/actions)
[![redis](https://img.shields.io/badge/redis-3.0.2-d92b21?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![nodemon](https://img.shields.io/badge/nodemon-1.19.4-76d04b?style=flat-square&logo=nodemon)](https://nodemon.io/)
[![eslint](https://img.shields.io/badge/eslint-6.8.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-24.9.0-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/aircnc-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/aircnc-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/aircnc-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Aircnc&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Faircnc-api%2Fmaster%2FInsomnia_2021-01-01.json)


Responsible for provide data to the [`web`](https://github.com/DiegoVictor/aircnc-web) and [`mobile`](https://github.com/DiegoVictor/aircnc-app) front-ends. Permit to register yourself, login/logout, create and see your spots, approve or reject bookings on your spots and book spots from others. The app has  pagination, pagination's link header (to previous, next, first and last page), friendly errors, use JWT to logins, validation, also a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [Redis](#redis)
    * [MongoDB](#mongodb)
    * [.env](#env)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Pagination](#pagination)
    * [Link Header](#link-header)
    * [X-Total-Count](#x-total-count)
  * [Bearer Token](#bearer-token)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use two databases: [MongoDB](https://www.mongodb.com/) and [Redis](https://redis.io/). For the fastest setup is recommended to use [docker](https://www.docker.com/), see below how to setup ever database.

### Redis
Responsible to store data utilized by the websocket to alert users when books are made, approved or rejected. To create a redis container:
```
$ docker run --name aircnc-redis -d -p 6379:6379 redis:alpine
```

### MongoDB
Responsible to store almost all application data.  You can create a MongoDB container like so:
```
$ docker run --name aircnc-mongo -d -p 27017:27017 mongo
```

### .env
In this file you may configure your Redis and MongoDB database connection, JWT settings, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_URL|Used to mount spots' thumbnails urls.|`http://127.0.0.1`
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment.|`development`
|JWT_SECRET|A alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`7d`
|MONGO_URL|MongoDB connection url.|`mongodb://127.0.0.1:27017/tindev`
|REDIS_HOST|Redis host.|`127.0.0.1`
|REDIS_PORT|Redis port.|`6379`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/aircnc-api#errors-reference`
> For Windows users using Docker Toolbox maybe be necessary in your `.env` file set the host of the MongoDB and Redis to `192.168.99.100` (docker machine IP) instead of `localhost` or `127.0.0.1`.

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Spot does not exists",
  "code": 344,
  "docs": "https://github.com/DiegoVictor/aircnc-api#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|144|User does not exists|The `id` sent not references an existing user in the database.
|241|Token not provided|The JWT token was not sent.
|242|Token invalid|The JWT token provided is invalid or expired.
|341|You can not remove spot with bookings approved|Is not allowed to delete spots with approved bookings.
|342|Only the spot owner can approve bookings|You are trying approved a spot that is not your.
|343|You didn't request a booking to this spot or is not the spot owner|You are not allowed to reject a book that you not made it or you is not the spot owner.
|344|Spot does not exists|The `id` sent not references an existing spot in the database.
|345|You can only cancel bookings with 24 hours in advance|Is too late to cancel a book.

## Pagination
All the routes with pagination returns 10 records per page, to navigate to other pages just send the `page` query parameter with the number of the page.

* To get the third page of spots:
```
GET http://localhost:3333/v1/spots?page=3
```

### Link Header
Also in the headers of every route with pagination the `Link` header is returned with links to `first`, `last`, `next` and `prev` (previous) page.
```
<http://localhost:3333/v1/spots?page=7>; rel="last",
<http://localhost:3333/v1/spots?page=4>; rel="next",
<http://localhost:3333/v1/spots?page=1>; rel="first",
<http://localhost:3333/v1/spots?page=2>; rel="prev"
```
> See more about this header in this MDN doc: [Link - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).

### X-Total-Count
Another header returned in routes with pagination, this bring the total records amount.

## Bearer Token
A few routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/spots/5e33633397642e0884e90895 Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/spots
```

## Routes
|route|HTTP Method|pagination|params|description|auth method
|:---|:---:|:---:|:---:|:---:|:---:
|`/sessions`|POST|:x:|Body with user `email`.|Authenticates user, return a Bearer Token and user's email.|:x:
|`/bookings`|GET|:heavy_check_mark:|`page` query parameter.|Lists my bookings.|Bearer
|`/bookings/:booking_id/rejection`|POST|:x:|`booking_id` of the rejected booking.|Reject a booking request.|Bearer
|`/bookings/:booking_id/approval`|POST|:x:|`booking_id` of the approved booking.|Approve a booking request.|Bearer
|`/spots/:spot_id/booking`|POST|:x:|`spot_id` of the booked spot.|Book a spot.|Bearer
|`/dashboard`|GET|:heavy_check_mark:|`page` query parameter.|Lists my spots.|Bearer
|`/pending`|GET|:x:| - |Get my spots' pending requests.|Bearer
|`/spots`|GET|:heavy_check_mark:|`tech` and `page` query parameters.|Lists available spots by tech.|Bearer
|`/spots/:id`|GET|:x:|`id` of the spot.|Return one spot.|Bearer
|`/spots`|POST|:x:|Body with new spot [form data](https://developer.mozilla.org/docs/Web/API/FormData) (See insomnia file for good example).|Create a new spot.|Bearer
|`/spots/:id`|PUT|:x:|`id` of the spot, body with spot's `techs`, `company` and `price`.|Update a spot.|Bearer
|`/spots/:id`|DELETE|:x:|`id` of the spot.|Delete a spot.|Bearer
> Routes with `Bearer` as auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information.

### Requests
* `POST /session`

Request body:
```json
{
	"email": "johndoe@example.com"
}
```

* `POST /spots/:spot_id/booking`

Request body:
```json
{
	"date": "2021-11-01T23:16:52"
}
```

* `POST /spots`

Request body:
```json
{
  "company": "Hackett, Becker and Fadel",
  "price": 89,
  "techs": "ReactJS",
  "thumbnail": <file>
}
```

* `PUT /spots`

Request body:
```json
{
  "company": "Becker and Fadel",
  "price": 115,
  "techs": "Node.js, ReactJS",
}
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
