FROM node:20-slim AS build

WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk wget unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json and install dependencies
COPY package.json ./
# Use npm install instead of npm ci since we don't have a package-lock.json file
RUN npm install

# Copy source code and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Download a specific version of Eclipse JDT Language Server instead of latest snapshot
COPY jdt-language-server-1.37.0-202406271335.tar.gz ./

RUN mkdir -p /app/ls && \
    tar -xzf jdt-language-server-1.37.0-202406271335.tar.gz -C /app/ls && \
    rm jdt-language-server-1.37.0-202406271335.tar.gz && \
    echo "LS Directory Structure:" && \
    (find /app/ls -type f -name "*.jar" | grep -i launcher) || true && \
    chmod -R 755 /app/ls

# Create workspace directory and add sample Java file
RUN mkdir -p /app/workspace && \
    echo "public class hello {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println(\"Hello, World!\");\n\t}\n}" > /app/workspace/hello.java

# Create a smaller runtime image
FROM node:20-slim

WORKDIR /app

# Install Java
RUN apt-get update && \
    apt-get install -y openjdk-17-jre && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built files from build stage
COPY --from=build /app/lib ./lib
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/ls ./ls
COPY --from=build /app/workspace ./workspace
COPY package.json ./

# Expose the port
EXPOSE 30003

# Set the command to run the server
CMD ["npm", "start"]