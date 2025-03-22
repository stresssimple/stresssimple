# Use the official Node.js image as the base image
FROM node:latest AS build

RUN npm install -g @nestjs/cli pnpm

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

FROM node:latest AS production
WORKDIR /app
RUN npm install -g pnpm typescript

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN pnpm install --prod

# Expose the port the app runs on
EXPOSE 3333

# Define the command to run the app
CMD ["npm", "run", "start:prod"]