# Alternative: Using Debian-based Node image for better package availability
FROM node:20-slim AS builder

# Install required dependencies for building
RUN apt-get update && apt-get install -y \
    git \
    openssh-client \
    python3 \
    make \
    g++ \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Setting up the work directory
WORKDIR /app

# Copying package.json and yarn.lock to install dependencies
COPY package.json ./
COPY yarn.lock* ./

# Clear yarn cache and install dependencies
RUN yarn cache clean && yarn install --frozen-lockfile

# Copying all the files in our project
COPY . .

# Set NODE_ENV for production build
ENV NODE_ENV=production
# ✅ Même URL pour développement et production
ARG VITE_API_URL=http://46.105.52.105:8889/api/
ENV VITE_API_URL=$VITE_API_URL 

# Clear any potential esbuild cache and build
RUN rm -rf node_modules/.vite && yarn build



# Fetching the latest nginx image
FROM nginx

# Copying built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copying our nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
