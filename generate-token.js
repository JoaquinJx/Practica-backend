// Script para generar un token JWT manualmente para testing
const jwt = require('jsonwebtoken');

// Tu JWT_SECRET del .env
const JWT_SECRET = '68c44aa5fee086f87bc0d1a404847c11474016661dacc0b55125be64eca35690';

// Payload del token (simula un usuario)
const payload = {
  userEmail: 'test@example.com',
  sub: '12345678-1234-1234-1234-123456789012', // UUID ficticio
  role: 'ADMIN', // Cambia por USER, MODERATOR o ADMIN según necesites
  iat: Math.floor(Date.now() / 1000), // Issued at
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // Expira en 24 horas
};

// Generar el token
const token = jwt.sign(payload, JWT_SECRET);

console.log('🔑 Token JWT generado:');
console.log(token);
console.log('\n📋 Para usar en Postman:');
console.log('Authorization: Bearer ' + token);
console.log('\n👤 Usuario simulado:');
console.log('Email:', payload.userEmail);
console.log('Role:', payload.role);
console.log('Expira en: 24 horas');
