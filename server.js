const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/extract', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: 'Falta la URL destino' });

    try {
        const response = await axios.get(targetUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' 
            }
        });
        
        const html = response.data;
        
        // Expresión para buscar la fuente de video en peliculaplay
        const streamRegex = /["']?file["']?\s*:\s*["'](https?:\/\/.*?\.m3u8.*?)["']/i;
        const match = html.match(streamRegex);

        if (match) {
            return res.json({
                success: true,
                source: match[1],
                subtitles: []
            });
        }

        res.status(404).json({ error: 'No se encontraron fuentes de video disponibles.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar o procesar la web de origen.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Extractor activo en puerto ${PORT}`));
