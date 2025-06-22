# 🐾 Pet Management API v2.0

Una API segura y escalable para la gestión de mascotas con integración de MongoDB Atlas, códigos QR y geolocalización.

## ✨ Características

### 🔒 Seguridad
- **Autenticación JWT** con tokens seguros
- **Rate Limiting** para prevenir ataques de fuerza bruta
- **Helmet.js** para headers de seguridad
- **CORS** configurado para orígenes permitidos
- **Validación de entrada** con sanitización
- **Bcrypt** para hash de contraseñas (12 rounds)
- **Validación de contraseñas** con requisitos de seguridad

### 🚀 Rendimiento
- **Caché inteligente** para geolocalización de IP
- **Caché de códigos QR** para mejor rendimiento
- **Índices de base de datos** optimizados
- **Compresión de respuestas** automática
- **Logging estructurado** para monitoreo

### 📊 Funcionalidades
- **CRUD completo** para mascotas y usuarios
- **Generación automática de códigos QR**
- **Geolocalización de IP** con ipwho.is
- **Historial de vistas** con información de dispositivo
- **Sistema de permisos** basado en roles
- **Auditoría completa** de cambios

## 🛠️ Tecnologías

- **Node.js** (v18+)
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de datos
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Bcrypt** - Hash de contraseñas
- **Helmet** - Seguridad
- **Rate Limiting** - Protección contra ataques
- **QRCode** - Generación de códigos QR
- **ipwho.is** - Geolocalización de IP

## 📦 Instalación

### Prerrequisitos
- Node.js 18.0.0 o superior
- npm 8.0.0 o superior
- MongoDB Atlas (cuenta gratuita)

### 1. Clonar el repositorio
```bash
git clone https://github.com/yourusername/pet-management-api.git
cd pet-management-api
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret (generar una clave segura)
JWT_SECRET=your-super-secret-jwt-key-here

# Base URL for pet links
BASE_URL=http://localhost:3000

# Environment
NODE_ENV=development

# Port
PORT=3000
```

### 4. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm start           # Ejecutar en producción
npm test            # Ejecutar tests
npm run lint        # Verificar código
npm run lint:fix    # Corregir problemas de linting
npm run security:audit  # Auditoría de seguridad
npm run security:fix    # Corregir vulnerabilidades
npm run health      # Verificar estado del servidor
```

## 📚 API Endpoints

### 🔐 Autenticación
```
POST /api/users/login
```

### 👥 Usuarios
```
GET    /api/users              # Obtener todos los usuarios (Admin)
GET    /api/users/:id          # Obtener usuario específico (Admin)
POST   /api/users/register     # Registrar usuario (Admin)
PUT    /api/users/:id          # Actualizar usuario (Admin)
DELETE /api/users/:id          # Eliminar usuario (Admin)
```

### 🐕 Mascotas
```
GET    /api/pets               # Obtener mascotas (filtrado por rol)
GET    /api/pets/my-pets       # Obtener mis mascotas
GET    /api/pets/owner/:id     # Obtener mascotas por dueño
GET    /api/pets/:id           # Obtener mascota específica
GET    /api/pets/:id/history   # Obtener historial de vistas
POST   /api/pets               # Crear mascota (Admin)
PUT    /api/pets/:id           # Actualizar mascota
DELETE /api/pets/:id           # Eliminar mascota (Admin)
```

### 🏥 Salud
```
GET    /health                 # Estado del servidor
GET    /                       # Información de la API
```

## 🔐 Sistema de Permisos

### Roles de Usuario
- **Admin (userType: 1)**: Acceso completo a todas las funcionalidades
- **Pet Owner (userType: 2)**: Solo puede gestionar sus propias mascotas

### Permisos Específicos
- `canManageUsers`: Gestionar usuarios
- `canManageAllPets`: Gestionar todas las mascotas
- `canViewAllPets`: Ver todas las mascotas
- `canEditAllPets`: Editar todas las mascotas
- `canDeleteAllPets`: Eliminar todas las mascotas
- `canViewOwnPets`: Ver propias mascotas
- `canEditOwnPets`: Editar propias mascotas

## 📊 Formato de Respuestas

### ✅ Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {...}
}
```

### ❌ Respuesta de Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "data": null
}
```

## 🔒 Medidas de Seguridad

### Protección contra Ataques
- **Rate Limiting**: 100 requests por 15 minutos
- **Login Rate Limiting**: 5 intentos por 15 minutos
- **CORS**: Orígenes permitidos configurados
- **Helmet**: Headers de seguridad
- **Input Sanitization**: Sanitización de entrada
- **Password Validation**: Validación de contraseñas fuertes

### Validaciones
- **Email**: Formato válido
- **Password**: Mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
- **Phone**: Formato de teléfono válido
- **ObjectId**: Validación de MongoDB ObjectId

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=very-secure-jwt-secret
BASE_URL=https://yourdomain.com
PORT=3000
```

### Recomendaciones de Producción
- Usar HTTPS
- Configurar firewall
- Monitorear logs
- Backup regular de base de datos
- Usar PM2 o similar para gestión de procesos

## 📈 Monitoreo

### Logs
- Request logging automático
- Error logging estructurado
- Performance metrics

### Health Check
```bash
curl http://localhost:3000/health
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

## 🔄 Changelog

### v2.0.0
- ✨ Refactorización completa del código
- 🔒 Mejoras de seguridad significativas
- 🚀 Optimización de rendimiento
- 📊 Sistema de caché inteligente
- 🛡️ Protección contra ataques modernos
- 📝 Documentación completa

### v1.0.0
- 🎉 Versión inicial
- 📦 Funcionalidades básicas de CRUD
- 🔐 Autenticación JWT
- 🐕 Gestión de mascotas