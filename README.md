# programmetv.site — Guide Programme TV & Espace IPTV

Plateforme web combinant un guide complet des programmes télévisés en direct / ce soir (TNT et chaînes nationales) et un espace de commande directe d'abonnements IPTV assisté par WhatsApp.

---

## 🏗️ Architecture Technique

### 1. Structure Générale
- **Frontend :** React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / Serveur :** Node.js Express avec intégration Vite.
- **Base de données :** Fonctionnement autonome sans dépendance obligatoire à une base de données externe. Données locales structurées pour les offres IPTV, la navigation, la FAQ et les pages légales.

### 2. Abstraction EPG (Guide des programmes)
```
[ EPG Provider ] ──▶ [ XMLTV Parser ] ──▶ [ Données Normalisées ] ──▶ [ Interface TV Guide UI ]
```
- **Configuration :** La variable optionnelle `EPG_URL` permet de pointer vers une source XMLTV publique distante (ex: fichier XMLTV TNT).
- **Tolérance de panne :** Si `EPG_URL` n'est pas renseignée ou temporairement inaccessible, l'application bascule automatiquement sur les données EPG locales normalisées (grilles horaires, prime-time 21h10, films et fiches détaillées).
- **Sécurité :** Aucun identifiant ou mot de passe IPTV n'est exposé côté frontend.

### 3. Parcours de Commande WhatsApp
Le système de paiement en ligne a été remplacé par un tunnel direct et transparent via WhatsApp :
1. L'utilisateur clique sur **« Commander maintenant »** sur l'offre de son choix (3 mois, 6 mois ou 12 mois VIP).
2. La page de récapitulatif affiche clairement les caractéristiques de l'offre :
   - **Nom de l'offre**
   - **Durée**
   - **Prix**
   - **Nombre d'appareils**
3. L'utilisateur clique sur **« Commander via WhatsApp »**.
4. WhatsApp s'ouvre avec un message pré-rempli en français :
   ```
   Bonjour, je souhaite commander l'offre IPTV 3 mois à 16,99 €.

   Offre : Formule Découverte
   Durée : 3 mois
   Prix : 16,99 €
   Nombre d'appareils : 1 appareil
   ```
5. Aucun paiement bancaire n'est exécuté directement sur le site et aucun identifiant de paiement n'est stocké.

---

## ⚙️ Configuration (.env)

Le projet utilise une configuration minimale et résiliente :

```env
SITE_URL=
WHATSAPP_NUMBER=
EPG_URL=
```

- `SITE_URL` *(optionnel)* : URL publique du site (défaut : `https://programmetv.site`).
- `WHATSAPP_NUMBER` *(optionnel)* : Numéro WhatsApp de support au format international sans `+` ni espaces (défaut : `212691606844`).
- `EPG_URL` *(optionnel)* : URL vers une source XMLTV/EPG publique. Si non configurée, le guide fonctionne normalement avec les grilles locales.

---

## 🚀 Démarrage & Scripts

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Construction pour la production
npm run build

# Démarrage en production
npm start
```
