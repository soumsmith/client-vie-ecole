# Fetching the latest node image on Alpine Linux
FROM node:alpine AS builder

# Install required dependencies for building
RUN apk add --no-cache git openssh python3 make g++

# Setting up the work directory
WORKDIR /app

# Copying package.json and yarn.lock to install dependencies
COPY package.json ./
COPY yarn.lock* ./

# Installing ALL dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# Copying all the files in our project
COPY . .

# Set NODE_ENV for production build
ENV NODE_ENV=production
# ✅ Même URL pour développement et production
ARG VITE_API_URL=http://46.105.52.105:8889/api/
ENV VITE_API_URL=$VITE_API_URL 
# Building our application
RUN yarn build



# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copying our nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
