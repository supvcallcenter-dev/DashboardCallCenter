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
5. Mantén este `vercel.json` con `routes` (`handle: filesystem` + fallback a `index.html`) para SPA.

Después, vuelve a desplegar desde **Deployments → Redeploy**.


### Checklist cuando sigue saliendo 404 (deploy online)

Si **aún** te aparece `404: NOT_FOUND`, casi siempre es por configuración del proyecto en Vercel (no por el código):

1. **Project → Settings → General → Root Directory**
   - Debe apuntar exactamente a la carpeta donde están `index.html`, `script.js`, `styles.css`.
   - Si está en otra carpeta (ej. `src/`), Vercel no encuentra archivos y devuelve 404.

2. **Project → Settings → Git**
   - Verifica que estés desplegando la **rama correcta** (ej. `main` o `work`).
   - Si Vercel está tomando otra rama sin estos archivos, dará 404.

3. **Deployments → ... → View Build Logs**
   - Debe listar que detectó y subió `index.html`.
   - Si no aparece `index.html` en los artefactos, el root/branch está mal.

4. **Redeploy obligatorio**
   - Luego de cambiar configuración, usa **Redeploy** (no solo refresh del navegador).

5. **Forzar nuevo deploy**
   - Haz un commit nuevo y push, luego redeploy desde ese commit.


## Fix final si aún sale 404 (modo online en Vercel)

Para cortar el problema de raíz, ya dejé también una carpeta `dist/` con los archivos estáticos (`index.html`, `styles.css`, `script.js`).

En Vercel configura exactamente:

- **Framework Preset**: `Other`
- **Build Command**: *(vacío)*
- **Output Directory**: `dist`
- **Root Directory**: carpeta del repo donde existe `dist/`
- **Production Branch**: la rama donde estás haciendo commits (si trabajas en `work`, pon `work`)

### Verificación rápida en Vercel

1. En **Deployments → Build Logs** valida que suba archivos desde `dist/`.
2. Abre `https://tu-dominio.vercel.app/index.html`.
3. Si `index.html` carga pero `/` no, haz **Redeploy** después de guardar settings.
4. Si sigue igual, elimina el proyecto en Vercel y vuelve a importarlo con esos valores (esto limpia settings viejos cacheados).
