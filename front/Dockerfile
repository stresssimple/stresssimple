# Use the official Node.js image as the base image
FROM node:latest AS builder

# Set the working directory
WORKDIR /app
RUN npm install -g pnpm

# Copy the build directory to the working directory
COPY package.json ./
# Install dependencies
RUN pnpm install 

COPY . .

RUN pnpm run build

FROM node:latest AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./

RUN npm install -g pnpm
RUN pnpm install --prod

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run","start"]