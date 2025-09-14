@echo off
echo ===============================================================
echo 🧪 PRUEBAS DEL SISTEMA DE CHAT Y NOTIFICACIONES
echo ===============================================================
echo.

set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluLm5vcnRlIiwicm9sIjoiQWRtaW5pc3RyYWRvciIsImV4cCI6MTc1Nzc5NDI0MSwiaWF0IjoxNzU3NzA3ODQxfQ.7TKuUN9fJirw-IOJ3jF4HZxSiJmKgTp8t9iZHNBVFWM
set API_BASE=http://localhost:5000

echo 🔍 Verificando conectividad del backend...
curl -s -o nul -w "Status: %%{http_code}" "%API_BASE%/api/test" || echo ERROR: No se puede conectar al backend
echo.
echo.

echo 📋 Probando endpoints del sistema...
echo.

echo ✅ Test API basico:
curl -s -w "Status: %%{http_code}" "%API_BASE%/api/test"
echo.
echo.

echo 🔒 Test autenticacion (conversaciones):
curl -s -w "Status: %%{http_code}" -H "Authorization: Bearer %TOKEN%" "%API_BASE%/api/chat/conversaciones"
echo.
echo.

echo 👥 Test usuarios disponibles:
curl -s -w "Status: %%{http_code}" -H "Authorization: Bearer %TOKEN%" "%API_BASE%/api/chat/usuarios-disponibles" 
echo.
echo.

echo 🔔 Test notificaciones:
curl -s -w "Status: %%{http_code}" -H "Authorization: Bearer %TOKEN%" "%API_BASE%/api/notificaciones"
echo.
echo.

echo 📊 Test estadisticas:
curl -s -w "Status: %%{http_code}" -H "Authorization: Bearer %TOKEN%" "%API_BASE%/api/notificaciones/estadisticas"
echo.
echo.

echo 🏁 Pruebas completadas.
echo.
echo 💡 Códigos de estado:
echo    200 = OK
echo    401 = No autorizado (token inválido)
echo    404 = Endpoint no encontrado  
echo    500 = Error del servidor
echo.
pause