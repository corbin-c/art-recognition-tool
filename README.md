# art-recognition-tool
## The ART project. Art Recognition Tool.

## Description

Sont exclus du dépôt les fichiers issus de la compilation d'OpenCV, ce n'est pas l'objet ici.

En partant des trois personas que j'envisage (Visiteur, Admin, Artiste, à voir si d'autres cas sont prévoir) ça donne ça :

![Appli](process.png "Appli")

Le diagramme ci-dessus est décrit dans le fichier `belenos.dot`, si jamais quelqu'un veut l'améliorer. Ce dépôt se concentre sur les deux blocs "Processus d'analyse d'images" et "Module de comparaison". Pour que ce soit optimal, à terme, il faudrait (comme décrit dans le schéma) une API qui permette d'intéragir avec le dépôt central, de façon à pouvoir ajouter différents modules au fil du temps.

Ce que j'appelle le "catalogue" correpond au site public. On peut *a mimima* y consulter les fiches des artistes, voire les descriptifs des œuvres ou le catalogue de chaque collection. Il me semble avoir compris que vous envisagiez un module pour que les clients puissent voter pour la prochaine collection qu'ils souhaitent voir exposée. La création et la modification des collections est réservée aux administrateurs, qui exercent également un rôle de modération des inscriptions des artistes. En effet, on réserve le travail d'alimentation du catalogue aux artistes, qui s'inscrivent sur le site, remplissent leur profil et chargent leurs travaux. Un module de ventes pourrait également être implémenté. L'application de reconnaissance d'images reçoit de l'API les descriptions des oeuvres d'une collection donnée, selon l'expo visitée par l'utilisateur.

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
