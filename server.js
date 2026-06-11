const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Servir la interfaz web principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta POST que recibe el texto con los enlaces desde el index.html
app.post('/api/extract', async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto) {
            return res.status(400).json({ status: "error", message: "No se proporcionó texto" });
        }

        // Expresión regular para capturar URLs válidas en el texto introducido
        const regexUrl = /(https?:\/\/[^\s]+)/g;
        const enlaces Encontrados = texto.match(regexUrl) || [];
        
        let resultados = [];

        // Procesamos cada enlace de forma limpia usando peticiones HTTP ligeras
        for (const url of enlacesEncontrados) {
            try {
                // Descargamos el HTML de la página sin levantar un navegador pesado
                const respuestaHtml = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    timeout: 8000 // Evita que se quede colgado eternamente si la web no responde
                });

                const $ = cheerio.load(respuestaHtml.data);
                let videoUrl = '';

                // EJEMPLO DE BÚSQUEDA: Busca iframes de reproductores comunes (Fembed, Okru, Mega, etc.)
                // Aquí debes adaptarlo según las etiquetas exactas de la web que extraes
                $('iframe').each((i, el) => {
                    const src = $(el).attr('src');
                    if (src && (src.includes('embed') || src.includes('player') || src.includes('stream'))) {
                        videoUrl = src;
                    }
                });

                if (videoUrl) {
                    resultados.push({ origen: url, stream: videoUrl });
                } else {
                    resultados.push({ origen: url, stream: "No se detectó un reproductor compatible directamente." });
                }

            } catch (err) {
                resultados.push({ origen: url, stream: `Error al acceder a la página: ${err.message}` });
            }
        }

        // Devolvemos la respuesta estructurada al frontend inmediatamente
        res.json({ status: "success", resultados });

    } catch (error) {
        console.error("Error del servidor:", error);
        res.status(500).json({ status: "error", message: "Error interno del extractor en Render" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Chibimaris activo en puerto ${PORT}`));
