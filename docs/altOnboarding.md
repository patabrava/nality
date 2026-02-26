# Technical Briefing: Pre-Registration Onboarding Flow

**Kontext:** Implementierung eines dynamischen Onboarding-Funnels für neue Nutzer *vor* der eigentlichen Kontoerstellung. Der Flow adaptiert sich basierend auf der ersten Eingabe des Nutzers in drei Hauptpfade.

**Globale Architektur- & Daten-Regel (WICHTIG):**
Alle im Onboarding gesammelten Daten (Antworten auf die Fragen) müssen im Backend im `Profile Tab` (bzw. dem User-Model) gespeichert werden. **Constraint:** Diese spezifischen Onboarding-Daten dürfen **nicht** auf der öffentlichen `Profile Page` des Nutzers gerendert/angezeigt werden.

---

## 1. State Machine & Routing (Der Einstieg)

Der Flow beginnt mit einer zentralen Weiche (Router).

* **Screen 0: Start-Frage**
    * **Frage:** "Wie teilst du deine Gedanken und Erlebnisse am liebsten mit anderen?"
    * **Logik (Switch-Statement):**
        * `case Answer 1`: Route zu **Pfad A (Extrovertiert)**
        * `case Answer 2, 3, 4`: Route zu **Pfad B (Introvertiert / Unsicher / Braucht Anleitung)**
        * `case Answer 5`: Route zu **Pfad C (Für einen Dritten)**

---

## 2. Die Pfade (Workflows)

Bitte implementiere die folgenden Pfade als sequenzielle Formular-Schritte (Step-by-Step Wizard).

### 🛣️ Pfad A: "Extrovertiert" (Schneller Einstieg)
* **Step A1:**
    * Frage: "Worüber würdest du als Erstes gern erzählen – eher über dein Leben allgemein, bestimmte Erlebnisse oder Menschen, die dir wichtig sind?"
    * UI: Single/Multiple Choice (basierend auf den vorgegebenen Listenwerten).
* **Step A2:**
    * Frage: "Für wen möchtest du das vor allem festhalten?"
    * UI: Auswahl-Liste.
* **Step A3:**
    * Frage: "Wir möchten dir möglichst passende Fragen stellen. Bitte ordne dich deshalb im Folgenden zu:"
    * UI: Demografische Abfrage.
* **Step A4:**
    * Frage: "Alles klar, möchtest du jetzt direkt mit deiner ersten Erzählung starten?"
    * Routing:
        * Option 1: Route zum neutralen "Start Storytelling" Block (blauer Block).
        * Option 2: Route zur Registrierung ("Super, dann richten wir dir in weniger als 1 Minute deinen persönlichen Erinnerungsraum ein...").

### 🛣️ Pfad B: "Bedürfnis nach Anleitung / Unsicherheit" (Geführter Einstieg)
* **Step B1:**
    * Frage: "Wie möchtest du deine Erlebnisse, Erfahrungen, Gedanken am liebsten festhalten?"
    * *Feature-Branch:* Eines der Auswahlfelder muss einen Call-to-Action (CTA) für "Termin buchen" triggern.
* **Step B2:**
    * Frage: "Wie persönlich dürfen die Fragen für dich am Anfang sein?"
* **Step B3:**
    * Frage: "Was ist dir bei Nality am wichtigsten?"
* **Step B4 (Info/Transition):**
    * Text: "Damit wir dir passende Fragen in deinem Tempo anbieten können, richten wir dir jetzt deinen persönlichen Bereich ein. Du bestimmst jederzeit, was du teilen möchtest."
    * Routing-Option: Hier gibt es einen Absprungpunkt zum neutralen Block (blauer Kasten).
* **Step B5:**
    * Frage: "Im ersten Schritt hast du die Möglichkeit dich zuzuordnen. Das hilft uns, Dir möglichst passende Fragen zu stellen."
    * UI: Demografische Abfrage.
    * Routing: Weiter zur Registrierung.

### 🛣️ Pfad C: "Für Dritte" (Delegierter Einstieg)
* **Step C1 (Info):**
    * Text: "Super, dann richten wir in weniger als 1 Minute einen persönlichen Erinnerungsraum ein."
* **Step C2:**
    * Frage: "Um den persönlichen Erinnerungsraum bestmöglich nutzen zu können, teilen Sie uns bitte mit:"
    * UI: Demografische Daten des *Dritten*.
    * Routing: Weiter zur Registrierung.

---

## 3. Das Registrierungs-Modul (Endpunkt aller Pfade)

Sobald ein Nutzer das Ende von Pfad A, B oder C erreicht, wird das Auth-Modul getriggert. Der State der bisherigen Antworten muss währenddessen (z. B. im LocalStorage, SessionStorage oder React Context) gehalten werden, um ihn nach der Registrierung an die DB zu senden.

* **UI-Komponenten der Registrierung:**
    * `Input`: Vorname oder Spitzname (Mandatory / Pflichtfeld)
    * `Input`: Nachname (Optional)
    * `Input`: E-Mail-Adresse
    * `Input`: Passwort
    * `Button`: Andere Registrierungsmöglichkeit (OAuth Provider: **Google**)

* **Post-Registration Action:**
    * Sobald der Account erstellt ist (Erfolgsmeldung "Danke, die Anmeldung war erfolgreich"), wird ein kleines Modal oder UI-Element gerendert.
    * **Frage:** "Möchtest du weiterhin per Du angesprochen werden oder zum Sie wechseln?"
    * UI: Toggle oder Radio Buttons (Du / Sie).
    * *Hinweis an den Agent:* Diese Präferenz global für den User speichern (z.B. in i18n oder User-Settings), um die künftige UI-Sprache anzupassen.