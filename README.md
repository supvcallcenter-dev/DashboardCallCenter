# Catálogo Digital Web

Aplicación web estática para gestionar un catálogo dinámico con CRUD, filtros dependientes marca→modelo y búsqueda avanzada.

## Ejecutar local

```bash
python3 -m http.server 4173
```

Abrir: `http://localhost:4173`

## Publicar como web pública

### Opción 1: Vercel (recomendado)

1. Instala CLI:
   ```bash
   npm i -g vercel
   ```
2. Desde esta carpeta ejecuta:
   ```bash
   vercel --prod
   ```
3. Vercel devolverá un enlace público, por ejemplo:
   `https://catalogo-digital-tu-proyecto.vercel.app`

### Opción 2: Netlify

1. Conecta el repo en Netlify.
2. Build command: *(vacío)*
3. Publish directory: `.`
4. Obtendrás un enlace como:
   `https://catalogo-digital.netlify.app`

### Opción 3: GitHub Pages

1. Subir estos archivos a un repositorio de GitHub.
2. Ir a **Settings → Pages**.
3. Seleccionar rama `main` y carpeta raíz `/`.
4. Tu sitio quedará en:
   `https://<usuario>.github.io/<repositorio>/`

## Notas

- Es una app 100% frontend (HTML/CSS/JS), por lo que se puede hospedar en cualquier hosting estático.
- Los datos se guardan en `localStorage` del navegador.


## Solución al error de Vercel `404: NOT_FOUND`

Si Vercel muestra:

- `404: NOT_FOUND`
- `Code: NOT_FOUND`
- `ID: iad1::...`

aplica esta configuración y valida el proyecto en Vercel:

1. **Root Directory**: debe ser la carpeta donde están `index.html`, `styles.css`, `script.js`.
2. **Framework Preset**: `Other`.
3. **Build Command**: vacío.
4. **Output Directory**: vacío.
5. Mantén este `vercel.json` con `rewrites` para que todas las rutas respondan con `index.html`.

Después, vuelve a desplegar desde **Deployments → Redeploy**.
