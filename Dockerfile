# Dockerfile with VNC support for browser automation (Alpine + noVNC)
FROM node:20-alpine

# Install Chromium, Xvfb, x11vnc, fluxbox, git, python3
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    xvfb \
    x11vnc \
    fluxbox \
    bash \
    git \
    python3 \
    py3-numpy \
    py3-pip

# Install noVNC and websockify
RUN git clone https://github.com/novnc/noVNC.git /opt/novnc && \
    git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify && \
    ln -s /opt/novnc/vnc.html /opt/novnc/index.html

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'export DISPLAY=:99' >> /app/start.sh && \
    echo 'Xvfb :99 -screen 0 1280x720x24 &' >> /app/start.sh && \
    echo 'sleep 2' >> /app/start.sh && \
    echo 'fluxbox &' >> /app/start.sh && \
    echo 'x11vnc -display :99 -forever -shared -rfbport 5900 -nopw &' >> /app/start.sh && \
    echo '/opt/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &' >> /app/start.sh && \
    echo 'node dist/main.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose ports
EXPOSE 5011 6080

# Set environment
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    DISPLAY=:99 \
    NODE_ENV=production

# Start script
CMD ["/app/start.sh"]
