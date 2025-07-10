# Etapa de construcción (builder)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de definición de paquetes para aprovechar el caché de Docker
COPY package.json yarn.lock* package-lock.json* ./

# Instala las dependencias (incluyendo las de desarrollo para la construcción)
# Usa npm install si usas npm, o yarn install --frozen-lockfile si usas Yarn
RUN npm install --frozen-lockfile

# Copia el resto del código de la aplicación
COPY . .

# Genera el cliente Prisma (esto es crucial para que Prisma funcione en el contenedor)
# Asegúrate de que Prisma esté en las devDependencies de tu package.json
RUN npx prisma generate

# Compila la aplicación NestJS
# Asegúrate de que tu package.json tenga un script "build" (ej: "nest build")
RUN npm run build

# Etapa de producción (runner)
FROM node:20-alpine AS runner

WORKDIR /app

# Instala dependencias para la ejecución (solo las de producción)
# Esto reduce el tamaño de la imagen final al excluir dependencias de desarrollo
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --production --frozen-lockfile

# Copia los archivos compilados de la etapa de construcción
COPY --from=builder /app/dist ./dist

# Copia el cliente Prisma generado de la etapa de construcción
# Asegúrate de copiar solo los archivos necesarios de .prisma para mantener la imagen ligera
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copia el archivo schema.prisma (necesario para las migraciones y el cliente)
COPY prisma ./prisma

# Expone el puerto en el que se ejecutará tu aplicación NestJS
# Asegúrate de que coincida con el APP_PORT en tu .env y el puerto mapeado en docker-compose.yml
EXPOSE 3000

# Comando para ejecutar la aplicación
# Es buena práctica ejecutar las migraciones antes de iniciar la aplicación.
# Asegúrate de que tu package.json tenga un script "prisma:deploy" (ej: "npx prisma migrate deploy")
# y un script "start:prod" (ej: "node dist/main")
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]