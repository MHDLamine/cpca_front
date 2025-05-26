**Base URL de l'API :**

```
http://localhost:5000/api
```

---

# Documentation des endpoints backend

## Authentification

### POST /api/login
- Endpoint : `/api/login`
- Body :
```json
{
  "email": "user@example.com",
  "password": "motdepasse"
}
```
- Headers : Aucun (publique)

---

### POST /api/register
- Endpoint : `/api/register`
- Body :
```json
{
  "username": "nom",
  "email": "user@example.com",
  "password": "motdepasse",
  "role": "candidate" // ou "recruiter"
}
```
- Headers : Aucun (publique)

---

## Questions

### GET /api/questions
- Endpoint : `/api/questions`
- Headers : Aucun (publique)

---

## Réponses

### POST /api/answers
- Endpoint : `/api/answers`
- Body :
```json
{
  "candidateId": "id_du_candidat",
  "answers": [
    { "questionId": "id_question", "text": "ma réponse" },
    { "questionId": "id_question2", "text": "autre réponse" }
  ]
}
```
- Headers : Aucun (publique, mais tu peux ajouter un header Authorization si tu protèges la route)

### GET /api/answers/:candidateId
- Endpoint : `/api/answers/<candidateId>`
- Headers : Aucun (publique, mais tu peux ajouter un header Authorization si tu protèges la route)

---

## Vidéos

### POST /api/videos
- Endpoint : `/api/videos`
- Body :
```json
{
  "candidateId": "id_du_candidat",
  "url": "https://url.de.la.video",
  "title": "Titre de la vidéo",
  "duration": "00:02:30"
}
```
- Headers : Aucun (publique, mais tu peux ajouter un header Authorization si tu protèges la route)

### GET /api/videos/:candidateId
- Endpoint : `/api/videos/<candidateId>`
- Headers : Aucun (publique, mais tu peux ajouter un header Authorization si tu protèges la route)

---

## Candidats (pour le recruteur)

### GET /api/candidates
- Endpoint : `/api/candidates`
- Headers : Aucun (publique, mais tu peux ajouter un header Authorization si tu protèges la route)

---

## Remarques
- Pour les POST, le body doit être envoyé en JSON (`Content-Type: application/json`).
- Si tu ajoutes une protection par token JWT, ajoute dans les headers :
```json
{
  "Authorization": "Bearer <token>"
}
```
- Remplace `<candidateId>` par l’id réel du candidat.
