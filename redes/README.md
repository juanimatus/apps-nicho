# Redes: material interactivo

Dos páginas HTML autocontenidas para estudiar redes. No necesitan instalación ni servidor: se abren directo en el navegador. Usan internet para cargar las tipografías de Google Fonts y, en `modelo-osi.html`, las dos figuras animadas de DNS y TCP (del paquete [`anatomy-figures`](https://www.npmjs.com/package/anatomy-figures), desde el CDN de jsDelivr). Sin conexión todo lo demás funciona igual: se usan las fuentes del sistema y en lugar de cada figura aparece un aviso.

| Archivo | Qué es |
|---|---|
| `modelo-osi.html` | Pila OSI en placas isométricas: detalle por capa, viaje de un mensaje (encapsulación), sección "Conectarse: DNS y TCP" con figuras interactivas, laboratorio binario por capa y práctica "¿En qué capa vive?". |
| `fibra-optica.html` | Simulador de pulsos de luz en fibra multimodo y monomodo: atenuación, dispersión, osciloscopio del receptor, decodificación de bits a texto y reflexión total interna. |

## Abrirlas desde la terminal

Primero clonás el repo (una sola vez) y entrás a la carpeta:

```bash
git clone https://github.com/juanimatus/apps-nicho.git
cd apps-nicho/redes
```

Después abrís la página con el comando de tu sistema:

| Sistema | Comando |
|---|---|
| Windows (PowerShell o CMD) | `start modelo-osi.html` |
| macOS | `open modelo-osi.html` |
| Linux | `xdg-open modelo-osi.html` |

Cambiá `modelo-osi.html` por `fibra-optica.html` para abrir la otra.

Si preferís servirlas por HTTP (por ejemplo, para verlas desde el celular en la misma red Wi-Fi):

```bash
python -m http.server 8000
```

y entrás a `http://localhost:8000` (o a `http://IP-de-tu-PC:8000` desde el celular).
