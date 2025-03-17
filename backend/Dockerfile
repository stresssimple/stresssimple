# Use the official Node.js image as the base image
FROM node:latest AS build

RUN npm install -g @nestjs/cli pnpm

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

FROM node:latest AS production
WORKDIR /usr/src/app
RUN npm install -g pnpm

# Copy the build output from the previous stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

RUN pnpm install --prod

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "start:prod"]