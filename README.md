# Cikleshare Backend

> Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)
- [Support](#support)

**📖 For detailed Docker documentation:** [DOCKER.md](./DOCKER.md)

---

## 🎯 Overview

Cikleshare Backend is a Node.js/Express API server built with TypeScript that provides authentication, user management, and health-related services for the Cikleshare platform.

**Key Features:**

- 🔐 JWT-based authentication
- 👥 User management and profiles
- 📧 Email verification and notifications
- 🐳 Docker containerization with multi-stage builds
- 🔒 Security-first design (non-root user, environment isolation)
- 💾 MongoDB database integration

---

## 🛠 Technology Stack

| Technology       | Version           | Purpose              |
| ---------------- | ----------------- | -------------------- |
| **Node.js**      | 22.x              | Runtime environment  |
| **TypeScript**   | 5.9.3             | Type-safe JavaScript |
| **Express**      | 5.1.0             | Web framework        |
| **MongoDB**      | 8.20.0 (Mongoose) | Database             |
| **Docker**       | Latest            | Containerization     |
| **bcryptjs**     | 3.0.3             | Password hashing     |
| **jsonwebtoken** | 9.0.2             | JWT authentication   |
| **Nodemailer**   | 7.0.10            | Email service        |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # MongoDB connection
│   │   └── email.config.ts      # Email transport setup
│   ├── controllers/
│   │   ├── AuthController.ts    # Authentication logic
│   │   └── UserController.ts    # User management
│   ├── models/
│   │   └── UserModel.ts         # Mongoose user schema
│   ├── routes/
│   │   ├── AuthRoutes.ts        # Auth endpoints
│   │   └── UserRoutes.ts        # User endpoints
│   ├── services/
│   │   ├── AuthService.ts       # Auth business logic
│   │   └── UserService.ts       # User business logic
│   ├── validators/
│   │   └── authValidator.ts     # Input validation
│   ├── templates/
│   │   └── emailTemplates.ts    # Email HTML templates
│   ├── utilities/
│   │   └── common.ts            # Helper functions
│   ├── interfaces/
│   │   └── IEmailData.ts        # TypeScript interfaces
│   ├── constants/
│   │   └── statusCodes.ts       # HTTP status codes
│   └── index.ts                 # Application entry point
├── dist/                        # Compiled JavaScript (generated)
├── Dockerfile                   # Multi-stage build config
├── .dockerignore               # Docker build exclusions
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── .env                        # Environment variables (not committed)
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 22.x or higher
- **npm** or **yarn**
- **MongoDB** instance (local or cloud)
- **Docker** (optional, for containerized deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abir-Al-Arafat/Cikleshare.git
   cd Cikleshare/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables:

   ```env
   # Server
   PORT=3031
   NODE_ENV=development

   # Database
   DATABASE_URL=mongodb://localhost:27017/cikleshare

   # JWT
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=3600

   # Email (Gmail example)
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASS=your-app-password
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3031`

5. **Build TypeScript**

   ```bash
   npm run build
   ```

6. **Run production build**
   ```bash
   npm start
   ```

---

## 🐳 Docker Deployment

The application is containerized using Docker with a multi-stage build for optimized production deployment.

> 📖 **For detailed Docker explanations, architecture diagrams, and advanced concepts, see [DOCKER.md](./DOCKER.md)**

### Quick Start

**1. Build the Docker image:**

```bash
docker build -t cikleshare-backend .
```

**2. Run the container:**

```bash
docker run -p 3031:3031 --env-file .env -d --name cikleshare-api cikleshare-backend
```

**3. Check container status:**

```bash
docker ps
```

**4. View logs:**

```bash
docker logs -f cikleshare-api
```

### Common Commands

| Command                             | Description             |
| ----------------------------------- | ----------------------- |
| `docker ps`                         | List running containers |
| `docker logs <container-id>`        | View container logs     |
| `docker stop <container-id>`        | Stop container          |
| `docker start <container-id>`       | Start stopped container |
| `docker rm <container-id>`          | Remove container        |
| `docker exec -it <container-id> sh` | Open shell in container |

### Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  backend:
    build: .
    image: cikleshare-backend
    container_name: cikleshare-api
    ports:
      - "3031:3031"
    env_file:
      - .env
    restart: unless-stopped
    networks:
      - cikleshare-network

networks:
  cikleshare-network:
    driver: bridge
```

**Usage:**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# ============================================
# Server Configuration
# ============================================
PORT=3031
NODE_ENV=production

# ============================================
# Database
# ============================================
DATABASE_URL=mongodb://your-mongo-host:27017/cikleshare

# ============================================
# JWT Authentication
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=3600

# ============================================
# Email Configuration (Gmail Example)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Alternative: Gmail-specific
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASS=your-app-password

# ============================================
# Email Sender
# ============================================
EMAIL_FROM=noreply@cikleshare.com
```

**Security Notes:**

- ⚠️ Never commit `.env` to version control
- 🔒 Use strong, unique values for `JWT_SECRET`
- 🔑 For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833), not your account password
- 🌐 In production, use a dedicated SMTP service (SendGrid, AWS SES, etc.)

---

## 📡 API Endpoints

### Base URL

```
http://localhost:3031/api/v1
```

### Authentication Endpoints

| Method | Endpoint           | Description             | Auth Required |
| ------ | ------------------ | ----------------------- | ------------- |
| `POST` | `/auth/signup`     | Register new user       | ❌            |
| `POST` | `/auth/login`      | Login user              | ❌            |
| `POST` | `/auth/send-token` | Send verification token | ❌            |

### User Endpoints

| Method | Endpoint         | Description         | Auth Required |
| ------ | ---------------- | ------------------- | ------------- |
| `GET`  | `/users/profile` | Get user profile    | ✅            |
| `PUT`  | `/users/profile` | Update user profile | ✅            |

### Health Check

| Method | Endpoint | Description          |
| ------ | -------- | -------------------- |
| `GET`  | `/`      | Server health status |

**Example Response:**

```json
{
  "name": "Cikleshare Backend",
  "developer": "Abir",
  "version": "1.0.0",
  "description": "Backend server for Cikleshare Backend",
  "status": "success"
}
```

---

## 🏥 Health Checks

The Docker container includes automatic health monitoring. The container is marked as unhealthy if the health check fails 3 consecutive times.

**Check container health:**

```bash
docker ps
# Look for STATUS column: "healthy" or "unhealthy"

docker inspect <container-id> --format='{{.State.Health.Status}}'
```

> 📖 **For detailed health check configuration and timeline, see [DOCKER.md](./DOCKER.md#health-checks)**

---

## 🔧 Troubleshooting

### Container Exits Immediately

**Symptom:**

```bash
docker ps -a
# Shows: Exited (0) or Exited (1)
```

**Solution:**

```bash
# Check logs
docker logs <container-id>

# Common issue: Missing environment variables
# Fix: Ensure .env file exists and is passed correctly
docker run -p 3031:3031 --env-file .env -d cikleshare-backend
```

### Cannot Connect to `localhost:3031`

**Checklist:**

1. ✅ Container is running: `docker ps`
2. ✅ Port is mapped: `-p 3031:3031`
3. ✅ Health check passes: `docker inspect <id> --format='{{.State.Health.Status}}'`
4. ✅ Firewall allows port 3031
5. ✅ Database connection works (check logs)

**Test endpoint:**

```bash
curl http://localhost:3031/
# or
Invoke-WebRequest http://localhost:3031/
```

### Database Connection Failed

**Error in logs:**

```
❌ DATABASE_URL is not provided in environment variables
```

**Fix:**

```bash
# Verify .env contains DATABASE_URL
cat .env | grep DATABASE_URL

# Test MongoDB connection
docker run -p 3031:3031 -e DATABASE_URL="mongodb://host.docker.internal:27017/cikleshare" --env-file .env -d cikleshare-backend
```

**Note:** Use `host.docker.internal` instead of `localhost` when connecting to MongoDB on host machine from Docker.

### Permission Denied Errors

**Symptom:**

```
Error: EACCES: permission denied
```

**Cause:** Container runs as non-root user (`cikleshare`)

**Solution:**

```bash
# Ensure files are owned by correct user
docker exec -it <container-id> sh
/app $ ls -la
# If files owned by root, rebuild image
```

### View Container Files

```bash
# Enter container shell
docker exec -it <container-id> sh

# Navigate and explore
/app $ ls -la
/app $ cd dist
/app/dist $ cat index.js
/app $ exit
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Abir Al Arafat**

- GitHub: [@Abir-Al-Arafat](https://github.com/Abir-Al-Arafat)
- Repository: [Cikleshare](https://github.com/Abir-Al-Arafat/Cikleshare)

---

## 📞 Support

For issues and questions:

- 📧 Email: support@cikleshare.com
- 🐛 Issues: [GitHub Issues](https://github.com/Abir-Al-Arafat/Cikleshare/issues)

---

**Built with ❤️ for global health communities**
