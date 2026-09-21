     Subscription Billing & Churn Engine

A secure, fault-tolerant subscription billing platform built as a project-based learning
system. The project evolves from a Spring Boot billing application into a containerized
microservices( i.e billing and account services) architecture with an API Gateway, Kafka, 
Redis, Keycloak, and MinIO in a Docker containerized setting.

The platform supports customer accounts, plans, subscriptions, invoices, 
payments, billing events, churn analysis, authentication/authorization, and PDF receipts.

1. Overview
2. Architecture
3. Project Structure
4. Technology Stack
5. Services
6. Core Domain
7. Request Flow
8. Authentication and Authorization
9. Kafka Event Flow
10. Redis
11. Receipt and MinIO Flow
12. Frontend
13. Ports
14. Running the Project
15. Building Individual Services
16. Important API Areas
17. Development Workflow
18. Guide vs Implementation and Final Architecture Summary

             1. Overview

The Subscription Billing & Churn Engine manages the lifecycle of a customer's subscriptions 
and their associated billing operations.

The system has three primary actors:

    #Customer

A customer can:

Sign in through Keycloak
View their customer profile
View available plans
Subscribe to a plan
Change their subscription plan
Cancel a subscription
View their invoices
Make payments
Access payment receipts

     #Admin / Operator/Administrator

An administrator can:

Manage billing plans
View customer information
Perform administrative billing operations
Access functionality protected by the ADMIN role
Also can access their own user information

    #Internal System

The system performs backend processing such as:

Billing operations
Payment processing
Kafka event publishing
Subscription activity recording
Churn-risk calculation
Receipt generation
Object storage

                       2. Architecture

The application is organized into separate services.

                         ┌─────────────────────┐
                         │   React Frontend    │
                         │   Vite + TypeScript │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    API Gateway      │
                         │       :8083         │
                         └───────┬───────┬─────┘
                                 │       │
                    ┌────────────┘       └────────────┐
                    ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │ Account Service  │              │ Billing Service  │
          │      :8081       │              │      :8080       │
          └────────┬─────────┘              └────────┬─────────┘
                   │                                 │
                   ▼                                 ▼
          ┌──────────────────┐              ┌──────────────────┐
          │   Account DB     │              │    Billing DB    │
          │   PostgreSQL     │              │    PostgreSQL    │
          └──────────────────┘              └──────────────────┘

                         ┌─────────────────────┐
                         │       Kafka         │
                         │  Billing Events     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         Activity / Churn Flow

                         ┌─────────────────────┐
                         │       Redis        │
                         │ Rate Limiting /     │
                         │ Distributed Support │
                         └─────────────────────┘

                         ┌─────────────────────┐
                         │      Keycloak       │
                         │ Authentication /    │
                         │ Authorization       │
                         └─────────────────────┘

                         ┌─────────────────────┐
                         │       MinIO         │
                         │ Receipt Storage     │
                         └─────────────────────┘

The frontend does not communicate directly with the Account or Billing Services during
normal application use. Requests go through the API Gateway.

                3. Project Structure

The main project is organized into separate applications:

BillingProject/
│
├── demo/
│   └── Billing Service
│
├── account-service/
│   └── Account Service
│
├── api-gateway/
│   └── API Gateway
│
├── billing-frontend-new/
│   └── React Frontend
│
└── docker-compose.yml

    *Billing Service

Responsible for billing-related business logic:

Plans
Subscriptions
Invoices
Payment attempts
Billing events
Subscription activity
Churn-related processing
Receipt generation/storage integration

Main package:
com.example.demo

     *Account Service

Responsible for customer information:

Customer creation
Customer retrieval
Customer updates
Customer deletion
Current authenticated customer profile
Main package:
com.example.acount_service

      *API Gateway

Provides the public API entry point
Its uses include:

Request routing
CORS
Rate limiting
Forwarding requests to the correct service

      *Frontend

The frontend is a React + TypeScript application using:

React
Vite
TanStack Router
Zustand state management
Axios
Keycloak JavaScript client
And transtack form validation

               4.Technology Stack
     *Technology      Purpose
Java 21 ;-          Backend programming language
Spring Boot ;-	    Backend application framework
Spring Data JPA;-	Database access
Hibernate;-	         ORM
PostgreSQL	;-       Relational database
Flyway;-           	 Database migrations
Spring Security	;-   API security
Keycloak;-         	 Identity and access management
JWT	;-               Authentication tokens
Spring Cloud
Gateway;-	          API Gateway
Redis	;-            Gateway rate limiting and distributed infrastructure
Apache Kafka;-        Event-driven communication
MinIO	;-            S3-compatible object storage
PDFBox	;-            PDF receipt generation
React	;-            Frontend UI
TypeScript	;-        Frontend type safety
Vite	;-            Frontend build tooling
Zustand	;-            Frontend state management
TanStack Router;-     Frontend routing
Axios;-          	  HTTP client for quering the backend endpoints
Docker Compose;-	  Local multiservice environment

                5. Services
       Account Service

Port: 8081

Base API:

/api/accounts

Examples:

POST   /api/accounts
GET    /api/accounts
GET    /api/accounts/{id}
PUT    /api/accounts/{id}
DELETE /api/accounts/{id}

GET    /api/accounts/me
PUT    /api/accounts/me
The /me endpoints use the authenticated user's identity rather than requiring the 
frontend to provide a customer ID and are used to identify get which information is 
allowed to or for that customer.

     *Billing Service

Port: 8080

Major API areas:

/api/plans
/api/subscriptions
/api/invoices
/api/payment-attempts
/api/subscription-activities
/api/churn-risk

The Billing Service validates customer/account information through the Account 
Service where necessary in the docker network using AccountServiceClient class .

     * API Gateway

Port: 8083

The frontend uses the Gateway as its main backend URL:

http://localhost:8083

Example routing:

/api/accounts/**          → Account Service :8081

/api/plans/**             → Billing Service :8080
/api/subscriptions/**     → Billing Service :8080
/api/invoices/**          → Billing Service :8080
/api/payment-attempts/**  → Billing Service :8080

                  6.Core Domain
      *Customer

Represents a customer/user using the billing platform.

Important fields include:

id
firstName
middleName
lastName
email
createdAt
updatedAt

      *Plan
Represents a subscription offering.

Examples of plan information:

id
name
price
billingCycle
features

Billing intervals include:

WEEKLY
MONTHLY
YEARLY

     *Subscription

Connects a customer to a plan.

Important information includes:

id
customerId
plan
status
nextBillingDate

Subscription statuses include:

ACTIVE
PAST_DUE
CANCELED

     *Invoice

Represents an amount owed for a subscription.

Important information includes:

id
subscription
amount
status
dueDate
paidAt

Invoice statuses include:

PENDING
PAID
FAILED

Receipts are stored externally in MinIO rather than storing the PDF binary directly in 
the relational database.

     * Payment Attempt

Represents an attempt to pay an invoice.

It records information such as:

invoice
status
errorReason
attemptDate

            7.Request Flow

A normally authenticated request follows this path:

Browser
 ↓
React
 ↓
Axios
 ↓
API Gateway :8083
 ↓
Account Service :8081
OR
Billing Service :8080
 ↓
Spring Security
 ↓
Controller
 ↓
Service
↓
Repository
↓
PostgreSQL

The response then travels back through the same service boundaries to the frontend, only 
on reverse.

          8.Authentication and Authorization

Authentication is handled by Keycloak.

Keycloak Info

Realm:
billing-realm

Frontend client:
billing-frontend

Roles:
ADMIN
CUSTOMER

Keycloak is exposed to the host on:
http://localhost:8180

                #.Login Flow
User
 ↓
React Sign In
 ↓
Keycloak
 ↓
JWT access token
 ↓
React authentication state
 ↓
Axios
 ↓
Authorization: Bearer <JWT>
 ↓
API Gateway
 ↓
Backend service
 ↓
Spring Security validates JWT

The frontend does not manually create JWTs.

Keycloak authenticates the user and issues the token.

                      *. JWT

A JWT contains claims describing the authenticated identity.

The backend extracts the user's email from the JWT and uses it as the authenticated 
principal.

Realm roles are converted into Spring Security authorities.

For example:

Keycloak role:
CUSTOMER

Spring Security authority:
ROLE_CUSTOMER and same idea for Admin

This allows backend methods to distinguish administrative and customer operations.

                  *.Authentication vs Authorization
Authentication Answers:

Who is this user?

Keycloak and the JWT handle this part.

Authorization Answers:

What is this authenticated user allowed to do?

Spring Security roles and ownership checks handle this part.

                #.HTTP Security Responses
     *401 Unauthorized

The request does not contain a valid authentication token.

Example/Illustration:

No JWT
 ↓
Protected endpoint
 ↓
401 Unauthorized

      *403 Forbidden

The user is authenticated but does not have permission to perform the operation.

Example:
Example:

Authenticated CUSTOMER
↓
Admin-only endpoint
↓
403 Forbidden

               #.Resource Ownership

Customer-specific resources must not rely only on a customer ID supplied by the frontend.

For example, this should not automatically be trusted:

GET /api/invoices/customer/1

Instead, the backend uses the authenticated user's identity to determine which customer 
they actually belong to.And that's where the /me endpoints are most important.

This protects against IDOR-style access where one customer attempts to access another 
customer's resources by changing an ID in a URL.

                9.Kafka Event Flow

Kafka is used for asynchronous billing-related events.

The general flow is:

Billing Operation
↓
BillingEventProducer
↓
Kafka Topic
↓
Kafka Consumer
↓
Subscription Activity
↓
Churn Calculation
↓
Frontend Dashboard

A billing event contains information such as:
eventType
subscriptionId
customerId
planId
timestamp

Example event:

PAYMENT_SUCCEEDED
Subscription: 8
Customer: 2

The important architectural idea is that the Billing Service does not need to perform 
every downstream operation synchronously.

Instead, it publishes an event and another component can process it.

                      *.Kafka Concepts
      *Producer

Publishes events to Kafka.

       *Consumer

Reads events from Kafka.

        *Topic

A stream/category where events are published.

         *Consumer Group

Allows multiple consumers to cooperate when processing events.

          *Offset

Represents a consumer's position in a Kafka topic.

        *At-least-once delivery

An event can potentially be processed more than once, so important consumers should 
eventually be designed to handle duplicate processing safely.

                           10.Redis

Redis is part of the infrastructure used by the API Gateway.

It is one use in the project's gateway rate limiting .

The gateway protects endpoints against excessive request rates, and it uses redis for 
this reason with it's burst capacity at 10 and replenishes every 5seconds.
It can take about 20 request within a minute as long as the replenish rate keeps up 
 until it returns 429 Too Many Requests based on the tests.

This provides an additional layer of protection before requests reach the backend services.

Redis can also be used for other distributed-system concerns such as:

Caching
Distributed locks
Temporary state
Coordination between service instances

                    11.Receipt and MinIO Flow

Receipts are generated after successful payment.

The flow is:

Customer
↓
Pay Invoice
↓
Invoice → PAID
↓
Generate PDF
↓
Upload PDF to MinIO
↓
Generate presigned URL
↓
Return receipt URL

Receipt objects use keys such as:

invoices/recceipts/invoice-5.pdf

MinIO provides S3-compatible object storage.


                 Essence of MinIO

PDF receipts are binary files and do not need to be stored directly inside PostgreSQL.

Instead:

PostgreSQL
↓
Stores billing metadata

MinIO
↓
Stores receipt PDF

This keeps the relational database focused on structured business data.

                 Presigned URLs
Particularly used in receipt generation when an invoice is called
A presigned URL provides temporary access to a private object.

The application generates a URL that is valid for a limited amount of time.

The current implementation uses a 10-minute expiry.

The important design principle is:

Do not permanently treat a temporary presigned URL
as the permanent identity of the receipt.

The stable value should be the MinIO object key:

invoices/receipts/invoice-5.pdf

A fresh presigned URL can then be generated when the invoice is retrieved.

Docker Networking

The project runs multiple services in Docker Compose.

Inside the Docker network, services communicate using service names.

For example:

http://minio:9000

can be valid from one Docker container to another.

However, a browser running on the host machine does not necessarily resolve minio.

This distinction caused an important receipt-download issue:

Docker container
↓
http://minio:9000
✓

Host browser
↓
http://minio:9000
✗

This is a networking/addressing issue rather than a failure of MinIO itself.

                       12.Frontend

The frontend is located in:

billing-frontend-new/

It uses:

React
TypeScript
Vite
TanStack Router
Zustand
Axios
Keycloak JavaScript client

            *Frontend State Management

Zustand is used to manage shared application state.

Important state includes:

Authentication state with authStore
isAuthenticated
username
email
roles
token

Customer state with customerStore
currentCustomer

Billing state with billingStore
plans
subscriptions
invoices
payment attempts

State management allows different components to access shared information without passing
the same data through many layers of React components.

         *Axios Authentication

The frontend API client uses an Axios request interceptor.

Implemented in auth/Keycloack.ts

Before sending an authenticated request:

Check Keycloak authentication
↓
Refresh token when necessary
↓
Attach Bearer token
↓
Send request to Gateway

The frontend's API base URL is:

http://localhost:8083

            *Frontend Routes

The frontend contains separate user and administrative areas.

Examples include:

/user
/user/subscription
/user/invoices
/admin

The application uses authentication state and roles to determine which parts of the UI 
are available.

                13.Ports
Service	                            Port
Frontend	                            5173
API Gateway	                            8083
Billing Service                  	    8080
Account Service	                        8081
Keycloak	                            8180
PostgreSQL	                            5432
Kafka	                                Docker network
Redis	                                Docker network
MinIO	                                Docker network / configured host mapping

                  14. Running the Project
Prerequisites
Install:
Java 21
Node.js / npm
Docker Desktop
Maven Wrapper support through the included mvnw
Git

                 *Start Backend Infrastructure

From the project directory containing docker-compose.yml:
docker compose up -d

Check running containers:
docker ps

              *Start or Rebuild a Service

For example, to rebuild the Account Service:
docker compose up -d --build account-service

For the Billing Service:
docker compose up -d --build billing-service

              *View Logs

Account Service:
docker logs account-service --tail 50

Billing Service:
docker logs billing-service --tail 50

Follow logs continuously:
docker logs -f account-service

Building the Backend

           *Billing Service:

cd demo
./mvnw compile
Package:
./mvnw clean package -DskipTests

Account Service:
cd account-service
./mvnw clean package -DskipTests

            *Running the Frontend
npm install
npm run dev

The development frontend normally runs on:

http://localhost:5173

             *Frontend Production Build

Run:
npm run build

A successful build produces the Vite dist directory.
The project currently builds successfully.

The Vite warning about chunks larger than 500 kB is a performance optimization warning, 
not a build failure and the frontend build produces those.

              16.Important API Areas
      Accounts
POST   /api/accounts
GET    /api/accounts
GET    /api/accounts/{id}
PUT    /api/accounts/{id}
DELETE /api/accounts/{id}

GET    /api/accounts/me
PUT    /api/accounts/me
Plans
GET  /api/plans
POST /api/plans

Plan creation is protected by the appropriate administrative role.

      Subscriptions
POST /api/subscriptions
GET  /api/subscriptions
PUT /api/subscriptions/{id}/canncel
PUT /subscriptions/{id}/plan

Subscription operations validate the customer and plan.

Invoices
GET /api/invoices

Invoice access is protected by authentication and customer ownership rules.

      Payment

The payment flow:

Authenticate customer
↓
Validate invoice ownership
↓ 
Process payment 
↓ 
Update invoice
↓
Record payment attempt
↓
Generate receipt
↓ 
Upload receipt to MinIO
↓ 
Return receipt access information
↓
Publish billing event

                    .Database

The project uses PostgreSQL for durable relational data.

Important domain tables include:

customers
plans
subscriptions
invoices
payment_attempts
subscription_activities

Relationships include:

Customer
│
└── Subscription
│
├── Plan
│
└── Invoice
│
└── PaymentAttempt

             17. Development Workflow

When changing backend code:

1. Make one logical change
2. Compile/package the service
3. Rebuild the Docker image
4. Restart the service
5. Check service logs
6. Test the endpoint
7. Check database/event/object-storage state when relevant

This is particularly important because changing source code does not automatically change
the application already running inside a Docker container.

        #Testing Strategy

Testing and verification are performed at multiple levels.

Build verification

Backend:
./mvnw compile

Frontend:
npm run build

Container verification
docker ps
Service logs
docker logs <container>

API verification
Requests are tested through the API Gateway where appropriate.

Security verification
Only the frontend with the F12 console and network data

Important scenarios include:

No token-works with the gatway basically any terminal without a token 
→ 401

Valid token + insufficient role
→ 403

Valid customer + own resource
→ allowed

Valid customer + another customer's resource
→ denied
End-to-end payment verification

The payment flow has been successfully tested through:

Payment
→ PAID invoice
→ paidAt
→ PDF receipt
→ MinIO upload
→ presigned URL

Current Status

                Phase 1 — Core Billing

Status: Implemented
Includes:

PostgreSQL
JPA/Hibernate
Customers
Plans
Subscriptions
Invoices
Payment attempts
Validation
Billing operations
Database migrations

          Phase 2 — Microservices

Status: Implemented
Includes:

Account Service
Billing Service
API Gateway
Gateway routing
CORS
Rate limiting

             Phase 3 — Event-Driven Processing

Status: Implemented with adaptations

Includes:
Kafka producer
Kafka consumer
Billing events
Subscription activity persistence
Churn calculation
Gateway integration
Redis infrastructure
Frontend dashboard integration
Zustand state management

                Phase 4 — Security and Storage

Status: Mostly implemented

Includes:

Keycloak
JWT authentication
Role mapping
Customer/admin authorization
Resource ownership protection
PDF receipt generation
MinIO upload
Presigned URLs

             18.0- Guide vs Implementation

The project follows the original Project-Based Learning Guide, but a few implementation 
details evolved during development.

                 Implemented
Spring Boot billing API
PostgreSQL
JPA/Hibernate
Flyway
Account Service
Billing Service
API Gateway
Redis-backed rate limiting
Kafka producer/consumer
Subscription activity processing
Churn calculation
Keycloak
JWT authentication
Role-based authorization
Customer ownership protection
PDF receipt generation
MinIO
Presigned receipt URLs
React frontend
Zustand state management

                 Adapted

The guide's Kafka notification example became a billing activity/churn-processing pipeline.

Docker Compose service-name networking was used instead of introducing a separate service-discovery registry.

Redis is concretely used in the gateway rate-limiting infrastructure.

                       18.5- Final Architecture Summary

The system can be understood as five major layers:

┌─────────────────────────────────────────────┐
│                 FRONTEND                    │
│ React + TypeScript + Zustand + Router       │
└──────────────────────┬──────────────────────┘
│
▼
┌─────────────────────────────────────────────┐
│              API GATEWAY :8083              │
│ Routing + CORS + Rate Limiting              │
└───────────────┬─────────────────┬───────────┘
│                 │
▼                 ▼
┌──────────────────────┐ ┌──────────────────────┐
│ ACCOUNT SERVICE :8081│ │ BILLING SERVICE :8080│
│ Customers            │ │ Plans                │
│ Customer Profiles    │ │ Subscriptions        │
│                      │ │ Invoices             │
│                      │ │ Payments             │
└──────────┬───────────┘ │ Receipts             │
│             └───────┬──────────────┘
▼                     │
PostgreSQL                 │
├──► Kafka
│
├──► Redis
│
└──► MinIO
│
▼
PDF Receipts

              Keycloak
                  │
                  ▼
          Identity + JWT + Roles

The overall design separates identity, customer data, billing, event processing,
API infrastructure, and file storage into clear responsibilities.


Project Status

This project is an active learning implementation. The core architecture and major 
Phase 1–4 capabilities are operational, while several production-hardening items remain.

The most important principle for future development is to preserve the service 
boundaries and security model while completing the remaining receipt-storage and fault-tolerance work.

