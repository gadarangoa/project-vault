# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim
WORKDIR /app
COPY server ./server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server/index.mjs"]
