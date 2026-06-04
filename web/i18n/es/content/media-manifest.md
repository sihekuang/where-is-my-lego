# Manifiesto de Descarga

Este entorno de compilación **no tenía acceso a la red exterior**, por lo que los archivos de medios y judiciales están catalogados
por enlace en lugar de almacenarse aquí. Ejecute el script auxiliar a continuación **desde una máquina sin restricciones** para obtener
copias locales si las necesita.

> **Antes de descargar:** respete los derechos de autor y los términos de servicio de cada fuente. Las fotos/artículos de noticias
> y los videos de YouTube son propiedad de sus creadores — archívelos únicamente para referencia personal o de investigación, y no
> redistribuya material protegido por derechos de autor. Los documentos judiciales son registros públicos, pero deben obtenerse del
> secretario/sistema oficial cuando sea posible (consulte [`../lawsuit/court-documents.md`](../lawsuit/court-documents.md)).
> Continúe **excluyendo cualquier contenido personal/PII** que pueda aparecer en comentarios o fotogramas de video.

## Listas de URL

Las listas de URL simples utilizadas por el script se encuentran junto a este archivo:

- `urls_videos.txt` — videos de fuentes primarias y reacciones clave (una URL por línea)
- `urls_pages.txt` — páginas de artículos/declaraciones para capturar
- Los documentos judiciales **no** están incluidos en el script de forma intencional — obténgalos a través de Utah XChange / Oregon eCourt
  según `../lawsuit/court-documents.md`.

## Script auxiliar

`fetch_media.sh` (en esta carpeta) descarga videos con `yt-dlp` y captura páginas de artículos con
`wget`. Uso desde una máquina sin restricciones:

```bash
cd media
# videos (requiere yt-dlp): https://github.com/yt-dlp/yt-dlp
./fetch_media.sh videos
# capturas de artículos/páginas (requiere wget)
./fetch_media.sh pages
```

Las descargas se guardan en `media/_downloads/` (ignorado por git). Agregue una nota breve con la fecha de recuperación y
la fuente para todo lo que confirme en el archivo, a fin de mantener el historial auditable.