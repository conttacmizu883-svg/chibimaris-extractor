    // NUEVA FUNCIÓN ASÍNCRONA: Extrae streams en tiempo real usando POST hacia Render
    async function procesarMasivo() {
        const textoCompleto = document.getElementById('rawInput').value.trim();
        if(!textoCompleto) return chibimarisAviso("⚠️ Por favor, pega tus bloques de episodios.");

        const btn = document.getElementById('btnProcesar');
        btn.innerText = "⏳ EXTRAENDO VIDEOS DE LAS PÁGINAS...";
        btn.disabled = true;

        let resultadosTexto = [];
        let resultadosHTML = [];
        let urlBase = window.location.href.split('?')[0];

        // Separar el cuadro de texto oscuro por bloques estándar tradicionales
        const bloques = textoCompleto.split(/(====*\s*(?:EPISODIO|CAPITULO|CAP|EP)\s*\d+\s*====*|====*\s*OPCIONES\s*====*)/i);
        if (bloques.length < 2) {
            btn.innerText = "Generar Enlaces Integrados";
            btn.disabled = false;
            return chibimarisAviso("❌ Formato no reconocido. Asegúrate de usar '=== EPISODIO 1 ==='");
        }

        for (let i = 1; i < bloques.length; i += 2) {
            let encabezadoOriginal = bloques[i].trim();
            let contenidoEpisodio = bloques[i + 1];
            if (!contenidoEpisodio) continue;

            let tipoContenido = "serie";
            let numeroEp = "1";
            let tituloEstandar = "";

            if (encabezadoOriginal.toUpperCase().includes("OPCIONES")) {
                tipoContenido = "pelicula";
                tituloEstandar = "=== OPCIONES ===";
            } else {
                const matchNumero = encabezadoOriginal.match(/\d+/);
                numeroEp = matchNumero ? matchNumero[0] : "1";
                tituloEstandar = `=== EPISODIO ${numeroEp} ===`;
            }

            // Extraer la URL de la página fuente (peliculaplay, etc) pegada en el bloque
            let matchUrlPagina = contenidoEpisodio.match(/https?:\/\/[^\s"'\n]+/i);
            
            if (matchUrlPagina) {
                let urlPaginaCapitulo = matchUrlPagina[0].trim();
                let servidoresEncontrados = [];

                try {
                    // CORRECCIÓN: Enviamos una petición POST con formato JSON compatible con tu server.js
                    const response = await fetch("https://chibimaris-extractor.onrender.com/api/extract", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ texto: urlPaginaCapitulo })
                    });
                    
                    const data = await response.json();

                    // Adaptamos la lectura de la respuesta que genera Axios + Cheerio
                    if(data.status === "success" && data.resultados && data.resultados.length > 0) {
                        data.resultados.forEach(res => {
                            if (res.stream && res.stream !== "No detectado") {
                                servidoresEncontrados.push(`CHIBIMARIS PREMIUM|${res.stream}`);
                            }
                        });
                    }
                } catch (err) {
                    console.error("Error consultando el extractor de Render para la URL:", urlPaginaCapitulo);
                }

                // Si falló el extractor o no detectó streams directos, metemos la URL original como fallback
                if(servidoresEncontrados.length === 0) {
                    servidoresEncontrados.push(`FUENTE ORIGINAL|${urlPaginaCapitulo}`);
                }

                let idIdentificador = (tipoContenido === "pelicula") ? "MOVIE" : numeroEp;
                let stringData = idIdentificador + "||" + servidoresEncontrados.join(',');
                let dataProtegida = encriptarDatos(stringData);
                let urlFinal = `${urlBase}?videos=${dataProtegida}`;

                resultadosTexto.push(`${tituloEstandar}\n\n🎬 VIDEOS:\n[Chibimaris]\n${urlFinal}`);
                resultadosHTML.push(`${tituloEstandar}\n\n🎬 VIDEOS:\n[Chibimaris]\n<span class="link-color">${urlFinal}</span>`);
            }
        }

        btn.innerText = "Generar Enlaces Integrados";
        btn.disabled = false;

        if(resultadosTexto.length === 0) return chibimarisAviso("⚠️ No se pudieron extraer videos válidos.");
        
        document.getElementById('linkOutput').innerHTML = resultadosHTML.join("\n\n");
        textoResultadoGlobal = resultadosTexto.join("\n\n");
        document.getElementById('resultArea').style.display = 'block';
    }
