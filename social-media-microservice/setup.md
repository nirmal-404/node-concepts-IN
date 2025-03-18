```md
# Microservices Setup Guide

## Initializing Projects

```sh
api-gateway> npm init -y
identity-service> npm init -y
```

## Setting Up API Gateway

```sh
api-gateway> npm i nodemon --save-dev
```

### Create Project Structure
- Create `src` folder
- Create `server.js` inside `src` (i.e., `api-gateway/src/server.js`)

### Modify `package.json` in API Gateway
```json
"start": "node src/server.js",
"dev": "nodemon src/server.js"
```

### Install Dependencies
```sh
api-gateway> npm i cors dotenv express express-http-proxy helmet ioredis jsonwebtoken winston  
```

---

## Setting Up Identity Service

```sh
identity-service> npm i nodemon --save-dev
```

### Install Dependencies
```sh
identity-service> npm i cors argon2 dotenv express express-rate-limit helmet ioredis joi jsonwebtoken mongoose rate-limit-redis winston
```

### Create Project Structure
- Create `src` folder
- Create `server.js` inside `src` (i.e., `identity-service/src/server.js`)

### Modify `package.json` in Identity Service
```json
"start": "node src/server.js",
"dev": "nodemon src/server.js"
```

### Create `.env` File in Identity Service
```env
PORT=3001
MONGO_URI=
JWT_SECRET=
```

### Create Folder Structure in `src` (Identity Service)
- `models`
- `middleware`
- `utils`
- `routes`
- `controllers`

### Implement Identity Service
1. Create `User.js` in `models`
2. Create `logger.js` in `utils` (Refer Winston docs in npmjs)
3. Create `errorHandler.js` in `middleware`
4. Create `identity-controller.js` (No implementation yet)
5. Create `RefreshToken.js` in `models`
6. Start implementing `identity-controller.js`
7. Create `validation.js` in `utils`
8. Continue implementing `identity-controller.js`
9. Create `generateToken.js` in `utils`
10. Complete registration method in `identity-controller.js`
11. Create `identity-service.js` in `routes`
12. Start implementing `server.js`
13. Install package for DDOS & brute-force attack prevention
```sh
identity-service> npm i rate-limiter-flexible
```
14. Add Redis URL to `.env`
```env
REDIS_URL=redis://localhost:6379
```

---

## Additional Setup in API Gateway

1. Create `logger.js` in `utils` (i.e., `api-gateway/src/utils/logger.js`)
2. Create `errorHandler.js` in `middleware`
3. Install additional dependencies
```sh
api-gateway> npm i express-rate-limit rate-limit-redis
```

---

## Running Services with Docker

After creating `Dockerfile` and `docker-compose.yml`, run:
```sh
docker-compose build
docker compose up
```

### Service-Specific Logs
```sh
docker-compose logs api-gateway
```

---

## VPS Hosting on Hostinger

### Setting Up Ubuntu Server

#### 1. Connect to VPS
```sh
ssh root@<ip>
```
Enter password.

#### 2. Update System
```sh
sudo apt update -y
```

#### 3. Install Dependencies
```sh
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

#### 4. Add Docker Repository
```sh
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

#### 5. Update Package List Again
```sh
sudo apt update -y
```

#### 6. Install Docker
```sh
sudo apt install -y docker-ce
```

#### 7. Start and Enable Docker
```sh
sudo systemctl start docker
sudo systemctl enable docker
```

#### 8. Verify Docker Installation
```sh
docker --version
```

#### 9. Install Docker Compose
```sh
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

#### 10. Set Execute Permission
```sh
sudo chmod +x /usr/local/bin/docker-compose
```

#### 11. Verify Docker Compose Installation
```sh
docker-compose --version
```

#### 12. Create Project Directory
```sh
sudo mkdir -p /home/root/projects/<project_name>
```

#### 13. Clone Git Repository
```sh
git clone https://<token>@github.com/<your-username>/your-repo.git
```

#### 14. Open Project in VS Code (Remote SSH)
1. Open VS Code
2. Remote SSH → Connect to host
3. Enter password

#### 15. Navigate to Project Folder
```sh
cd /home/root/projects/<project_name>/<root_folder_name>
```

#### 16. Open Folder

#### 17. Create `.env` Files
Example:
```env
IDENTITY_SERVICE_URL=http://identity-service:3001
```

#### 18. Start Services on VPS
```sh
sudo systemctl status docker
docker-compose --version
sudo docker-compose build
sudo docker compose up -d
sudo docker compose ps
sudo docker compose logs
sudo docker compose logs -f <service_name>
```

#### 19. Testing API
```sh
http://@<ip>:3000/v1/...
```

---


## GitHub Actions

create .github folder in root directory f your project

inside that create workflows folder

inside that create deploy.yml

paste the followng  in deploy.yml

name: Deploy to VPS

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Install Docker Compose
        run: |
          sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
          sudo chmod +x /usr/local/bin/docker-compose
          docker-compose --version

      - name: Log in to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker images
        run: |
          docker-compose -f docker-compose.yml build
          docker-compose -f docker-compose.yml push

  deploy:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Add VPS SSH host key to known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H 62.72.30.37 >> ~/.ssh/known_hosts

      - name: Set up SSH key for authentication
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa

      - name: SSH into VPS and deploy
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: 62.72.30.37
          username: root
          key: ${{ secrets.VPS_SSH_PRIVATE_KEY }}
          port: 22
          script: |
            cd /path/to/vps/folder
            git pull origin main
            docker-compose down
            docker-compose up -d

      - name: Debug SSH connection (optional)
        run: |
          ssh -v -i ~/.ssh/id_rsa root@62.72.30.37 "echo 'SSH connection successful'"
        continue-on-error: true


add the secrets in settings->secrets and variable -> actions

## Configure SSH Key Authentication 
-- run these in cmd

#### 1. Generate SSH Key
```sh
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

#### 2. Retrieve Private Key (Windows Example)
```sh
Get-Content C:\Users\your_user\.ssh\id_rsa
```
--in vps folder
#### 3. Check `.ssh` Directory
```sh
ls -ld ~/.ssh
```

#### 4. Set Correct Permissions
```sh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

create the envvalus as secrets