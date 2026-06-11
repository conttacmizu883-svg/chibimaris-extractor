const express = require('express');
const path = require('path');
const app = express();

// Esto le dice al servidor que busque los archivos en la carpeta donde está servidor.js
app.use(express.static(__dirname));

// Esto le dice que cuando alguien entre a la raíz (/), abra index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Tu lógica de extracción (tu API) debe ir aquí debajo, por ejemplo:
app.get('/api/extract', (req, res) => {
    // Aquí iría tu lógica actual de extracción
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
