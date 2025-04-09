# Dockerfile
FROM node:18-slim

# Install OpenJDK 17
RUN apt-get update && apt-get install -y openjdk-17-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a non-root user for enhanced security
RUN useradd -ms /bin/bash sandboxuser
USER sandboxuser

WORKDIR /home/sandboxuser/app

# Copy package manifest and install dependencies
COPY package.json .
RUN npm install --production

# Copy the rest of the application code
COPY sandbox.js .

# Expose the port used by the server
EXPOSE 3000

# Start the sandbox server
CMD [ "node", "sandbox.js" ]