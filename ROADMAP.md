# Highlights App — Roadmap

## 🔜 À faire

### Priorité haute
- [ ] Tester avec Karine — créer son compte, vérifier séparation des données
- [ ] Page profil — modifier nom, téléphone, mot de passe

### Priorité moyenne
- [ ] Numéro de téléphone avec sélecteur de pays (`react-phone-number-input`) — format E.164, validation, préparation pour SMS
- [ ] Invitations manuelles — contrôler qui peut créer un compte

### Priorité basse / futur
- [ ] SMS notifications (requiert numéro de téléphone valide)
- [ ] Stripe — plans Fondateur / Standard
- [ ] Page admin — voir tous les utilisateurs, gérer les plans

## 🔒 Sécurité
- [ ] **Supabase Pro plan** requis pour activer "Prevent use of leaked passwords" (HaveIBeenPwned API)

---

## ✅ Complété

- [x] Page de détail par catégorie (`/categories/[slug]`)
- [x] Fix colonnes tableau (date, catégorie, description)
- [x] Favicon avec logo fond sombre
- [x] Authentification multi-utilisateurs (Supabase Auth)
- [x] Formulaire signup — nom, email, téléphone, mot de passe
- [x] Pages login / signup avec toggle mot de passe
- [x] Mot de passe oublié / réinitialisation
- [x] Middleware de protection des routes
- [x] Bouton Déconnexion dans le header
- [x] "Bienvenue [Prénom]" dans le header
- [x] Fix redirect signup → login avec message succès
- [x] Réassigner les highlights existants à user_id David
- [x] URL Configuration Supabase (Site URL + Redirect URLs)
- [x] Fix Security Advisor warnings (Function Search Path)
- [x] Vérification RLS — 3 tables protégées avec policies
