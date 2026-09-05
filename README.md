# Semainier

Le calendrier des repas et la liste de courses qui en découle.

- Calendrier mensuel ou vue semaine, deux créneaux par jour (midi / soir)
- 151 recettes, dont 125 françaises — les classiques vérifiés contre leurs sources traditionnelles
- Liste de courses agrégée par rayon, calculée pour le nombre de couverts
- Éditeur de recettes personnelles : on colle les ingrédients en texte, l'app les lit et les range
- Installable sur téléphone, fonctionne hors ligne

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | l'application entière, sans dépendance |
| `manifest.webmanifest` | déclaration PWA (nom, icônes, affichage) |
| `sw.js` | service worker : mise en cache pour l'usage hors ligne |
| `build.js` | régénère `index.html`, le manifeste et le service worker |
| `icones.js` | régénère les icônes PNG |
| `serveur.js` | serveur local de test (`node serveur.js` → http://localhost:8123) |

## Mettre à jour

    node build.js v20260906   # le numéro de version vide l'ancien cache
    git commit -am "..." && git push
