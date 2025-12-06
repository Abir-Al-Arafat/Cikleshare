# Docker Deep Dive - Cikleshare Backend

This document provides an in-depth explanation of Docker concepts, multi-stage builds, and the containerization architecture used in the Cikleshare Backend project.

---

## 📋 Table of Contents

- [What is Docker?](#what-is-docker)
- [Multi-Stage Build Architecture](#multi-stage-build-architecture)
- [Build Process Explained](#build-process-explained)
- [Container Lifecycle](#container-lifecycle)
- [Environment Variables in Docker](#environment-variables-in-docker)
- [Port Mapping](#port-mapping)
- [Volume Mounts](#volume-mounts)
- [Health Checks](#health-checks)
- [Image Size Optimization](#image-size-optimization)
- [Security Features](#security-features)
- [Docker vs Local Development](#docker-vs-local-development)

---

## 🐳 What is Docker?

Docker is a platform that packages your application and all its dependencies into a standardized unit called a **container**.

### Key Concepts

**Image vs Container:**

```
Docker Image (Blueprint)          Docker Container (Running Instance)
┌─────────────────────┐          ┌─────────────────────┐
│ - Operating System  │          │ Running Application │
│ - Node.js Runtime   │  ──────> │ Active Processes    │
│ - Application Code  │          │ Allocated Memory    │
│ - Dependencies      │          │ Network Access      │
└─────────────────────┘          └─────────────────────┘
   (Static Template)                  (Live Execution)
```

**Analogy:**

- **Image** = Class definition in programming
- **Container** = Object instance created from that class

---

## 🏗️ Multi-Stage Build Architecture

Multi-stage builds allow you to use multiple `FROM` statements in your Dockerfile. Each stage can copy artifacts from previous stages, but the final image only contains what you explicitly copy into it.

### Visual Architecture

```mermaid
graph TD
    A[Docker Build Start] --> B[Stage 1: Builder]
    B --> C[Install ALL Dependencies<br/>devDependencies + dependencies]
    C --> D[Copy Source Code<br/>src/, tsconfig.json]
    D --> E[Compile TypeScript → JavaScript<br/>npm run build]
    E --> F[Stage 2: Production]
    F --> G[Install ONLY Production Deps<br/>npm ci --only=production]
    G --> H[Copy Compiled dist/ from Builder<br/>COPY --from=builder]
    H --> I[Create Non-Root User<br/>cikleshare:1001]
    I --> J[Set Permissions & Security]
    J --> K[Final Image Ready]

    style B fill:#ff9999,color:#000
    style F fill:#99ff99,color:#000
    style K fill:#9999ff,color:#fff
```

### Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   STAGE 1: BUILDER (Temporary)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FROM node:22-alpine AS builder                            │
│  ├── Base: Alpine Linux (minimal OS ~5MB)                  │
│  └── Includes: Node.js 22, npm, build tools                │
│                                                             │
│  WORKDIR /app                                               │
│  └── Creates working directory at /app                     │
│                                                             │
│  COPY package*.json ./                                      │
│  └── Copies: package.json, package-lock.json               │
│                                                             │
│  RUN npm ci                                                 │
│  ├── Installs: ALL dependencies (prod + dev)               │
│  ├── Includes: TypeScript, ts-node, @types/*               │
│  └── Size: ~200MB of node_modules                          │
│                                                             │
│  COPY tsconfig.json src/ ./                                 │
│  └── Copies: TypeScript config + all source code           │
│                                                             │
│  RUN npm run build                                          │
│  ├── Executes: tsc (TypeScript Compiler)                   │
│  ├── Input: src/**/*.ts files                              │
│  ├── Output: dist/**/*.js files                            │
│  └── Creates: Compiled JavaScript bundle                   │
│                                                             │
│  Final State:                                               │
│  /app/                                                      │
│  ├── node_modules/  (200MB - includes devDeps)             │
│  ├── src/           (TypeScript source)                    │
│  ├── dist/          (Compiled JavaScript) ← WE NEED THIS   │
│  ├── package.json                                           │
│  └── tsconfig.json                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   ⚠️ BUILDER DISCARDED ⚠️
              (Everything except copied artifacts)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STAGE 2: PRODUCTION (Final Image)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FROM node:22-alpine                                        │
│  └── Fresh Alpine Linux (no builder artifacts)             │
│                                                             │
│  WORKDIR /app                                               │
│  └── Clean /app directory                                  │
│                                                             │
│  ENV NODE_ENV=production                                    │
│  ├── Tells Node.js to run in production mode               │
│  ├── Disables verbose error messages                       │
│  └── Optimizes performance                                 │
│                                                             │
│  COPY package*.json ./                                      │
│  └── Copies package files again (for npm install)          │
│                                                             │
│  RUN npm ci --only=production                               │
│  ├── Installs: ONLY production dependencies                │
│  ├── Excludes: TypeScript, dev tools                       │
│  └── Size: ~50MB of node_modules                           │
│                                                             │
│  COPY --from=builder /app/dist ./dist                       │
│  ├── Copies: Compiled JavaScript from builder stage        │
│  ├── Source: Previous stage's /app/dist                    │
│  └── Destination: Current stage's /app/dist                │
│                                                             │
│  RUN adduser -S cikleshare -u 1001                          │
│  └── Creates: Non-root system user (UID 1001)              │
│                                                             │
│  RUN chown -R cikleshare:cikleshare /app                    │
│  └── Changes ownership of all files to cikleshare user     │
│                                                             │
│  USER cikleshare                                            │
│  └── Switches context: All commands run as cikleshare      │
│                                                             │
│  EXPOSE 3031                                                │
│  └── Documents: Container listens on port 3031             │
│                                                             │
│  HEALTHCHECK --interval=30s --timeout=3s \                  │
│    --start-period=5s --retries=3 \                          │
│    CMD node -e "..."                                        │
│  └── Monitors: Container health every 30 seconds           │
│                                                             │
│  CMD ["node", "dist/index.js"]                              │
│  └── Runs: Application entry point as cikleshare user      │
│                                                             │
│  Final State:                                               │
│  /app/                                                      │
│  ├── node_modules/  (50MB - production only)               │
│  ├── dist/          (Compiled JavaScript)                  │
│  └── package.json                                           │
│                                                             │
│  ❌ NOT INCLUDED:                                           │
│  ├── src/ (TypeScript source code)                         │
│  ├── tsconfig.json                                          │
│  ├── devDependencies (TypeScript, @types/*)                │
│  └── Build tools                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    FINAL IMAGE SAVED
                    (~180MB total)
```

---

## 🔍 Build Process Explained

### Why Multi-Stage?

**Single-Stage Build Problems:**

```
┌────────────────────────────┐
│   Single-Stage Build       │
├────────────────────────────┤
│ ✅ Node.js runtime         │
│ ✅ Production dependencies │
│ ❌ Source code (.ts files) │  <- Security risk
│ ❌ TypeScript compiler     │  <- Not needed at runtime
│ ❌ Dev dependencies        │  <- Bloats image
│ ❌ Build tools             │  <- Wasted space
├────────────────────────────┤
│ Final Size: ~1.2GB         │  <- Too large!
└────────────────────────────┘
```

**Multi-Stage Build Solution:**

```
┌────────────────────────────┐
│  Multi-Stage Build         │
├────────────────────────────┤
│ ✅ Node.js runtime         │
│ ✅ Production dependencies │
│ ✅ Compiled code (.js)     │
│ ❌ Source code (excluded)  │
│ ❌ TypeScript (excluded)   │
│ ❌ Dev deps (excluded)     │
├────────────────────────────┤
│ Final Size: ~180MB         │  <- 85% smaller!
└────────────────────────────┘
```

### Layer Caching Strategy

Docker caches each instruction (layer) in the Dockerfile. Understanding this is crucial for fast builds:

```dockerfile
# ❌ BAD: Changes to source code invalidate all subsequent layers
COPY . .
RUN npm install
RUN npm run build

# ✅ GOOD: Leverage cache by copying package.json first
COPY package*.json ./     # Layer 1: Rarely changes
RUN npm ci                # Layer 2: Cached unless package.json changes
COPY src ./               # Layer 3: Changes frequently
RUN npm run build         # Layer 4: Only rebuilds when src changes
```

**Build Time Comparison:**

```
First Build (No Cache):
├── Layer 1: COPY package*.json    (0.1s)
├── Layer 2: RUN npm ci            (45s)  ⏰
├── Layer 3: COPY src/             (0.5s)
└── Layer 4: RUN npm run build     (12s)
Total: ~58 seconds

Subsequent Build (Source Changed):
├── Layer 1: COPY package*.json    (0.1s) [CACHED]
├── Layer 2: RUN npm ci            (0.1s) [CACHED] ✅
├── Layer 3: COPY src/             (0.5s)
└── Layer 4: RUN npm run build     (12s)
Total: ~13 seconds (78% faster!)
```

---

## 🔄 Container Lifecycle

### States and Transitions

```mermaid
stateDiagram-v2
    [*] --> Created: docker build
    Created --> Running: docker run
    Running --> Stopped: docker stop
    Running --> Exited: Error/Crash
    Stopped --> Running: docker start
    Exited --> Running: docker start
    Running --> Paused: docker pause
    Paused --> Running: docker unpause
    Stopped --> Removed: docker rm
    Exited --> Removed: docker rm
    Removed --> [*]
```

### Lifecycle Commands

```bash
# 1. BUILD IMAGE (creates blueprint)
docker build -t cikleshare-backend .
# Creates: Image stored locally
# Does NOT create: A running container

# 2. CREATE & RUN CONTAINER (instantiate + start)
docker run -p 3031:3031 --env-file .env -d cikleshare-backend
# -p: Maps port 3031 from container to host
# --env-file: Injects environment variables from .env
# -d: Detached mode (runs in background)
# Returns: Container ID (e.g., 8c8349ca6f7a)

# 3. VIEW RUNNING CONTAINERS
docker ps
# Shows: CONTAINER ID, STATUS, PORTS, NAMES

# 4. STOP CONTAINER (graceful shutdown)
docker stop 8c8349ca6f7a
# Sends: SIGTERM signal (allows cleanup)
# Waits: 10 seconds for graceful shutdown
# Then: SIGKILL if still running

# 5. START STOPPED CONTAINER
docker start 8c8349ca6f7a
# Reuses: Same container with previous state
# Keeps: Same ID, volumes, network settings

# 6. REMOVE CONTAINER
docker rm 8c8349ca6f7a
# Deletes: Container and its writable layer
# Preserves: Base image

# 7. REMOVE IMAGE
docker rmi cikleshare-backend
# Deletes: Image layers from disk
# Fails if: Container using this image exists
```

---

## 🌍 Environment Variables in Docker

### How `NODE_ENV=production` Works

**In Dockerfile:**

```dockerfile
ENV NODE_ENV=production
```

**Effects:**

1. **npm behavior:**

   ```bash
   npm ci --only=production
   # Skips: devDependencies (TypeScript, @types/*, etc.)
   # Installs: Only dependencies needed at runtime
   ```

2. **Express behavior:**

   ```javascript
   if (process.env.NODE_ENV === "production") {
     // Disable verbose error messages
     // Enable view caching
     // Optimize performance
   }
   ```

3. **Error handling:**
   ```
   Development: Stack traces, full error details
   Production:  Generic messages, no stack traces
   ```

### Passing Environment Variables

**Method 1: --env-file (Recommended)**

```bash
docker run -p 3031:3031 --env-file .env cikleshare-backend

# .env file:
DATABASE_URL=mongodb://localhost:27017/cikleshare
JWT_SECRET=super-secret-key
```

**Method 2: -e flag (Individual variables)**

```bash
docker run -p 3031:3031 \
  -e DATABASE_URL="mongodb://localhost:27017/cikleshare" \
  -e JWT_SECRET="super-secret-key" \
  cikleshare-backend
```

**Method 3: Docker Compose**

```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - NODE_ENV=production
```

**Priority (highest to lowest):**

```
1. docker run -e (overrides everything)
2. docker-compose.yml environment section
3. --env-file
4. ENV in Dockerfile
```

---

## 🔌 Port Mapping

### Understanding -p Flag

```bash
docker run -p 3031:3031 cikleshare-backend
         │   │    │
         │   │    └─ Container port (inside)
         │   └────── Host port (outside)
         └────────── Port mapping flag
```

**Visual Representation:**

```
┌─────────────────────────────────────────────┐
│           Your Computer (Host)              │
│                                             │
│  Browser → http://localhost:3031            │
│                     ↓                       │
│              ┌─────────────┐                │
│              │   Port      │                │
│              │   3031      │                │
│              └──────┬──────┘                │
│                     ↓                       │
│         ┌───────────────────────┐           │
│         │   Docker Container    │           │
│         │  ┌─────────────────┐  │           │
│         │  │   Port 3031     │  │           │
│         │  │   (Internal)    │  │           │
│         │  └────────┬────────┘  │           │
│         │           ↓           │           │
│         │   Express Server      │           │
│         │   app.listen(3031)    │           │
│         └───────────────────────┘           │
└─────────────────────────────────────────────┘
```

### Port Mapping Scenarios

**Scenario 1: Different Ports**

```bash
docker run -p 8080:3031 cikleshare-backend
# Access: http://localhost:8080
# Container still listens on 3031 internally
```

**Scenario 2: Multiple Containers**

```bash
# Container 1
docker run -p 3031:3031 cikleshare-backend

# Container 2 (same image, different port)
docker run -p 3032:3031 cikleshare-backend
```

**Scenario 3: Bind to Specific IP**

```bash
docker run -p 127.0.0.1:3031:3031 cikleshare-backend
# Only accessible from localhost, not from network
```

---

## 💾 Volume Mounts

Volumes allow data to persist outside the container and survive container restarts/removals.

### Types of Mounts

**1. Bind Mount (Development)**

```bash
docker run -v ./uploads:/app/uploads cikleshare-backend
            │    │        │
            │    │        └─ Container path
            │    └────────── Host path (relative or absolute)
            └─────────────── Volume mount flag
```

```
┌──────────────────────────────────────┐
│     Host Machine                     │
│                                      │
│  C:\backend\uploads\                 │
│  ├── avatar.jpg  ←┐                  │
│  └── document.pdf │ Synced in        │
│                   │ real-time        │
│  ┌─────────────────────────┐         │
│  │   Container            │         │
│  │  /app/uploads/         │         │
│  │  ├── avatar.jpg  ←─────┘         │
│  │  └── document.pdf               │         │
│  └─────────────────────────┘         │
└──────────────────────────────────────┘
```

**2. Named Volume (Production)**

```bash
docker volume create cikleshare-data
docker run -v cikleshare-data:/app/data cikleshare-backend
```

**Persistence Example:**

```bash
# Create container with volume
docker run -v ./uploads:/app/uploads --name api1 cikleshare-backend

# Upload file inside container
# File saved to: Container /app/uploads/ AND Host ./uploads/

# Remove container
docker rm api1

# Create new container with same volume
docker run -v ./uploads:/app/uploads --name api2 cikleshare-backend

# Uploaded files still exist! ✅
```

---

## 🏥 Health Checks

### Anatomy of a Health Check

```dockerfile
HEALTHCHECK --interval=30s \      # Check every 30 seconds
            --timeout=3s \        # Each check must complete in 3s
            --start-period=5s \   # Wait 5s after start before first check
            --retries=3 \         # Mark unhealthy after 3 failures
  CMD node -e "require('http').get('http://localhost:3031/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

### Health Check Timeline

```
Time  Action                        Status         Exit Code
────────────────────────────────────────────────────────────
0s    Container starts             starting       -
5s    First health check           starting       -
      HTTP GET /                   healthy        0 (success)
35s   Second health check          healthy        0
65s   Third health check           healthy        0
95s   Fourth check (DB down)       healthy        1 (failure, retry 1)
125s  Fifth check                  healthy        1 (failure, retry 2)
155s  Sixth check                  unhealthy      1 (failure, retry 3)
```

### Health Check States

```mermaid
stateDiagram-v2
    [*] --> starting: Container Created
    starting --> healthy: First Check Passes (Exit 0)
    starting --> starting: Start Period Not Elapsed
    healthy --> healthy: Check Passes (Exit 0)
    healthy --> unhealthy: 3 Consecutive Failures (Exit 1)
    unhealthy --> healthy: Check Passes (Exit 0)
    unhealthy --> unhealthy: Check Fails (Exit 1)
```

### Monitoring Health

```bash
# View health status
docker ps
# CONTAINER ID   STATUS
# 8c8349ca6f7a   Up 2 minutes (healthy)

# Detailed health info
docker inspect 8c8349ca6f7a | grep -A 10 Health

# View health check logs
docker inspect 8c8349ca6f7a --format='{{json .State.Health}}' | jq
```

**Health Check Response:**

```json
{
  "Status": "healthy",
  "FailingStreak": 0,
  "Log": [
    {
      "Start": "2025-12-06T10:00:00Z",
      "End": "2025-12-06T10:00:01Z",
      "ExitCode": 0,
      "Output": ""
    }
  ]
}
```

---

## 📊 Image Size Optimization

### Size Breakdown Comparison

```
┌─────────────────────────────────────────────────────────┐
│                SINGLE-STAGE BUILD                       │
├─────────────────────────────────────────────────────────┤
│ Component                Size      Needed at Runtime?   │
├─────────────────────────────────────────────────────────┤
│ Base (node:22)          ~950 MB   ❌ (too large)       │
│ Production deps          ~50 MB   ✅                    │
│ Dev dependencies        ~150 MB   ❌ (TypeScript, etc.) │
│ TypeScript source        ~5 MB    ❌ (compiled away)    │
│ Compiled JavaScript      ~2 MB    ✅                    │
│ Build tools             ~50 MB    ❌ (only for build)   │
│ Other artifacts         ~10 MB    ❌                    │
├─────────────────────────────────────────────────────────┤
│ TOTAL SIZE:           ~1,217 MB                         │
└─────────────────────────────────────────────────────────┘

                          ↓
                  OPTIMIZED WITH
                 MULTI-STAGE BUILD
                          ↓

┌─────────────────────────────────────────────────────────┐
│               MULTI-STAGE BUILD (FINAL)                 │
├─────────────────────────────────────────────────────────┤
│ Component                Size      Needed at Runtime?   │
├─────────────────────────────────────────────────────────┤
│ Base (node:22-alpine)    ~50 MB   ✅                    │
│ Production deps          ~50 MB   ✅                    │
│ Compiled JavaScript      ~2 MB    ✅                    │
│ System user config       ~1 KB    ✅                    │
├─────────────────────────────────────────────────────────┤
│ TOTAL SIZE:             ~102 MB                         │
├─────────────────────────────────────────────────────────┤
│ SAVINGS:              ~1,115 MB (91.6% reduction!)      │
└─────────────────────────────────────────────────────────┘
```

### Layer Size Analysis

```bash
# View layer sizes
docker history cikleshare-backend

# Output:
IMAGE          CREATED BY                     SIZE
<id>           CMD ["node" "dist/index.js"]   0B
<id>           HEALTHCHECK                    0B
<id>           EXPOSE 3031                    0B
<id>           USER cikleshare                0B
<id>           RUN adduser -S cikleshare      4.5kB
<id>           COPY /app/dist ./dist          2MB      ← Compiled code
<id>           RUN npm ci --only=production   50MB     ← Prod deps
<id>           COPY package*.json ./          2kB
<id>           ENV NODE_ENV=production        0B
<id>           WORKDIR /app                   0B
<id>           FROM node:22-alpine            50MB     ← Base image
```

---

## 🔒 Security Features

### 1. Non-Root User Execution

**Why it matters:**

```
┌────────────────────────────────────────┐
│  Running as ROOT (Default)             │
├────────────────────────────────────────┤
│  ❌ If compromised:                    │
│     - Full system access               │
│     - Can modify any file              │
│     - Can install malware              │
│     - Can access other containers      │
└────────────────────────────────────────┘

                  vs

┌────────────────────────────────────────┐
│  Running as cikleshare (UID 1001)      │
├────────────────────────────────────────┤
│  ✅ If compromised:                    │
│     - Limited to /app directory        │
│     - Cannot modify system files       │
│     - Cannot install packages          │
│     - Cannot access other users        │
└────────────────────────────────────────┘
```

**Implementation:**

```dockerfile
# Create system user (no login shell)
RUN adduser -S cikleshare -u 1001

# Give ownership of app directory
RUN chown -R cikleshare:cikleshare /app

# Switch to non-root user
USER cikleshare

# All subsequent commands run as cikleshare
CMD ["node", "dist/index.js"]  # Runs as cikleshare, not root
```

### 2. No Source Code in Production

**Builder Stage:**

```
/app/
├── src/
│   ├── controllers/
│   ├── services/
│   └── index.ts        ← TypeScript source (SENSITIVE)
├── dist/
│   └── index.js        ← Compiled JavaScript
└── node_modules/
```

**Production Stage:**

```
/app/
├── dist/
│   └── index.js        ← Only compiled code ✅
└── node_modules/       ← Only production deps

❌ src/ NOT INCLUDED (source code hidden)
❌ tsconfig.json NOT INCLUDED
❌ .env NOT INCLUDED (passed at runtime)
```

### 3. Secret Management

**❌ NEVER do this:**

```dockerfile
# WRONG: Secrets baked into image layers
ENV JWT_SECRET=my-secret-key-123
ENV DATABASE_URL=mongodb://user:pass@host/db
```

**✅ Correct approach:**

```dockerfile
# Dockerfile: NO secrets
ENV NODE_ENV=production

# Runtime: Pass secrets via environment
docker run --env-file .env cikleshare-backend
```

**Why?**

```bash
# Anyone with the image can extract secrets!
docker history cikleshare-backend
# Shows all ENV commands and their values

docker inspect cikleshare-backend
# Reveals environment variables set in Dockerfile
```

---

## 🆚 Docker vs Local Development

### Feature Comparison

| Aspect              | Local Development              | Docker Container              |
| ------------------- | ------------------------------ | ----------------------------- |
| **Node.js Version** | Your installed version         | Exactly 22.x (Alpine)         |
| **Dependencies**    | System-wide or project         | Isolated in container         |
| **Environment**     | Development mode               | Production mode               |
| **Port Conflicts**  | Can conflict with other apps   | Isolated, can map to any port |
| **Consistency**     | "Works on my machine" syndrome | Same on all machines          |
| **Speed**           | Faster (no container overhead) | Slight overhead (~5%)         |
| **Debugging**       | Easy with breakpoints          | Requires remote debugging     |
| **Hot Reload**      | Supported (npm run dev)        | Requires volume mount         |

### When to Use Each

**Use Local Development For:**

- Active feature development
- Debugging with breakpoints
- Rapid iteration (hot reload)
- Learning/experimentation

**Use Docker For:**

- Production deployment
- Testing production build
- CI/CD pipelines
- Ensuring consistency across environments
- Multi-service orchestration (with Docker Compose)

### Hybrid Workflow

```bash
# Development: Local with hot reload
npm run dev

# Pre-production: Docker build test
docker build -t cikleshare-backend .
docker run -p 3031:3031 --env-file .env cikleshare-backend

# Production: Docker with orchestration
docker-compose up -d
```

---

## 📚 Additional Resources

### Docker Commands Cheatsheet

```bash
# IMAGE MANAGEMENT
docker images                    # List all images
docker rmi <image-id>           # Remove image
docker image prune              # Remove unused images

# CONTAINER MANAGEMENT
docker ps                        # List running containers
docker ps -a                    # List all containers
docker stop <container-id>      # Stop container
docker start <container-id>     # Start container
docker restart <container-id>   # Restart container
docker rm <container-id>        # Remove container
docker container prune          # Remove stopped containers

# LOGS & DEBUGGING
docker logs <container-id>      # View logs
docker logs -f <container-id>   # Follow logs
docker exec -it <id> sh         # Shell into container
docker inspect <container-id>   # View details

# SYSTEM MANAGEMENT
docker system df                # Show disk usage
docker system prune             # Remove unused data
docker volume ls                # List volumes
docker network ls               # List networks
```

### Best Practices Summary

✅ **DO:**

- Use multi-stage builds for smaller images
- Run containers as non-root users
- Pass secrets via environment variables
- Use `.dockerignore` to exclude unnecessary files
- Tag images with versions
- Implement health checks
- Use Alpine Linux for smaller base images
- Cache package.json layer separately

❌ **DON'T:**

- Store secrets in Dockerfile
- Run containers as root
- Include source code in production images
- Use `latest` tag in production
- Copy `node_modules` from host
- Ignore security updates
- Forget to expose ports
- Skip health checks

---

## 🎓 Learning Path

1. **Beginner:** Understand images vs containers
2. **Intermediate:** Learn layer caching and multi-stage builds
3. **Advanced:** Master networking, volumes, and orchestration
4. **Expert:** Security hardening, optimization, CI/CD integration

---

**For practical usage and quick commands, see the main [README.md](./README.md)**
