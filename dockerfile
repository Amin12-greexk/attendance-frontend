# Stage 1: Build Stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy sisa file aplikasi
COPY . .

# Build aplikasi untuk production
# Set variabel NEXT_PUBLIC_API_URL saat build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine

WORKDIR /app

# Copy hasil build dari stage sebelumnya
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Expose port 3000
EXPOSE 3000

# Perintah untuk menjalankan aplikasi Next.js
CMD ["npm", "start"]