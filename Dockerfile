FROM node:16.19.0 as build 
WORKDIR /home/app/api
COPY prisma ./prisma/
COPY package*.json ./
RUN npm install
COPY . .

# Run Prettier and fail if differences are found
RUN npx prettier --config ./.prettierrc.json --list-different "src/**/*.ts" | grep . && exit 1 || true


RUN  npm run lint | grep problem && exit 1 || true

RUN npm exec prisma generate && npm run build

# Final stage
FROM node:16.19.0 AS final

WORKDIR /home/app/api

COPY --from=build /home/app/api .

EXPOSE 3002

CMD ["npm", "run", "start", "--host", "0.0.0.0"]