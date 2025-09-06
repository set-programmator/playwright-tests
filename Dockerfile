FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install browsers
RUN npx playwright install

# Create reports directory
RUN mkdir -p reports

# Set environment variables
ENV CI=true
ENV NODE_ENV=production

# Run tests by default
CMD ["npm", "run", "test:parallel"]