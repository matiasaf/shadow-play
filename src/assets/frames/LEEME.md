# Fotogramas

Poné acá los frames destacados de cada película (jpg / png / webp).

Luego, en el `.md` de la película, referencialo desde el frontmatter:

```yaml
frame: '../../assets/frames/perfect-days.jpg'
```

Astro optimiza la imagen automáticamente (tamaño, formato, lazy-load).
Si una película no tiene `frame`, la tarjeta muestra un marcador con su inicial.
