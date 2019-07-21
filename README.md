# art-recognition-tool
The ART project. Art Recognition Tool.

Pour l'instant le dépôt ne contient qu'une rapide démonstration de ce qu'on peut faire avec OpenCV (un histogramme RGB). Comme je le disais sur Slack, c'était principalement pour tester le gain de performance. On a un gain de l'ordre de ×10 par rapport à mon ancien algo, pour des calculs sur des images en pleine résolution d'un appareil photo.
Sont exclus du dépôt les fichiers issus de la compilation d'OpenCV, ce n'est pas l'objet ici.
En gros en partant des trois personas que j'envisage (Visiteur, Admin, Artiste, à voir si d'autres cas sont prévoir) ça donne ça :

![Appli](process.png "Appli")

## Avancée des développements :
Cette section illustre les développements déjà réalisés.

### Recadrage

Image originale :

![Img_example](examples/orig.jpg "image brute")

On applique un seuil :

![Img_example](examples/tresh.jpg "image binarisée")

Algorithme de Canny :

![Img_example](examples/canny.jpg "contours détectés")

### Normalisation

Exemple de correction de luminosité :

Avant :

![Img_example](examples/original.jpg "image brute")

Après :

![Img_example](examples/normalized.jpg "image égalisée")

### Analyse

#### Colorimétrie
Calcul des histogrammes :

Exemple d'histogramme calculé dans l'espace de couleur RGB (modélisation des couleurs sur un écran) :

![Img_example](examples/hist_rgb.jpg "histogramme rgb")

Exemple d'histogramme calculé dans l'espace de couleur HSV (modèle perceptif) :

![Img_example](examples/hist_hsv.jpg "histogramme hsv")

Il faudra voir pour la licence. Le nom du dépôt est peut-être négociable.
