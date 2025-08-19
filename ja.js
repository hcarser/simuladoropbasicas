        // --- Elementos del DOM ---
        const comenzarBtn = document.getElementById('comenzar');
        const verificarBtn = document.getElementById('verificar');
        const siguienteBtn = document.getElementById('siguiente');
        const operacionSelect = document.getElementById('operacion');
        const dificultadSelect = document.getElementById('dificultad');
        
        const problemaContainer = document.getElementById('problema');
        const estadoInicialDiv = document.getElementById('estado-inicial');
        const problemaActivoDiv = document.getElementById('problema-activo');
        
        const operacionActualElement = document.getElementById('operacion-actual');
        const respuestaInput = document.getElementById('respuesta');
        const resultadoElement = document.getElementById('resultado');
        
        const totalProblemasElement = document.getElementById('total-problemas');
        const totalCorrectosElement = document.getElementById('total-correctos');
        const totalIncorrectosElement = document.getElementById('total-incorrectos');
        const precisionElement = document.getElementById('precision');

        // --- Variables de estado ---
        let resultadoCorrecto;
        let problemaActivo = false;
        let estadisticas = { total: 0, correctos: 0, incorrectos: 0 };
        let historialProblemas = new Set();

        // --- Plantillas para Nivel Extremo ---
        const plantillasProblemas = {
            suma: [
                "En una biblioteca hay {n1} libros de ficción y {n2} de no ficción. ¿Cuántos libros hay en total?",
                "Un granjero recogió {n1} huevos por la mañana y {n2} por la tarde. ¿Cuántos huevos recogió en el día?",
                "Laura ahorró ${n1} en enero y ${n2} en febrero. ¿Cuánto dinero ahorró en los dos meses?",
                "Un avión voló {n1} km en la primera parte de su viaje y {n2} km en la segunda. ¿Cuál fue la distancia total del vuelo?",
                "Un videojuego tiene {n1} puntos en el primer nivel y {n2} en el segundo. ¿Cuál es el puntaje total?",
                "Para un concierto se vendieron {n1} boletos en línea y {n2} en taquilla. ¿Cuántos boletos se vendieron en total?"
            ],
            resta: [
                "Tenías ${n1} y gastaste ${n2} en un helado. ¿Cuánto dinero te queda?",
                "Un libro tiene {n1} páginas. Si ya has leído {n2} páginas, ¿cuántas te faltan por leer?",
                "Un estacionamiento tiene capacidad para {n1} autos. Si hay {n2} autos estacionados, ¿cuántos lugares quedan libres?",
                "De un tanque de agua de {n1} litros, se usaron {n2} litros. ¿Cuánta agua queda en el tanque?",
                "Una montaña mide {n1} metros de altura. Un escalador ha subido {n2} metros. ¿Cuántos metros le faltan para llegar a la cima?",
                "Un avión debe recorrer {n1} km. Si ya ha volado {n2} km, ¿cuántos km le faltan para llegar a su destino?"
            ],
            multiplicacion: [
                "Una sala de cine tiene {n1} filas con {n2} asientos cada una. ¿Cuántas personas pueden sentarse en total?",
                "Si un paquete de galletas tiene {n2} galletas, ¿cuántas galletas hay en {n1} paquetes?",
                "Un atleta corre {n2} km cada día. ¿Cuántos km correrá en {n1} días?",
                "Para una receta se necesitan {n2} huevos por pastel. ¿Cuántos huevos se necesitan para hacer {n1} pasteles?",
                "En una granja hay {n1} vacas y cada una produce {n2} litros de leche al día. ¿Cuántos litros de leche se producen en total diariamente?",
                "Un programador escribe {n2} líneas de código por hora. ¿Cuántas líneas escribirá en una jornada de {n1} horas?"
            ],
            division: [
                "Se quieren repartir {n1} caramelos equitativamente entre {n2} amigos. ¿Cuántos caramelos recibe cada uno?",
                "Un mazo de {n1} cartas se divide en partes iguales entre {n2} jugadores. ¿Cuántas cartas le tocan a cada uno?",
                "Un grupo de {n1} estudiantes se va de excursión en furgonetas con capacidad para {n2} personas. ¿Cuántas furgonetas se necesitan?",
                "Si {n2} lápices cuestan ${n1} en total, ¿cuánto cuesta un solo lápiz?",
                "Un fotógrafo tomó {n1} fotos y quiere guardarlas en álbumes de {n2} fotos cada uno. ¿Cuántos álbumes necesitará?",
                "Una fábrica produjo {n1} tornillos que deben ser empacados en cajas de {n2} unidades. ¿Cuántas cajas se pueden llenar?"
            ],
            combinada: [
                "Compras {n1} camisetas a ${n2} cada una y pagas con un billete de ${n3}. ¿Cuánto vuelto recibes?",
                "Un equipo de baloncesto anotó {n1} canastas de 2 puntos y {n2} de 3 puntos. ¿Cuántos puntos consiguieron en total?",
                "Se hornean {n1} galletas. Se guardan {n2} para la familia y el resto se empaca en bolsas de {n3}. ¿Cuántas bolsas se llenan?",
                "Empiezas con ${n1}. Ganas ${n2} por un trabajo y luego gastas la mitad de tu dinero total en un juego. ¿Cuánto dinero te queda?",
                "Ahorras ${n1} a la semana durante {n2} semanas. De tus ahorros, gastas ${n3} en un regalo. ¿Cuánto dinero te queda?",
                "Un agricultor cosecha {n1} sacos de papas. Vende {n2} sacos y el resto lo reparte entre sus {n3} hijos. ¿Cuántos sacos recibe cada hijo?"
            ]
        };

        // --- Event Listeners ---
        comenzarBtn.addEventListener('click', comenzarDesafio);
        verificarBtn.addEventListener('click', verificarRespuesta);
        siguienteBtn.addEventListener('click', generarProblema);
        respuestaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (!verificarBtn.disabled) {
                    verificarRespuesta();
                } else if (!siguienteBtn.disabled) {
                    generarProblema();
                }
            }
        });

        // --- Funciones principales ---
        function comenzarDesafio() {
            problemaContainer.style.display = 'flex';
            estadoInicialDiv.classList.add('hidden');
            problemaActivoDiv.classList.remove('hidden');
            
            historialProblemas.clear(); 
            resetearEstadisticas();
            generarProblema();
            problemaActivo = true;
        }

        function generarNumero(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function generarProblemaDeAplicacion(operacion) {
            const plantillas = plantillasProblemas[operacion];
            if (!plantillas) return null;
            const plantillaElegida = plantillas[Math.floor(Math.random() * plantillas.length)];

            let n1, n2, n3, res, textoProblema, clave;
            
            if (operacion === 'suma') {
                n1 = generarNumero(100, 9999); n2 = generarNumero(100, 9999);
                res = n1 + n2;
                textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                clave = `app-suma-${n1}-${n2}`;
            } else if (operacion === 'resta') {
                n1 = generarNumero(100, 9999); n2 = generarNumero(10, n1 - 1);
                res = n1 - n2;
                textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                clave = `app-resta-${n1}-${n2}`;
            } else if (operacion === 'multiplicacion') {
                const patron = Math.floor(Math.random() * 4);
                let numA, numB;
                switch(patron) {
                    case 0: numA = generarNumero(100, 999); numB = generarNumero(10, 99); break;
                    case 1: numA = generarNumero(100, 999); numB = generarNumero(100, 999); break;
                    case 2: numA = generarNumero(1000, 9999); numB = generarNumero(100, 999); break;
                    case 3: numA = generarNumero(1000, 9999); numB = generarNumero(100, 99); break;
                }
                n1 = Math.min(numA, numB);
                n2 = Math.max(numA, numB);
                res = n1 * n2;
                textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                clave = `app-multiplicacion-${n1}-${n2}`;
            } else if (operacion === 'division') {
                n2 = generarNumero(5, 50);
                res = generarNumero(10, 100);
                n1 = n2 * res;
                textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                clave = `app-division-${n1}-${n2}`;
            } else if (operacion === 'combinada') {
                 if (plantillaElegida.includes('vuelto')) {
                    n1 = generarNumero(3, 8); n2 = generarNumero(5, 15);
                    n3 = (n1 * n2) + generarNumero(10, 50);
                    res = n3 - (n1 * n2);
                    textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2).replace('{n3}', n3);
                    clave = `app-comb-${n3}-${n1}-${n2}`;
                } else if (plantillaElegida.includes('puntos')) {
                    n1 = generarNumero(5, 15); n2 = generarNumero(3, 10);
                    res = (n1 * 2) + (n2 * 3);
                    textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                    clave = `app-comb-${n1}-${n2}-puntos`;
                } else if (plantillaElegida.includes('ahorras')) {
                    n1 = generarNumero(10, 50); 
                    n2 = generarNumero(4, 12); 
                    n3 = generarNumero(20, (n1*n2)-10);
                    res = (n1 * n2) - n3;
                    textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2).replace('{n3}', n3);
                    clave = `app-comb-ahorro-${n1}-${n2}-${n3}`;
                } else if (plantillaElegida.includes('agricultor')) {
                    n3 = generarNumero(2, 5); 
                    n2 = generarNumero(10, 20); 
                    let porHijo = generarNumero(5, 15);
                    n1 = (n3 * porHijo) + n2; 
                    res = porHijo;
                    textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2).replace('{n3}', n3);
                    clave = `app-comb-agro-${n1}-${n2}-${n3}`;
                } else { 
                     if (plantillaElegida.includes('bolsas')) {
                        n3 = generarNumero(5, 12); 
                        let numeroDeBolsas = generarNumero(10, 20);
                        n2 = generarNumero(10, 30); 
                        n1 = (numeroDeBolsas * n3) + n2 + generarNumero(0, n3 - 1); 
                        res = Math.floor((n1 - n2) / n3); 
                        textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2).replace('{n3}', n3);
                        clave = `app-comb-${n1}-${n2}-${n3}`;
                    } else { 
                        n1 = generarNumero(50, 100);
                        n2 = generarNumero(20, 80);
                        res = Math.floor((n1 + n2) / 2);
                        textoProblema = plantillaElegida.replace('{n1}', n1).replace('{n2}', n2);
                        clave = `app-comb-mitad-${n1}-${n2}`;
                    }
                }
            }
            
            return { texto: textoProblema, resultado: res, clave: clave };
        }

        function generarProblemaNumerico(operacion, dificultad) {
            let n1, n2, res, texto, clave;

            if (operacion === 'suma' || operacion === 'resta') {
                if (dificultad === 'facil') { n1 = generarNumero(1, 9); n2 = generarNumero(1, 9); }
                else if (dificultad === 'medio') { n1 = generarNumero(10, 99); n2 = generarNumero(10, 99); }
                else { n1 = generarNumero(100, 999); n2 = generarNumero(100, 999); }
                
                if(operacion === 'suma') {
                    res = n1 + n2;
                    texto = `${n1} + ${n2} =`;
                    clave = `suma-${n1}-${n2}`;
                } else {
                    if (n1 < n2) [n1, n2] = [n2, n1]; // Ensure n1 is bigger
                    res = n1 - n2;
                    texto = `${n1} - ${n2} =`;
                    clave = `resta-${n1}-${n2}`;
                }
            } else if (operacion === 'multiplicacion') {
                if (dificultad === 'facil') {
                    n1 = generarNumero(1, 10); n2 = generarNumero(1, 10);
                } else if (dificultad === 'medio') {
                    n1 = generarNumero(10, 99); n2 = generarNumero(10, 99);
                } else { // dificil
                    const patron = Math.floor(Math.random() * 4);
                    switch(patron) {
                        case 0: n1 = generarNumero(100, 999); n2 = generarNumero(10, 99); break;
                        case 1: n1 = generarNumero(100, 999); n2 = generarNumero(100, 999); break;
                        case 2: n1 = generarNumero(1000, 9999); n2 = generarNumero(100, 999); break;
                        case 3: n1 = generarNumero(1000, 9999); n2 = generarNumero(10, 99); break;
                    }
                }
                res = n1 * n2;
                texto = `${n1} × ${n2} =`;
                clave = `mul-${n1}-${n2}`;
            } else if (operacion === 'division') {
                if (dificultad === 'facil') { n2 = generarNumero(2, 9); res = generarNumero(2, 9); }
                else if (dificultad === 'medio') { n2 = generarNumero(2, 12); res = generarNumero(10, 99); }
                else { n2 = generarNumero(10, 99); res = generarNumero(10, 99); }
                n1 = n2 * res;
                texto = `${n1} ÷ ${n2} =`;
                clave = `div-${n1}-${n2}`;
            }

            return { texto, resultado: res, clave };
        }
        
        function generarProblemaCombinado(dificultad) {
            let n1, n2, n3, n4, res, texto;
            if (dificultad === 'facil') {
                const patron = Math.floor(Math.random() * 3);
                switch(patron) {
                    case 0: 
                        n1 = generarNumero(2, 9); n2 = generarNumero(2, 9);
                        n4 = generarNumero(2, 9); n3 = n4 * generarNumero(2, 9);
                        res = (n1 * n2) + (n3 / n4);
                        texto = `(${n1} × ${n2}) + (${n3} ÷ ${n4}) =`;
                        break;
                    case 1:
                        n1 = generarNumero(2, 9); n2 = generarNumero(2, 9);
                        n3 = generarNumero(2, 9); n4 = generarNumero(2, 9);
                        res = (n1 * n2) + (n3 * n4);
                        texto = `(${n1} × ${n2}) + (${n3} × ${n4}) =`;
                        break;
                    case 2:
                        n2 = generarNumero(2, 9); n1 = n2 * generarNumero(2, 9);
                        n4 = generarNumero(2, 9); n3 = n4 * generarNumero(2, 9);
                        res = (n1 / n2) + (n3 / n4);
                        texto = `(${n1} ÷ ${n2}) + (${n3} ÷ ${n4}) =`;
                        break;
                }
            } else if (dificultad === 'medio') {
                n1 = generarNumero(10, 30); n2 = generarNumero(10, 30);
                n3 = generarNumero(2, 9);
                res = (n1 + n2) * n3;
                texto = `(${n1} + ${n2}) × ${n3} =`;
            } else {
                n2 = generarNumero(10, 25); n3 = generarNumero(5, 10);
                n1 = (n2 * n3) + generarNumero(20, 50);
                n4 = generarNumero(10, 50);
                res = n1 - (n2 * n3) + n4;
                texto = `${n1} - (${n2} × ${n3}) + ${n4} =`;
            }
            return { texto: texto, resultado: res, clave: `comb-${n1}-${n2}-${n3}-${n4}` };
        }

        function generarProblema() {
            const tipoOperacion = operacionSelect.value;
            const dificultad = dificultadSelect.value;
            
            operacionActualElement.classList.remove('text-xl', 'font-normal', 'text-left', 'text-3xl');
            operacionActualElement.classList.add('text-5xl', 'md:text-6xl', 'font-bold', 'text-center');

            let problema;
            let intentos = 0;

            do {
                intentos++;
                if (dificultad === 'extremo') {
                    problema = generarProblemaDeAplicacion(tipoOperacion);
                } else if (tipoOperacion === 'combinada') {
                    problema = generarProblemaCombinado(dificultad);
                    operacionActualElement.classList.remove('text-5xl', 'md:text-6xl');
                    operacionActualElement.classList.add('text-3xl');
                } else {
                    problema = generarProblemaNumerico(tipoOperacion, dificultad);
                }
            } while (!problema || (historialProblemas.has(problema.clave) && intentos < 50));

            historialProblemas.add(problema.clave);
            resultadoCorrecto = problema.resultado;
            operacionActualElement.textContent = problema.texto;

            if (dificultad === 'extremo') {
                operacionActualElement.classList.remove('text-5xl', 'md:text-6xl', 'font-bold', 'text-center');
                operacionActualElement.classList.add('text-xl', 'font-normal', 'text-left');
            }
            
            respuestaInput.value = '';
            resultadoElement.style.display = 'none';
            respuestaInput.focus();
            verificarBtn.disabled = false;
            siguienteBtn.disabled = true;
        }

        function verificarRespuesta() {
            if (!problemaActivo || verificarBtn.disabled) return;
            const respuestaUsuario = parseInt(respuestaInput.value);
            if (isNaN(respuestaUsuario)) {
                mostrarResultado('Por favor, ingresa un número.', 'incorrecto');
                return;
            }
            const esCorrecta = respuestaUsuario === resultadoCorrecto;
            estadisticas.total++;
            if (esCorrecta) {
                estadisticas.correctos++;
                mostrarResultado('¡Correcto! 👏', 'correcto');
            } else {
                estadisticas.incorrectos++;
                mostrarResultado(`Incorrecto. La respuesta es ${resultadoCorrecto}`, 'incorrecto');
            }
            actualizarEstadisticasUI();
            verificarBtn.disabled = true;
            siguienteBtn.disabled = false;
            siguienteBtn.focus();
        }

        function mostrarResultado(mensaje, tipo) {
            resultadoElement.textContent = mensaje;
            resultadoElement.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100', 'text-red-800');
            if (tipo === 'correcto') {
                resultadoElement.classList.add('bg-green-100', 'text-green-800');
            } else {
                resultadoElement.classList.add('bg-red-100', 'text-red-800');
            }
            resultadoElement.style.display = 'block';
        }

        function actualizarEstadisticasUI() {
            totalProblemasElement.textContent = estadisticas.total;
            totalCorrectosElement.textContent = estadisticas.correctos;
            totalIncorrectosElement.textContent = estadisticas.incorrectos;
            const precision = estadisticas.total === 0 ? 0 : Math.round((estadisticas.correctos / estadisticas.total) * 100);
            precisionElement.textContent = `${precision}%`;
        }
        
        function resetearEstadisticas() {
            estadisticas = { total: 0, correctos: 0, incorrectos: 0 };
            actualizarEstadisticasUI();
        }
    