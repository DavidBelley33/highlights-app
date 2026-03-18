# Highlights App — Roadmap

## 🔜 À faire (prioritaire)

- [ ] Fix build error: `window is not defined` dans `app/login/page.js` (prerender issue)
- [ ] Formulaire signup : collecter nom, email, téléphone
- [ ] WelcomePill : afficher "Bienvenue, [Prénom]" dans le header

## 🔒 Sécurité

- [ ] **Supabase Pro plan** requis pour activer "Prevent use of leaked passwords" (HaveIBeenPwned API) — warning dans le Security Advisor

## 👥 Multi-utilisateurs

- [ ] Karine crée son compte via `/signup`
- [ ] Vérifier que ses données sont bien séparées de celles de David

## 💳 Stripe / Monétisation (plus tard)

- [ ] Intégrer Stripe pour les plans Founder / Standard
- [ ] Utiliser le champ `plan` dans la table `profiles`

## ✅ Complété

- [x] Page de détail par catégorie (`/categories/[slug]`)
- [x] Fix colonnes tableau (date, catégorie, description)
- [x] Favicon avec logo fond sombre
- [x] Authentification multi-utilisateurs (Supabase Auth)
- [x] Pages login / signup avec toggle mot de passe
- [x] Middleware de protection des routes
- [x] Bouton Déconnexion dans le header
- [x] Fix redirect signup → login avec message succès
- [x] Réassigner les highlights existants à user_id David
- [x] URL Configuration Supabase (Site URL + Redirect URLs)
- [x] Fix Security Advisor warnings (Function Search Path)
