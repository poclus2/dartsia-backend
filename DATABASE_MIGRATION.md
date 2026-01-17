# Migration de la Base de Données vers la Production

Ce guide explique comment exporter votre base de données locale (déjà synchronisée) pour l'importer sur votre serveur de production. Cela permet d'éviter d'attendre des heures que la synchronisation se refasse sur le serveur.

## 1. Préparation (Local)

Avant d'exporter, il est conseillé de mettre en pause l'écriture pour avoir une donnée cohérente.

```powershell
# Dans le dossier backend
cd c:\Users\LENOVO\Documents\Harestech\Siafrench\backend

# Arrêter le worker temporairement
docker-compose stop worker
```

## 2. Export des Données (Local)

Exécutez cette commande pour créer un fichier de sauvegarde (`dump`) contenant toute la structure et les données (blocs, transactions, etc.).

**PowerShell :**
```powershell
docker-compose exec -T postgres pg_dump -U postgres sia_nexus > sia_nexus_full_backup.sql
```

*Le fichier `sia_nexus_full_backup.sql` sera créé dans votre dossier backend actuel.*

## 3. Transfert vers le Serveur

Utilisez `scp` ou FileZilla pour envoyer ce fichier sur votre serveur de production.

Exemple SCP :
```bash
scp sia_nexus_full_backup.sql user@votre-serveur-ip:/home/user/app/backend/
```

## 4. Import sur la Production (Serveur)

Une fois sur le serveur, assurez-vous que les conteneurs sont lancés (sauf le worker idéalement, pour éviter les conflits pendant l'import).

```bash
# Sur le serveur
cd /home/user/app/backend

# Arrêter le worker de prod s'il tourne
docker-compose stop worker

# Importer la base de données
# Attention : Cela écrase les données existantes s'il y en a (si la base est neuve, c'est parfait)
cat sia_nexus_full_backup.sql | docker-compose exec -T postgres psql -U postgres -d sia_nexus
```

## 5. Relance

Une fois l'import terminé (peut prendre quelques minutes selon la taille), relancez tout.

```bash
docker-compose start worker
```


## 6. Estimation de la Taille

- **Base actuelle (partielle)** : ~200 MB (~33k blocs).
- **Base complète (~560k blocs)** : Environ **3.5 GB** (non compressé).

**Conseil :** Compressez le fichier `.sql` (ZIP ou GZIP) avant le transfert (`scp`). Une fois compressé, il devrait faire moins de **1 GB**.

