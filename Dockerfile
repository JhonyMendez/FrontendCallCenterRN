# Imagen base
FROM node:20-alpine

# Variables de entorno para Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Exponer puertos
# 19000 -> JS bundle (móvil)
# 19001 -> WebSocket (Expo DevTools)
# 19002 -> DevTools web
# 3000 -> web
EXPOSE 19000 19001 19002 3000

# Comando para iniciar Expo con web y móvil
CMD ["npx", "expo", "start", "--tunnel"]