const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// ESTO ARREGLA EL "CANNOT GET /" -> Le dice al servidor que muestre tu index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para procesar la extracción de videos
app.post('/api/extract', async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto) {
            return res.status(400).json({ status: "error", message: "No texto" });
        }

        const regexUrl = /(https?:\/\/[^\s]+)/g;
        const enlaces = texto.match(regexUrl) || [];
        let resultados = [];

        for (const url of enlaces) {
            try {
                const respuestaHtml = await axios.get(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' },
                    timeout: 8000
                });
                const $ = cheerio.load(respuestaHtml.data);
                let videoUrl = '';

                $('iframe').each((i, el) => {
                    const src = $(el).attr('src');
                    if (src && (src.includes('embed') || src.includes('player') || src.includes('stream'))) {
                        videoUrl = src;
                    }
                });

                resultados.push({ origen: url, stream: videoUrl || "No detectado" });
            } catch (err) {
                resultados.push({ origen: url, stream: "Error de conexión" });
            }
        }
        res.json({ status: "success", resultados });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
