# INFO910: TP Docker - Kubernetes

TP réalisé avec : Enzo CORTINOVIS Imane MAKHLOUFI Hamza MAHRI

Notre application est une web app qui dispose d'une partie back en NestJs et d'une partie front en Angular, cette application permet de determiner les différents points de stop pour recharger votre véhicule élèctrique sur une map en fonction de celui-ci

Nous avons créer une image docker pour le front et une autre pour le back.

## Docker Compose en local

Pour lancer notre application via docker compose en local nous avons créé le fichier compose.yaml 
Afin de lancer l'application il suffi d'executer la commande docker-compose up

## Kubernetes

Nous avons créé un fichier de deploiement kesla-dep.yaml ainsi qu'un fichier de service kesla-service.yaml qui utilise les image docker que nous avons créer précédemant afin de "mettre en production" notre web app.

Pour lancer l'app nous avons utilisé Minikube.
Il suffi de lancer minikube start puis de lancer la commande kubectl apply -f kesla-dep.yaml,kesla-service.yaml.
