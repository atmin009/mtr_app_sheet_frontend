# Build stage
FROM node:22-alpine AS builder

# ตั้งค่า working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# ติดตั้ง dependencies
RUN npm install

# Copy source code
COPY . .

# Build production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files จาก build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

