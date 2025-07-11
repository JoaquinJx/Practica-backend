@echo off
REM Script para ejecutar la aplicación con Docker Compose en Windows

echo 🚀 Iniciando aplicación con Docker Compose...

REM Parar contenedores existentes
echo ⏹️  Parando contenedores existentes...
docker-compose down

REM Construir e iniciar los servicios
echo 🏗️  Construyendo e iniciando servicios...
docker-compose up --build

echo ✅ Aplicación iniciada!
echo 🌐 Aplicación disponible en: http://localhost:3001
echo 📚 Swagger UI disponible en: http://localhost:3001/api
echo 🗄️  Adminer disponible en: http://localhost:8080
