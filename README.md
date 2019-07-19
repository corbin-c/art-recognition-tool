# art-recognition-tool
The ART project. Art Recognition Tool.

Pour l'instant le dépôt ne contient qu'une rapide démonstration de ce qu'on peut faire avec OpenCV (un histogramme RGB). Comme je le disais sur Slack, c'était principalement pour tester le gain de performance. On a un gain de l'ordre de ×10 par rapport à mon ancien algo, pour des calculs sur des images en pleine résolution d'un appareil photo.
Sont exclus du dépôt les fichiers issus de la compilation d'OpenCV, ce n'est pas l'object ici.

J'ai fait un rapide diagramme qui correspond à ce qui avait été discuté lors de la précédente réunion :
![alt text](process.png "Découpage du processus de reconnaissance de tableaux")

Au delà de ce diagramme, il faut deux prévoir deux choses : 
* un système permettant la comparaison des "empreintes" avec une BDD de référence.
* (pour que l'application puisse fonctionner dans le vrai monde) un système qui permettent d'alimenter la base de données de référence, contenant les "empreintes" de toutes les images de la collection ainsi que les métadonnées associées. Idéalement le catalogue en ligne repose également sur cette base.

Il faudra voir pour la licence. Le nom du dépôt est peut-être négociable.
