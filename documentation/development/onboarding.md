Engineering Specification: Pre-Onboarding Questionnaire Flow für Nality Webapp

1. Übersicht & Zielsetzung
Entwickle ein Pre-Onboarding-Modul für eine Webapp (Nality), das neue Nutzer vor der Registrierung durch einen personalisierten Fragebogen führt. Die gesammelten Antworten werden:
Sofort zwischengespeichert (nach jeder beantworteten Frage), damit bei Abbruch, Browser-Schließung oder Netzwerkfehler der Fortschritt erhalten bleibt.
Nach erfolgreicher Registrierung dem neu erstellten User-Account in der Datenbank zugeordnet.

2. Architektur & Persistenz
2.1 Session-Identifikation (vor Registrierung)
Beim ersten Laden des Pre-Onboarding wird eine eindeutige session_id (UUID v4) generiert und im LocalStorage des Browsers sowie serverseitig gespeichert.
Diese session_id dient als Schlüssel für alle Zwischenspeicherungen.
Zusätzlich wird ein Cookie / LocalStorage-Eintrag gesetzt, sodass bei erneutem Besuch der gleichen Session fortgesetzt wird.
2.2 Zwischenspeicherung (Durability Layer)
Es soll ein zweistufiges Persistenzmodell implementiert werden:
Schicht
Technologie
Zweck
Client-seitig
LocalStorage / IndexedDB
Sofortige Speicherung jeder Antwort. Überbrückt Netzwerkausfälle.
Server-seitig
Datenbanktabelle preonboarding_sessions
Persistente Speicherung. Wird nach jeder Antwort per API-Call aktualisiert (mit Retry-Logik bei Netzwerkfehler).

Verhalten bei jedem Frageschritt:
Nutzer beantwortet eine Frage → Antwort wird sofort in LocalStorage geschrieben.
Parallel wird ein API-Call (PUT /api/preonboarding/{session_id}) abgesetzt, der den gesamten aktuellen Antwort-State an den Server sendet.
Bei Netzwerkfehler: Retry mit exponential Backoff (max. 3 Versuche). Falls alle fehlschlagen: Antwort bleibt im LocalStorage und wird beim nächsten erfolgreichen API-Call mit synchronisiert.
Bei Wiederbesuch: Client prüft LocalStorage auf vorhandene session_id. Falls vorhanden, wird der Server-State abgerufen (GET /api/preonboarding/{session_id}), mit dem LocalStorage-State gemerged (neuerer Timestamp gewinnt), und der Nutzer wird zur letzten unbeantworteten Frage seines Flows weitergeleitet.
2.3 Datenmodell
Tabelle: preonboarding_sessions
CREATE TABLE preonboarding_sessions (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	session_id UUID UNIQUE NOT NULL,
	user_id UUID NULL,                      	-- NULL bis Registrierung abgeschlossen
	current_strand VARCHAR(20) NULL,        	-- 'extrovert', 'introvert', 'third_party'
	current_question VARCHAR(10) NULL,      	-- z.B. 'Q3', 'Q8' etc.
	answers JSONB NOT NULL DEFAULT '{}',    	-- Alle Antworten als JSON
	status VARCHAR(20) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	completed_at TIMESTAMP WITH TIME ZONE NULL  -- Zeitpunkt der Registrierungszuordnung
);
 
CREATE INDEX idx_preonboarding_session_id ON preonboarding_sessions(session_id);
CREATE INDEX idx_preonboarding_user_id ON preonboarding_sessions(user_id);
CREATE INDEX idx_preonboarding_status ON preonboarding_sessions(status);
Beispiel answers-JSON:
{
  "Q1": {
	"selected": ["option_2"],
	"answered_at": "2025-01-15T10:23:00Z"
  },
  "Q7": {
	"selected": ["option_3"],
	"answered_at": "2025-01-15T10:23:45Z"
  },
  "Q8": {
	"selected": ["option_2"],
	"answered_at": "2025-01-15T10:24:10Z"
  },
  "Q11": {
	"birth_decade": "1960er",
	"gender_identity": "Mann",
	"answered_at": "2025-01-15T10:25:00Z"
  }
}
2.4 Zuordnung nach Registrierung
Nach erfolgreicher Registrierung wird die session_id aus dem LocalStorage/Cookie gelesen.
Der Server verknüpft den preonboarding_sessions-Eintrag mit der neuen user_id.
Die Antworten werden zusätzlich in die relevanten User-Profile-Tabellen übertragen (z.B. user_preferences, user_demographics).
Der status wird auf 'completed' gesetzt.

3. Fragen-Definitionen
Jede Frage wird als strukturiertes Objekt definiert. Nachfolgend die vollständige Definition aller Fragen:
Q1 – Einstiegsfrage (Strang-Bestimmung)
Eigenschaft
Wert
ID
Q1
Text
„Wie teilst du deine Gedanken und Erlebnisse am liebsten mit anderen?"
Typ
Single Choice (genau eine Auswahl)
Optionen



 
Option-ID
Text
Routing
Q1_O1
Ich rede gern frei drauflos und komme ins Erzählen, sobald ich anfange.
→ Strang 1 (Extrovertiert) → Q2
Q1_O2
Ich erzähle gern, brauche aber ein paar gezielte Fragen, um rein zu kommen.
→ Strang 2 (Introvertiert) → Q7
Q1_O3
Ich bin eher zurückhaltend und teile nur, was ich mir vorher gut überlegt habe.
→ Strang 2 (Introvertiert) → Q7
Q1_O4
Ich bin mir nicht sicher – ich möchte es einfach ausprobieren.
→ Strang 2 (Introvertiert) → Q7
Q1_O5
Es geht nicht um mich. Ich möchte jemandem ermöglichen, seine Gedanken und Erinnerungen festzuhalten.
→ Strang 3 (Für Dritte) → Q12


Strang 1: Extrovertiert (Q2 → Q3 → Q4 → Q5 → Q6)
Q2
Eigenschaft
Wert
ID
Q2
Text
„Worüber würdest du als Erstes gern erzählen – eher über dein Leben allgemein, bestimmte Erlebnisse oder Menschen, die dir wichtig sind?"
Typ
Single Choice
Optionen



 
Option-ID
Text
Q2_O1
Leben im Allgemeinen
Q2_O2
Bestimmte Erlebnisse
Q2_O3
Wichtige Menschen
Q2_O4
Ich weiß noch nicht genau

Nächste Frage: → Q3 (immer)
Q3
Eigenschaft
Wert
ID
Q3
Text
„Für wen möchtest du das vor allem festhalten?"
Typ
Single Choice (oder Mehrfachauswahl – zu klären, aber hier als Single Choice spezifiziert)
Optionen



 
Option-ID
Text
Q3_O1
Für mich selbst
Q3_O2
Für meine Partnerin / Partner
Q3_O3
Für meine Kinder
Q3_O4
Für meine Enkel
Q3_O5
Für meine Familie insgesamt
Q3_O6
Für jemand ganz Bestimmten
Q3_O7
Ich weiß es noch nicht

Nächste Frage: → Q4 (immer)
Q4
Eigenschaft
Wert
ID
Q4
Text
„Wir möchten dir möglichst passende Fragen stellen. Bitte ordne dich deshalb im Folgenden zu:"
Typ
Zusammengesetztes Feld (Composite) – zwei Unterfelder

Unterfeld 1: Geburtsjahrzehnt
Option-ID
Text
Q4_decade_1920
1920er
Q4_decade_1930
1930er
Q4_decade_1940
1940er
Q4_decade_1950
1950er
Q4_decade_1960
1960er
Q4_decade_1970
1970er
Q4_decade_1980
1980er
Q4_decade_1990
1990er
Q4_decade_2000
2000er
Q4_decade_2010
2010er
Q4_decade_2020
2020er
Q4_decade_none
keine Angabe

Unterfeld 2: Geschlechtsidentität
Option-ID
Text
Q4_gender_female
Frau
Q4_gender_male
Mann
Q4_gender_diverse
divers
Q4_gender_none
keine Angabe

Nächste Frage: → Q5 (immer)
Q5
Eigenschaft
Wert
ID
Q5
Text
„Alles klar, möchtest du jetzt direkt mit deiner ersten Erzählung starten?"
Typ
Single Choice
Optionen



 
Option-ID
Text
Routing
Q5_O1
Ja, gleich loslegen.
→ Q6
Q5_O2
Ja, aber mit kurzen Fragen als Einstieg.
→ Q6
Q5_O3
Lieber später.
→ E1 (Zwischenspeichern & Beenden)

Nächste Frage: → Q6 (bei O1 oder O2), → E1 (bei O3)
Q6
Eigenschaft
Wert
ID
Q6
Text
„Super, dann richten wir dir in weniger als 1 Minute deinen persönlichen Erinnerungsraum ein, damit deine Erzählungen sicher bewahrt werden."
Typ
Informationsscreen mit CTA-Button
Button-Text
„Weiter"
Aktion
→ Weiterleitung zur Registrierung (E2)


Strang 2: Introvertiert (Q7 → Q8 → Q9 → Q10 → Q11)
Q7
Eigenschaft
Wert
ID
Q7
Text
„Wie möchtest du deine Erlebnisse, Erfahrungen, Gedanken am liebsten festhalten?"
Typ
Single Choice
Optionen



 
Option-ID
Text
Routing
Q7_O1
In Ruhe schreiben, am liebsten kurze Texte oder Stichworte
→ Q8
Q7_O2
Ich schreibe gerne, auch längere Texte und lasse meinen Gedanken freien Lauf.
→ Q8
Q7_O3
In meinem eigenen Tempo sprechen – mit klaren Fragen.
→ Q8
Q7_O4
Mit sehr kurzen, konkreten Fragen, Schritt für Schritt.
→ Q8
Q7_O5
Ich unterhalte mich am liebsten mit einer anderen Person.
→ E2 (direkt zur Registrierung)
Q7_O6
Ich möchte erstmal nur schauen und später entscheiden.
→ Q8

Q8
Eigenschaft
Wert
ID
Q8
Text
„Wie persönlich dürfen die Fragen für dich am Anfang sein?"
Typ
Single Choice
Optionen



 
Option-ID
Text
Routing
Q8_O1
Eher allgemein (z.B. Hobbys, Interessen, Alltag).
→ Q9
Q8_O2
Ein paar persönlichere Themen sind für mich in Ordnung.
→ Q9
Q8_O3
Ich bin bereit, auch sehr Persönliches zu teilen.
→ Q9
Q8_O4
Ich möchte selbst entscheiden, was ich thematisiere.
→ Q5 (Sprung zu Q5!)
Q8_O5
Ich weiß es nicht und möchte mich später entscheiden.
→ Q9

Wichtiger Hinweis: Bei Q8_O4 wird zu Q5 gesprungen (strangübergreifend). Von Q5 aus gelten dann die normalen Routing-Regeln von Q5 (O1/O2 → Q6 → Registrierung; O3 → E1).
Q9
Eigenschaft
Wert
ID
Q9
Text
„Was ist dir bei Nality am wichtigsten?"
Typ
Single Choice
Optionen



 
Option-ID
Text
Q9_O1
Meine Erinnerungen für mich selbst sortieren.
Q9_O2
Etwas für meine Familie / kommende Generationen festhalten.
Q9_O3
Mein Gedächtnis und meine geistige Fitness trainieren.
Q9_O4
Erstmal ausprobieren, was zu mir passt.

Nächste Frage: → Q10 (immer)
Q10
Eigenschaft
Wert
ID
Q10
Text
„Damit wir dir passende Fragen in deinem Tempo anbieten können, richten wir dir jetzt deinen persönlichen Bereich ein. Du bestimmst jederzeit, was du teilen möchtest."
Typ
Single Choice
Optionen



 
Option-ID
Text
Routing
Q10_O1
Ja, jetzt meinen persönlichen Bereich einrichten.
→ Q11
Q10_O2
Lieber später.
→ E1 (Zwischenspeichern & Beenden)

Q11
Eigenschaft
Wert
ID
Q11
Text
„Im ersten Schritt hast du die Möglichkeit dich zuzuordnen. Das hilft uns, Dir möglichst passende Fragen zu stellen."
Typ
Zusammengesetztes Feld (Composite) – identisch zu Q4

Unterfeld 1: Geburtsjahrzehnt (gleiche Optionen wie Q4)
Unterfeld 2: Geschlechtsidentität (gleiche Optionen wie Q4)
Nächste Aktion: → Weiterleitung zur Registrierung (E2)

Strang 3: Für Dritte (Q12 → Q13)
Q12
Eigenschaft
Wert
ID
Q12
Text
„Super, dann richten wir in weniger als 1 Minute einen persönlichen Erinnerungsraum ein."
Typ
Informationsscreen mit CTA-Button
Button-Text
„Weiter"
Aktion
→ Q13

Q13
Eigenschaft
Wert
ID
Q13
Text
„Um den persönlichen Erinnerungsraum bestmöglich nutzen zu können, teilen Sie uns bitte mit:"
Typ
Zusammengesetztes Feld (Composite)
Hinweis
Hier wird die Sie-Form verwendet (formelle Ansprache), da es um eine dritte Person geht.

Unterfeld 1: Geburtsjahrzehnt des Nutzers
Option-ID
Text
Q13_decade_1920
1920er
Q13_decade_1930
1930er
Q13_decade_1940
1940er
Q13_decade_1950
1950er
Q13_decade_1960
1960er
Q13_decade_1970
1970er
Q13_decade_1980
1980er
Q13_decade_1990
1990er
Q13_decade_2000
2000er
Q13_decade_2010
2010er
Q13_decade_2020
2020er
Q13_decade_none
keine Angabe

Unterfeld 2: Geschlechtsidentität des Nutzers
Option-ID
Text
Q13_gender_female
Frau
Q13_gender_male
Mann
Q13_gender_diverse
divers
Q13_gender_none
keine Angabe

Nächste Aktion: → Weiterleitung zur Registrierung (E2)

End-Screens
E1 – Zwischenspeichern & Beenden
Eigenschaft
Wert
ID
E1
Text
„Alles klar, dann machen wir später weiter. Deine Eingaben bleiben sicher verwahrt."
Typ
Informationsscreen mit Button
Button-Text
„Okay"
Aktion
Alle bisherigen Antworten werden final an den Server gesendet (falls noch nicht geschehen). Status wird auf 'paused' gesetzt. Weiterleitung zur Startseite. Bei erneutem Besuch des Pre-Onboarding wird der Nutzer an der letzten unbeantworteten Frage fortgesetzt.

E2 – Registrierung
Eigenschaft
Wert
ID
E2
Text
– (Standard-Registrierungsseite der App)
Aktion
Registrierungsformular wird angezeigt. Die session_id wird als Hidden Parameter / im State mitgeführt. Nach erfolgreicher Registrierung: user_id wird in preonboarding_sessions eingetragen, Antworten werden in User-Profil-Tabellen übernommen, Status wird auf 'completed' gesetzt.


4. Flow-Diagramm (Zusammenfassung)
START → Q1
     	│
     	├── O1 (frei drauflos) ──────────→ STRANG 1 (Extrovertiert)
     	│                                	Q2 → Q3 → Q4 → Q5
     	│                                                 	├── O1/O2 → Q6 → E2 (Registrierung)
     	│                                                 	└── O3 → E1 (Später)
     	│
     	├── O2/O3/O4 ────────────────────→ STRANG 2 (Introvertiert)
     	│                                	Q7
     	│                                	├── O1/O2/O3/O4/O6 → Q8
     	│                                	│                  	├── O1/O2/O3/O5 → Q9 → Q10
     	│                                	│                  	│                    	├── O1 → Q11 → E2 (Registrierung)
     	│                                	│                  	│                    	└── O2 → E1 (Später)
     	│                                	│                  	└── O4 → Q5 (Sprung!)
     	│                                	│                           	├── O1/O2 → Q6 → E2 (Registrierung)
     	│                                	│                           	└── O3 → E1 (Später)
     	│                                	└── O5 (andere Person) → E2 (Registrierung direkt)
     	│
     	└── O5 (für Dritte) ─────────────→ STRANG 3 (Für Dritte)
                                          	Q12 → Q13 → E2 (Registrierung)

5. API-Endpunkte
5.1 Session erstellen
POST /api/preonboarding/sessions
Response:
{
  "session_id": "uuid-v4",
  "created_at": "ISO-timestamp"
}
5.2 Antworten aktualisieren
PUT /api/preonboarding/sessions/{session_id}
Request Body:
{
  "current_strand": "introvert",
  "current_question": "Q8",
  "answers": {
	"Q1": { "selected": ["Q1_O3"], "answered_at": "..." },
	"Q7": { "selected": ["Q7_O1"], "answered_at": "..." },
	"Q8": { "selected": ["Q8_O2"], "answered_at": "..." }
  }
}
Response: 200 OK mit aktualisiertem Session-Objekt.
5.3 Session abrufen (Wiederherstellung)
GET /api/preonboarding/sessions/{session_id}
Response: Vollständiges Session-Objekt inkl. aller bisherigen Antworten und current_question.
5.4 Session mit User verknüpfen (nach Registrierung)
POST /api/preonboarding/sessions/{session_id}/complete
Request Body:
{
  "user_id": "uuid-of-new-user"
}
Aktion: Setzt user_id, Status auf 'completed', überträgt Antworten in User-Profil.

6. Frontend-Anforderungen
6.1 Komponenten-Struktur
PreOnboardingContainer – Hauptcontainer, verwaltet State und Routing-Logik.
QuestionScreen – Generische Frage-Komponente, rendert basierend auf Fragetyp:
SingleChoice – Radio-Buttons / Cards
MultipleChoice – Checkboxen (falls benötigt, aktuell nicht im Einsatz)
CompositeField – Zwei Dropdown-/Select-Felder (Jahrzehnt + Geschlecht)
InfoScreen – Nur Text + CTA-Button (für Q6, Q10, Q12, E1)
ProgressIndicator – Zeigt Fortschritt im aktuellen Strang an.
6.2 UX-Anforderungen
Animierte Übergänge zwischen Fragen (Slide oder Fade).
Keine Zurück-Navigation im Flow (bewusste Designentscheidung – zu klären, ob gewünscht). Falls doch: Zurück-Button, der vorherige Antwort vorausfüllt.
Responsive Design – Mobile-first, da Zielgruppe möglicherweise ältere Nutzer einschließt → große Schrift, große Touch-Targets.
Barrierefreiheit (a11y): ARIA-Labels, Keyboard-Navigation, ausreichender Kontrast.
6.3 State Management
interface PreOnboardingState {
  sessionId: string;
  currentStrand: 'extrovert' | 'introvert' | 'third_party' | null;
  currentQuestion: string; // z.B. 'Q1', 'Q7', 'E1'
  answers: Record<string, {
	selected: string[];
	birthDecade?: string;
	genderIdentity?: string;
	answeredAt: string;
  }>;
  status: 'in_progress' | 'paused' | 'completed';
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncError: boolean;
}
6.4 Routing-Engine
Implementiere eine deklarative Routing-Map, die die gesamte Flow-Logik abbildet:
type RouteRule = {
  questionId: string;
  optionId?: string;   	// Falls optionsspezifisch
  nextQuestionId: string;  // Nächste Frage oder 'E1' / 'E2'
};
 
const ROUTING_RULES: RouteRule[] = [
  // Q1 Branching
  { questionId: 'Q1', optionId: 'Q1_O1', nextQuestionId: 'Q2' },
  { questionId: 'Q1', optionId: 'Q1_O2', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O3', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O4', nextQuestionId: 'Q7' },
  { questionId: 'Q1', optionId: 'Q1_O5', nextQuestionId: 'Q12' },
 
  // Strang 1
  { questionId: 'Q2', nextQuestionId: 'Q3' },
  { questionId: 'Q3', nextQuestionId: 'Q4' },
  { questionId: 'Q4', nextQuestionId: 'Q5' },
  { questionId: 'Q5', optionId: 'Q5_O1', nextQuestionId: 'Q6' },
  { questionId: 'Q5', optionId: 'Q5_O2', nextQuestionId: 'Q6' },
  { questionId: 'Q5', optionId: 'Q5_O3', nextQuestionId: 'E1' },
  { questionId: 'Q6', nextQuestionId: 'E2' },
 
  // Strang 2
  { questionId: 'Q7', optionId: 'Q7_O1', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O2', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O3', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O4', nextQuestionId: 'Q8' },
  { questionId: 'Q7', optionId: 'Q7_O5', nextQuestionId: 'E2' },
  { questionId: 'Q7', optionId: 'Q7_O6', nextQuestionId: 'Q8' },
  { questionId: 'Q8', optionId: 'Q8_O1', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O2', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O3', nextQuestionId: 'Q9' },
  { questionId: 'Q8', optionId: 'Q8_O4', nextQuestionId: 'Q5' },  // Strangübergreifend!
  { questionId: 'Q8', optionId: 'Q8_O5', nextQuestionId: 'Q9' },
  { questionId: 'Q9', nextQuestionId: 'Q10' },
  { questionId: 'Q10', optionId: 'Q10_O1', nextQuestionId: 'Q11' },
  { questionId: 'Q10', optionId: 'Q10_O2', nextQuestionId: 'E1' },
  { questionId: 'Q11', nextQuestionId: 'E2' },
 
  // Strang 3
  { questionId: 'Q12', nextQuestionId: 'Q13' },
  { questionId: 'Q13', nextQuestionId: 'E2' },
];

7. Edge Cases & Fehlerbehandlung
Szenario
Verhalten
Browser geschlossen während Fragebogen
Bei Rückkehr: session_id aus LocalStorage lesen, Server-State abrufen, an letzter Frage fortsetzen.
Netzwerkfehler beim Speichern
Antwort bleibt im LocalStorage. Retry mit exponential Backoff. Visueller Hinweis: „Deine Antworten werden lokal gespeichert und synchronisiert, sobald die Verbindung wiederhergestellt ist."
LocalStorage nicht verfügbar (Private Mode in manchen Browsern)
Fallback auf Session-Cookie für session_id. Nur serverseitige Persistenz. Warnung: „Bitte schließe den Browser nicht, da dein Fortschritt sonst verloren gehen könnte."
Doppelte Sessions (Nutzer startet auf zwei Geräten)
Jedes Gerät hat eigene session_id. Bei Registrierung kann nur eine Session verknüpft werden (die aktuellste).
Session älter als 30 Tage
Serverseitig aufräumen: Status auf 'abandoned' setzen. Bei Wiederbesuch: Neue Session starten.
Registrierung ohne Pre-Onboarding
Möglich. user_id hat dann keinen preonboarding_sessions-Eintrag. App zeigt ggf. ein verkürztes Onboarding nach Login.


8. Daten-Nutzung nach Registrierung
Die gesammelten Antworten sollen nach der Registrierung in folgende User-Profil-Felder überführt werden:
Antwort-Quelle
Ziel-Feld im User-Profil
Beschreibung
Q1
communication_style
Bestimmt den Interaktionsstil der App
Q2
initial_topic_preference
Erstes Themengebiet
Q3
audience
Für wen werden Erinnerungen festgehalten
Q4 / Q11 / Q13
birth_decade, gender_identity
Demografische Zuordnung für passende Fragen
Q5
start_preference
Sofort starten vs. später
Q7
input_mode_preference
Schreiben vs. Sprechen vs. geführt
Q8
intimacy_level
Wie persönlich dürfen Fragen sein
Q9
primary_motivation
Hauptmotivation für die Nutzung
Strang-Zuordnung
user_type
'extrovert', 'introvert', 'third_party'


9. Testing-Anforderungen
Unit Tests: Routing-Engine (alle Pfade durch alle Stränge), State-Management, Sync-Logik.
Integration Tests: API-Endpunkte, Session-Erstellung, Wiederherstellung, User-Verknüpfung.
E2E Tests: Vollständiger Durchlauf aller drei Stränge, Abbruch-und-Wiederherstellung-Szenario, Netzwerk-Ausfall-Simulation.
Edge Case Tests: Strangübergreifender Sprung Q8→Q5, E1-Abbruch und Wiederaufnahme, doppelte Session-Verknüpfung.

10. Zusammenfassung der Implementierungsreihenfolge
Datenbank: preonboarding_sessions-Tabelle anlegen.
Backend-API: CRUD-Endpunkte für Sessions.
Frontend State Management: Session-ID-Generierung, LocalStorage-Layer, Sync-Service.
Routing-Engine: Deklarative Flow-Map implementieren.
UI-Komponenten: Frage-Screens, Info-Screens, Progress-Indicator.
Registrierungs-Integration: Session-Verknüpfung nach Signup.
Fehlerbehandlung: Offline-Support, Retry-Logik.
Testing: Alle Pfade, Edge Cases, Persistenz. 
