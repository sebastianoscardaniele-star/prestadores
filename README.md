# Matriz lógica de prestaciones médicas

Proyecto simple en Vite + React listo para subir a Vercel.

## Uso local

```bash
npm install
npm run dev
```

## Deploy en Vercel

1. Subir esta carpeta a GitHub.
2. En Vercel: Add New Project > importar repositorio.
3. Framework Preset: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Deploy.

## Funcionalidades

- Búsqueda por práctica, código o prestadora.
- Ranking automático Top 3 menor costo.
- Simulador de incremento mensual.
- Alta y baja manual de prestaciones en el navegador.
- Exportación CSV de resultados filtrados.

## Actualización de datos

Los datos están en `src/data.js`. Para una actualización masiva, reemplazar el contenido del array `seedPrestaciones` o regenerarlo desde un Excel nuevo.
