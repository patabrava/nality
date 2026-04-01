# TS-MEETING-PREONBOARDING-002

## Ziel
Validiert den deklarativen Flow gemäß `documentation/development/onboarding.md` (Q1–Q13 + E1/E2), inklusive Sprungpfad Q8→Q5, Persistenz/Wiederaufnahme und Registrierungs-Handoff.

## Voraussetzungen
- Node.js + pnpm installiert
- Abhängigkeiten installiert (`pnpm install`)

## Setup
1. `cd apps/web`
2. `pnpm dev`
3. Browser öffnen: `http://localhost:3000/meeting`

## Ausführung
1. **Strang 1 (Extrovertiert):**
   - Q1_O1 wählen
   - Q2 → Q3 → Q4 ausfüllen
   - Q5_O1 oder Q5_O2 wählen
   - Erwartung: Q6 erscheint, danach E2 mit „Zur Registrierung"

2. **Strang 2 (Introvertiert, Direktsprung):**
   - Q1_O2 wählen
   - Q7_O1 wählen
   - Q8_O4 wählen
   - Erwartung: direkter Sprung zu Q5 (kein Q9/Q10 dazwischen)
   - Q5_O3 wählen
   - Erwartung: E1 mit Button „Okay"

3. **Strang 3 (Für Dritte):**
   - Q1_O5 wählen
   - Erwartung: Q12, dann Q13
   - Q13 (Geburtsjahrzehnt + Geschlechtsidentität) ausfüllen
   - Erwartung: E2 wird erreicht

4. **Resume/Pause-Verhalten:**
   - Bei E1 `Okay` klicken (Weiterleitung zur Startseite)
   - Erneut `/meeting` öffnen
   - Erwartung: Resume-Prompt erscheint
   - „Ja, fortsetzen“ klicken → Flow springt zur letzten unbeantworteten Frage

5. **Sync-Fallback:**
   - Während eines Schritts Netzwerkverbindung unterbrechen (DevTools Offline)
   - Antwort wählen
   - Erwartung: Hinweis „Deine Antworten werden lokal gespeichert ..."
   - Netzwerk wieder aktivieren, nächsten Schritt beantworten
   - Erwartung: Warnung verschwindet nach erfolgreicher Synchronisierung

## Erwartete Artefakte
- Screenshot Q8→Q5 Sprung
- Screenshot E1
- Screenshot Resume-Prompt
- Screenshot E2

## Cleanup
- Browser schließen
- Dev-Server mit `Ctrl+C` beenden
