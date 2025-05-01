FROM node:20-slim

# Install deps
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libxss1 \
    libgtk-3-0 \
    libnss3 \
    libasound2 \
    libx11-xcb1 \
    xdg-utils \
    chromium

# Create app directory
WORKDIR /app
COPY . .

RUN npm install

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

CMD ["node", "index.js"]

