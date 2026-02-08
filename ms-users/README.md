# Users Microservice

## Running

### 1. Environment

Create a `.env` file in the root of the ms-users directory by copying the example file `.env.example`. The `.env.example` file contains all the necessary environment variables with valid default values.

### 2. Starting the containers

Start the service and database using Docker Compose with `docker-compose up --build -d`. The containers will be running in the background. The migrations will run at the application container start up.

### 3. Accessing the Service

The service will be available at `http://localhost:3002`

### 4. Stopping the Service

Stop the service with `docker-compose down`

## API Documentation

The endpoints were built according to the ms-users.yaml OpenAPI certification, with the exception of the **PATCH /users/:id** where the fields were made optional instead of required. This way the endpoint follows the spirit of a **PATCH** endpoint.

Authorization logic were added to the **GET /users/:id**, **PATCH /users/:id** and **DELETE /users/:id** so that the only user allowed to be read/patched/deleted is the authenticated one (detected by the **sub** [ID] claim of the JWT token). You will have to use a valid user ID in the **sub** claim if you generate the JWT token manually instead of using the **POST /auth** endpoint to authenticate, otherwise those endpoint will not be accessible. The **GET /users** has no authorization logic and will list all users in the database.

The **DELETE /users/:id** will soft delete the user instead of hard deleting for record keeping purposes. It will also check with the Wallet Microservice via gRPC if the user has a balance instead of deleting the user right away. It provides just a basic functionality but it's not complete. It still allows for race conditions between checking the balance and deleting the user and it also allows creating transaction after the user is deleted as long as the JWT is still valid. With more time those scenarios could be handled as well.

## cURL

#### POST /users

```
curl --request POST \
  --url http://localhost:3002/users \
  --header 'Content-Type: application/json' \
  --data '{"first_name": "Matheus", "last_name": "Batista", "email": "matheus@gmail.com", "password": "123"}'
```

#### GET /users

```
curl --request GET \
  --url 'http://localhost:3002/users' \
  --header 'Authorization: Bearer ${JWT}'
```

#### GET /users/:id

```
curl --request GET \
  --url 'http://localhost:3002/users/:id' \
  --header 'Authorization: Bearer ${JWT}'
```

#### PATCH /users/:id

```
curl --request POST \
  --url http://localhost:3002/users/:id \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer ${JWT}' \
  --data '{"first_name": "Matheus", "last_name": "Batista", "email": "matheus@gmail.com", "password": "123"}'
```

#### DELETE /users/:id

```
curl --request DELETE \
  --url 'http://localhost:3002/users/:id' \
  --header 'Authorization: Bearer ${JWT}'
```

#### POST /auth

```
curl --request POST \
  --url http://localhost:3002/auth \
  --header 'Authorization: Bearer ${JWT}' \
  --header 'Content-Type: application/json' \
  --data '{"user": {"email": "matheus@gmail.com", "password": "123"}}'
```
