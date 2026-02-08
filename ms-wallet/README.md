# Wallet Microservice

## Running

### 1. Environment

Create a `.env` file in the root of the ms-wallet directory by copying the example file `.env.example`. The `.env.example` file contains all the necessary environment variables with valid default values.

### 2. Starting the containers

Start the service and database using Docker Compose with `docker-compose up --build -d`. The containers will be running in the background. The migrations will run at the application container start up.

### 3. Accessing the Service

The service will be available at: `http://localhost:3001` (`localhost:3003` for the gRPC)

### 4. Stopping the Service

Stop the service with `docker-compose down`

## API Documentation

The endpoints were built according to the ms-transactions.yaml OpenAPI specification. An extra gRPC endpoint was created to check the balance of a user by the Users Service. The gRPC endpoint is authenticated with a static token known by the services. With more time I would have implemented mTLS/SSl authentication.

Authorization logic were added to the **POST /transactions**, **GET /transactions** and **GET /balance** so that only the transactions and balance of the authenticated one (detected by the **sub** [ID] claim of the JWT token) is read/created. You will have to use a valid user ID in the **sub** claim if you generate the JWT token manually instead of using the **POST /auth** endpoint to authenticate, otherwise those endpoint will not be accessible.

## cURL

#### POST /transactions

```
curl --request POST \
  --url http://localhost:3001/transactions \
  --header 'Authorization: Bearer ${JWT}' \
  --header 'Content-Type: application/json' \
  --data '{"user_id": "user-uuid", "type": "CREDIT", "amount": 1000}'
```

#### GET /transactions

```
curl --request GET \
  --url 'http://localhost:3001/transactions' \
  --header 'Authorization: Bearer ${JWT}'
```

```
curl --request GET \
  --url 'http://localhost:3001/transactions?type=CREDIT' \
  --header 'Authorization: Bearer ${JWT}'
```

#### GET /balance

```
curl --request GET \
  --url http://localhost:3001/balance \
  --header 'Authorization: Bearer ${JWT}'
```
