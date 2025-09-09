# Use Node.js 20 Alpine base image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy common package (dependency)
COPY packages/common ./packages/common/

# Copy service package.json (so dependencies can be installed before full code)
COPY services/user-service/package.json ./services/user-service/

# Install all dependencies (workspace-aware)
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./ 
COPY packages/common/tsconfig.json ./packages/common/
COPY services/user-service/tsconfig.json ./services/user-service/


# Copy the rest of the service code
COPY services/user-service ./services/user-service/

# Build common package first (since it's a dependency)
RUN cd packages/common && pnpm run build

# Build the user-service
RUN cd services/user-service && pnpm run build

# Set environment variables for testing
ENV PORT=3002
ENV NODE_ENV=development

# Expose the port
EXPOSE 3002

# Start the service directly from build output
WORKDIR /app/services/user-service
CMD ["node", "dist/index.js"]
