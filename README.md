# Photomark 📸✨

Photomark est une application web minimaliste et rapide permettant aux e-commerçants et vendeurs d'ajouter automatiquement leur identité visuelle (logo, numéro de téléphone, nom de boutique) sur leurs photos de produits avant de les publier sur les réseaux sociaux (WhatsApp, Facebook, Instagram, etc.).

## 🌟 Fonctionnalités

- **100% Hors-ligne / Client-side** : Le traitement des images se fait entièrement dans le navigateur de l'utilisateur. Aucune photo n'est envoyée sur un serveur, garantissant la confidentialité absolue et un traitement instantané.
- **Traitement par lots (Batch)** : Importez et traitez des dizaines de photos simultanément.
- **Personnalisation poussée** :
  - **Logo** : Positionnement (Haut, Bas, Centre), taille, opacité, et marges.
  - **Texte** : Numéro de téléphone, nom de la boutique, choix de la couleur, de la taille, de la graisse et de la position.
- **Sauvegarde automatique** : Les paramètres et le logo importés sont sauvegardés localement dans le navigateur (localStorage + IndexedDB). Ils seront conservés pour votre prochaine visite.
- **Export intelligent** : 
  - Choix du format (JPEG, PNG, WEBP) et de la qualité.
  - Si vous traitez plusieurs photos, elles sont automatiquement regroupées et téléchargées dans un fichier `.zip`.
- **Responsive Design** : L'interface est optimisée pour une utilisation aussi bien sur un grand écran que sur mobile, avec un tiroir de paramètres intégré.

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router, React 19)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4
- **Icônes** : Lucide React
- **Manipulation d'images** : API Canvas native du navigateur
- **Compression Zip** : jszip

## 🚀 Installation & Lancement

1. **Cloner ou ouvrir le projet** dans votre environnement.
2. **Installer les dépendances** :
   ```bash
   npm install
   ```
3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
4. **Ouvrir l'application** : Rendez-vous sur [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📱 Spécificités Mobile (iOS/iPhone)

L'application accepte nativement les formats standards (JPG, PNG, WEBP). 
Si un utilisateur accède à l'application depuis un iPhone, le navigateur Safari s'occupe de convertir automatiquement et de manière transparente les photos HEIC en JPG au moment de la sélection dans la pellicule. L'application est donc 100% compatible avec les photos prises par un iPhone.
