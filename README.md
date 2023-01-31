# [API] Aircnc
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/DiegoVictor/aircnc-api/main.yml?logo=github&style=flat-square)](https://github.com/DiegoVictor/aircnc-api/actions)
[![redis](https://img.shields.io/badge/redis-3.1.2-d92b21?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![nodemon](https://img.shields.io/badge/nodemon-2.0.12-76d04b?style=flat-square&logo=nodemon)](https://nodemon.io/)
[![eslint](https://img.shields.io/badge/eslint-7.31.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-26.6.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/aircnc-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/aircnc-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/aircnc-api/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Aircnc&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Faircnc-api%2Fmain%2FInsomnia_2021-07-24.json)


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
The application uses two databases: [MongoDB](https://www.mongodb.com/) and [Redis](https://redis.io/). For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### Redis
Responsible to store data utilized by the websocket to alert users when books are made, approved or rejected. If for any reason you would like to create a Redis container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name aircnc-redis -d -p 6379:6379 redis:alpine
```

### MongoDB
Responsible to store almost all application data. If for any reason you would like to create a MongoDB container instead of use `docker-compose`, you can do it by running the following command:
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
|MONGO_URL|MongoDB connection url.|`mongodb://mongo:27017/tindev`
|REDIS_HOST|Redis host.|`redis`
|REDIS_PORT|Redis port.|`6379`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/aircnc-api#errors-reference`

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


## X-Total-Count
This header brings the records amount.

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
|route|HTTP Method|params|description|auth method
|:---|:---:|:---:|:---:|:---:
|`/sessions`|POST|Body with user `email`.|Authenticates user, return a Bearer Token and user's email.|:x:
|`/bookings`|GET| - |Lists my bookings.|Bearer
|`/bookings/:id/rejection`|POST|`id` of the rejected booking.|Reject a booking request.|Bearer
|`/bookings/:id/approval`|POST|`id` of the approved booking.|Approve a booking request.|Bearer
|`/spots/:id/booking`|POST|`id` of the booked spot.|Book a spot.|Bearer
|`/dashboard`|GET| - |Lists my spots.|Bearer
|`/pending`|GET| - |Get my spots' pending requests.|Bearer
|`/spots`|GET|`tech` query parameter.|Lists available spots by tech.|Bearer
|`/spots/:id`|GET|`id` of the spot.|Return one spot.|Bearer
|`/spots`|POST|Body with new spot [form data](https://developer.mozilla.org/docs/Web/API/FormData) (See insomnia file for good example).|Create a new spot.|Bearer
|`/spots/:id`|PUT|`id` of the spot, body with spot's `thumbnail`, `techs`, `company` and `price` (See insomnia file for good example).|Update a spot.|Bearer
|`/spots/:id`|DELETE|`id` of the spot.|Delete a spot.|Bearer
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
```
"company"="Hackett, Becker and Fadel"
"price"=89
"techs"="ReactJS"
"thumbnail"=<file>
```

* `PUT /spots`

Request body:
```
"company"="Becker and Fadel"
"price"=115
"techs"="Node.js, ReactJS"
"thumbnail"=<file>
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
