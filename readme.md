# 🚀 Orbit - Distributed Social Media Platform

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Orbit is a highly scalable, production-grade Twitter/X clone. Moving beyond standard CRUD applications, this backend is engineered as a **Distributed, Real-Time System** utilizing a strict 3-Tier Architecture, Event-Driven background workers, and WebSockets.

## ✨ Key Features & Capabilities

* **☁️ Cloud-Streaming Storage:** Streams media uploads directly to Cloudinary via Multer, bypassing local disk storage to protect Node.js memory limits.
* **🧬 Polymorphic Data Models:** A dynamic Like and Comment system that scales infinitely, referencing either Tweets or nested Comments without database duplication.
* **⚡ Event-Driven Notifications (EDA):** Built with **Redis** and **BullMQ**. Intensive tasks (like broadcasting notifications) are offloaded to background workers, keeping user response times near 0ms.
* **💬 Real-Time WebSockets:** 1-on-1 private messaging powered by Socket.io, utilizing **Deterministic Room Routing**.
* **🐳 Containerized Infrastructure:** MongoDB and Redis are orchestrated via Docker Compose for seamless local development.
* **🧪 Test-Driven:** Comprehensive unit testing isolated across layers using **Jest** and SpyOn mocks.

---

## 🏗️ Architectural Decisions & Interview Theory

This project was built adhering to top-tier company best practices. Here is the *Crisp Theory* behind the engineering choices:

### 1. Why Event-Driven Architecture (Redis + BullMQ)?
**The Problem:** If a user "Likes" a post with 10 million followers, sending out notifications synchronously will block the Node.js single thread and crash the server.
**The Solution:** I utilized a **Message Queue**. When a user hits the Like endpoint, the controller pushes a "Job" into a Redis Queue and instantly returns a `200 OK` to the frontend. A separate Background Worker (BullMQ) consumes this job and processes the heavy database writes asynchronously. *This guarantees high availability and non-blocking I/O.*

### 2. Why Deterministic Room IDs for Chat?
**The Problem:** In a 1-on-1 chat, how do you ensure two users join the exact same WebSocket room without hitting the database to look up a stored Room UUID?
**The Solution:** **Deterministic Room Generation**. I sort the unique MongoDB `_id` strings of User A and User B alphanumerically and concatenate them (e.g., `111_999`). Regardless of who initiates the chat, the computed Room ID is exactly the same, resulting in an `O(1)` memory-only operation.

### 3. Strict 3-Tier Architecture (Separation of Concerns)
The backend is strictly divided into `Controllers`, `Services`, and `Repositories`. 
* **Controllers:** Handle HTTP requests and responses.
* **Services:** Contain the core business logic.
* **Repositories:** The *only* layer allowed to talk to MongoDB. 
**Why?** This prevents tight coupling. If we ever want to swap MongoDB for PostgreSQL, we only touch the Repository layer. The Service and Controller layers remain completely intact. It also allows for clean **Dependency Injection** during Jest unit testing.

---

## 🛠️ Tech Stack

* **Core Engine:** Node.js, Express.js
* **Database & ORM:** MongoDB, Mongoose
* **Caching & Message Broker:** Redis
* **Job Queues:** BullMQ
* **Real-Time Engine:** Socket.IO
* **Cloud Storage:** Cloudinary, Multer
* **DevOps:** Docker, Docker Compose
* **Testing:** Jest

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### 1. Clone the repository
```bash
git clone [https://github.com/AnikethSingh0/Social_Media.git](https://github.com/AnikethSingh0/Social_Media.git)



### 2. Set up Environment Variables
Create a `.env` file in the root directory and add the following:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/orbit
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
REDIS_HOST=redis
REDIS_PORT=6379

## 3. Spin Up Infrastructure (Docker)

Start your MongoDB and Redis containers in detached mode:

```bash
docker-compose up -d
```

---

## 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Your API is now running at:

```txt
http://localhost:3000
```

---

# 📂 Folder Structure

```plaintext
📦 src
 ┣ 📂 config          # Redis, Cloudinary, Database & Socket.IO configurations
 ┣ 📂 controllers     # HTTP request/response handlers
 ┣ 📂 helper          # Utility functions (e.g., Deterministic Room IDs)
 ┣ 📂 middleware      # Authentication & validation middleware
 ┣ 📂 models          # Mongoose schemas and database models
 ┣ 📂 queue           # BullMQ job producers
 ┣ 📂 repository      # Data access layer (MongoDB operations)
 ┣ 📂 routes          # Express route definitions
 ┣ 📂 services        # Core business logic
 ┣ 📂 sockets         # Socket.IO event handlers
 ┣ 📂 workers         # BullMQ background job consumers
 ┗ 📜 index.js        # Application entry point
```

---

# 🧪 Testing

This project uses **Jest** for unit testing.

Run the test suite:

```bash
npm run test
```

### Notes

- Tests use `jest.spyOn()` to mock the repository layer.
- Service-layer business logic is tested independently.
- No live MongoDB connection is required during unit tests.

---

# 🔮 Roadmap

- [ ] **Cursor-Based Pagination**
  - Implement `_id` pointer queries (`$lt`) for infinite scrolling.
  - Avoid the performance degradation associated with `skip()` and `limit()` pagination.

- [ ] **Feed Caching**
  - Cache frequently requested feeds in Redis.
  - Reduce database load and improve response times.

---

# ❤️ Author

Built with ❤️ by **Aniketh Singh**