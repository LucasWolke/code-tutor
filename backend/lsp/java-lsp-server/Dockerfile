# syntax=docker/dockerfile:1

########################################
#               BUILDER
########################################
FROM node:20-slim AS builder
LABEL stage=builder

ARG DEBIAN_FRONTEND=noninteractive
ARG JDT_VERSION=1.37.0-202406271335
ARG JDT_TARBALL=jdt-language-server-${JDT_VERSION}.tar.gz

WORKDIR /app

# Install build deps
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         openjdk-17-jdk-headless wget unzip \
    && rm -rf /var/lib/apt/lists/*

# Install JS deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build TS
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# Unpack JDT LS, flatten top-level folder, list JARs, set perms
COPY ${JDT_TARBALL} ./
RUN mkdir ls \
    && tar --strip-components=1 -xzf ${JDT_TARBALL} -C ls \
    && rm ${JDT_TARBALL} \
    && echo "LS JARs:" \
    && find ls -type f -name "*.jar" || true \
    && chmod -R a+rX ls

# Sample Java workspace
RUN mkdir workspace \
    && echo 'public class Hello {' > workspace/Hello.java \
    && echo '    public static void main(String[] args) {' >> workspace/Hello.java \
    && echo '        System.out.println("Hello, World!");' >> workspace/Hello.java \
    && echo '    }' >> workspace/Hello.java \
    && echo '}' >> workspace/Hello.java

########################################
#               RUNTIME
########################################
FROM node:20-slim AS runtime
LABEL stage=runtime

ARG DEBIAN_FRONTEND=noninteractive
WORKDIR /app

# Install only JRE
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Production mode
ENV NODE_ENV=production

# Copy artifacts
COPY --from=builder /app/lib        ./lib
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ls         ./ls
COPY --from=builder /app/workspace  ./workspace
COPY --from=builder /app/package.json ./

# Strip out any devDeps
RUN npm prune --production

# Drop to non-root: use built-in `node` user
RUN chown -R node:node /app
USER node

EXPOSE 30003
CMD ["npm", "start"]
