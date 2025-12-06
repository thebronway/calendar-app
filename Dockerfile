# --- Stage 1: The Build Environment ---
# Use a Node.js image to build the React app.
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and install ALL dependencies
COPY package.json .
RUN npm install

# Copy all the source code
COPY . .

# Run the build script from package.json
# This compiles React/Tailwind into static files in a 'dist' folder.
RUN npm run build

# --- Stage 2: The Production Environment ---
# Use a lighter Node.js image for the final, small container
FROM node:18-alpine

WORKDIR /app

# Copy the package.json and install ONLY production dependencies
COPY package.json .
RUN npm install --omit=dev

# Copy the backend server
COPY server.js .

# Create the directory for the client files (as expected by server.js)
RUN mkdir -p /app/client/build

# Copy the *compiled* React app from the build stage
# This moves the contents of 'dist' into 'client/build'
COPY --from=build /app/dist /app/client/build

# This is the directory where the server will save the JSON data files.
# This will be mapped to a host folder.
VOLUME /app/data

# Set the port environment variable for the server (Modern Syntax)
ENV PORT=80

# Expose the new default port
EXPOSE 80

# The command to run the application
CMD ["node", "server.js"]

