'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import styles from './MeetingPreOnboardingFlow.module.css';
import {
  deriveCurrentQuestion,
  deriveQuestionHistory,
  deriveStrandFromQ1,
  getPreviousQuestionId,
  getNextQuestionId,
  getProgressForState,
  mergeAnswers,
  type AnswerValue,
  type AnswersMap,
  type PreOnboardingState,
  type QuestionId,
} from './meetingFlow';

const STORAGE_KEY = 'meeting-pre-onboarding-v2';
const SESSION_COOKIE = 'meeting_preonboarding_session_id';

const DECADE_OPTIONS = [
  ['Q4_decade_1920', '1920er'],
  ['Q4_decade_1930', '1930er'],
  ['Q4_decade_1940', '1940er'],
  ['Q4_decade_1950', '1950er'],
  ['Q4_decade_1960', '1960er'],
  ['Q4_decade_1970', '1970er'],
  ['Q4_decade_1980', '1980er'],
  ['Q4_decade_1990', '1990er'],
  ['Q4_decade_2000', '2000er'],
  ['Q4_decade_2010', '2010er'],
  ['Q4_decade_2020', '2020er'],
  ['Q4_decade_none', 'keine Angabe'],
] as const;

const GENDER_OPTIONS = [
  ['Q4_gender_female', 'Frau'],
  ['Q4_gender_male', 'Mann'],
  ['Q4_gender_diverse', 'divers'],
  ['Q4_gender_none', 'keine Angabe'],
] as const;

type ChoiceOption = { id: string; label: string };

const SINGLE_CHOICE_QUESTIONS: Record<string, { title: string; options: ChoiceOption[] }> = {
  Q1: {
    title: 'Wie teilst du deine Gedanken und Erlebnisse am liebsten mit anderen?',
    options: [
      { id: 'Q1_O1', label: 'Ich rede gern frei drauflos und komme ins Erzählen, sobald ich anfange.' },
      { id: 'Q1_O2', label: 'Ich erzähle gern, brauche aber ein paar gezielte Fragen, um rein zu kommen.' },
      { id: 'Q1_O3', label: 'Ich bin eher zurückhaltend und teile nur, was ich mir vorher gut überlegt habe.' },
      { id: 'Q1_O4', label: 'Ich bin mir nicht sicher – ich möchte es einfach ausprobieren.' },
      {
        id: 'Q1_O5',
        label: 'Es geht nicht um mich. Ich möchte jemandem ermöglichen, seine Gedanken und Erinnerungen festzuhalten.',
      },
    ],
  },
  Q2: {
    title:
      'Worüber würdest du als Erstes gern erzählen – eher über dein Leben allgemein, bestimmte Erlebnisse oder Menschen, die dir wichtig sind?',
    options: [
      { id: 'Q2_O1', label: 'Leben im Allgemeinen' },
      { id: 'Q2_O2', label: 'Bestimmte Erlebnisse' },
      { id: 'Q2_O3', label: 'Wichtige Menschen' },
      { id: 'Q2_O4', label: 'Ich weiß noch nicht genau' },
    ],
  },
  Q3: {
    title: 'Für wen möchtest du das vor allem festhalten?',
    options: [
      { id: 'Q3_O1', label: 'Für mich selbst' },
      { id: 'Q3_O2', label: 'Für meine Partnerin / Partner' },
      { id: 'Q3_O3', label: 'Für meine Kinder' },
      { id: 'Q3_O4', label: 'Für meine Enkel' },
      { id: 'Q3_O5', label: 'Für meine Familie insgesamt' },
      { id: 'Q3_O6', label: 'Für jemand ganz Bestimmten' },
      { id: 'Q3_O7', label: 'Ich weiß es noch nicht' },
    ],
  },
  Q5: {
    title: 'Alles klar, möchtest du jetzt direkt mit deiner ersten Erzählung starten?',
    options: [
      { id: 'Q5_O1', label: 'Ja, gleich loslegen.' },
      { id: 'Q5_O2', label: 'Ja, aber mit kurzen Fragen als Einstieg.' },
      { id: 'Q5_O3', label: 'Lieber später.' },
    ],
  },
  Q7: {
    title: 'Wie möchtest du deine Erlebnisse, Erfahrungen, Gedanken am liebsten festhalten?',
    options: [
      { id: 'Q7_O1', label: 'In Ruhe schreiben, am liebsten kurze Texte oder Stichworte' },
      { id: 'Q7_O2', label: 'Ich schreibe gerne, auch längere Texte und lasse meinen Gedanken freien Lauf.' },
      { id: 'Q7_O3', label: 'In meinem eigenen Tempo sprechen – mit klaren Fragen.' },
      { id: 'Q7_O4', label: 'Mit sehr kurzen, konkreten Fragen, Schritt für Schritt.' },
      { id: 'Q7_O5', label: 'Ich unterhalte mich am liebsten mit einer anderen Person.' },
      { id: 'Q7_O6', label: 'Ich möchte erstmal nur schauen und später entscheiden.' },
    ],
  },
  Q8: {
    title: 'Wie persönlich dürfen die Fragen für dich am Anfang sein?',
    options: [
      { id: 'Q8_O1', label: 'Eher allgemein (z.B. Hobbys, Interessen, Alltag).' },
      { id: 'Q8_O2', label: 'Ein paar persönlichere Themen sind für mich in Ordnung.' },
      { id: 'Q8_O3', label: 'Ich bin bereit, auch sehr Persönliches zu teilen.' },
      { id: 'Q8_O4', label: 'Ich möchte selbst entscheiden, was ich thematisiere.' },
      { id: 'Q8_O5', label: 'Ich weiß es nicht und möchte mich später entscheiden.' },
    ],
  },
  Q9: {
    title: 'Was ist dir bei Nality am wichtigsten?',
    options: [
      { id: 'Q9_O1', label: 'Meine Erinnerungen für mich selbst sortieren.' },
      { id: 'Q9_O2', label: 'Etwas für meine Familie / kommende Generationen festhalten.' },
      { id: 'Q9_O3', label: 'Mein Gedächtnis und meine geistige Fitness trainieren.' },
      { id: 'Q9_O4', label: 'Erstmal ausprobieren, was zu mir passt.' },
    ],
  },
  Q10: {
    title:
      'Damit wir dir passende Fragen in deinem Tempo anbieten können, richten wir dir jetzt deinen persönlichen Bereich ein. Du bestimmst jederzeit, was du teilen möchtest.',
    options: [
      { id: 'Q10_O1', label: 'Ja, jetzt meinen persönlichen Bereich einrichten.' },
      { id: 'Q10_O2', label: 'Lieber später.' },
    ],
  },
};

function createSessionId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `meeting-${Date.now()}`;
}

function nowIso() {
  return new Date().toISOString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined') return false;
    const key = '__meeting_preonboarding_check__';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
}

function createInitialState(sessionId?: string): PreOnboardingState {
  return {
    sessionId: sessionId ?? createSessionId(),
    currentStrand: null,
    currentQuestion: 'Q1',
    questionHistory: [],
    answers: {},
    status: 'in_progress',
    lastSyncedAt: null,
    isSyncing: false,
    syncError: false,
  };
}

function loadLocalState(): PreOnboardingState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PreOnboardingState>;
    if (!parsed.sessionId || !parsed.currentQuestion || !parsed.answers) return null;
    return {
      sessionId: parsed.sessionId,
      currentStrand: parsed.currentStrand ?? deriveStrandFromQ1(parsed.answers.Q1?.selected?.[0]),
      currentQuestion: parsed.currentQuestion,
      questionHistory: Array.isArray(parsed.questionHistory)
        ? parsed.questionHistory.filter((questionId): questionId is QuestionId => typeof questionId === 'string')
        : deriveQuestionHistory(parsed.answers, parsed.currentQuestion),
      answers: parsed.answers,
      status: parsed.status ?? 'in_progress',
      lastSyncedAt: parsed.lastSyncedAt ?? null,
      isSyncing: false,
      syncError: false,
    };
  } catch {
    return null;
  }
}

function persistStateLocally(state: PreOnboardingState, localStorageEnabled: boolean) {
  writeCookie(SESSION_COOKIE, state.sessionId);
  if (!localStorageEnabled || typeof window === 'undefined') return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sessionId: state.sessionId,
      currentStrand: state.currentStrand,
      currentQuestion: state.currentQuestion,
      questionHistory: state.questionHistory,
      answers: state.answers,
      status: state.status,
      lastSyncedAt: state.lastSyncedAt,
    }),
  );
}

function buildAnswerForChoice(optionId: string): AnswerValue {
  return {
    selected: [optionId],
    answered_at: nowIso(),
  };
}

function buildAnswerForComposite(birthDecade: string, genderIdentity: string): AnswerValue {
  return {
    birth_decade: birthDecade,
    gender_identity: genderIdentity,
    answered_at: nowIso(),
  };
}

function questionTitle(questionId: QuestionId): string {
  if (SINGLE_CHOICE_QUESTIONS[questionId]) return SINGLE_CHOICE_QUESTIONS[questionId].title;
  if (questionId === 'Q4') {
    return 'Wir möchten dir möglichst passende Fragen stellen. Bitte ordne dich deshalb im Folgenden zu:';
  }
  if (questionId === 'Q11') {
    return 'Im ersten Schritt hast du die Möglichkeit dich zuzuordnen. Das hilft uns, Dir möglichst passende Fragen zu stellen.';
  }
  if (questionId === 'Q13') {
    return 'Um den persönlichen Erinnerungsraum bestmöglich nutzen zu können, teilen Sie uns bitte mit:';
  }
  if (questionId === 'Q6') {
    return 'Super, dann richten wir dir in weniger als 1 Minute deinen persönlichen Erinnerungsraum ein, damit deine Erzählungen sicher bewahrt werden.';
  }
  if (questionId === 'Q12') {
    return 'Super, dann richten wir in weniger als 1 Minute einen persönlichen Erinnerungsraum ein.';
  }
  if (questionId === 'E1') {
    return 'Alles klar, dann machen wir später weiter. Deine Eingaben bleiben sicher verwahrt.';
  }
  return 'Registrierung';
}

export function MeetingPreOnboardingFlow() {
  const router = useRouter();
  const [state, setState] = useState<PreOnboardingState | null>(null);
  const [stagedChoiceAnswers, setStagedChoiceAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [loading, setLoading] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localStorageEnabled, setLocalStorageEnabled] = useState(true);

  const persistAndSet = (nextState: PreOnboardingState) => {
    persistStateLocally(nextState, localStorageEnabled);
    setState(nextState);
  };

  const syncToServer = async (snapshot: PreOnboardingState): Promise<boolean> => {
    setState((prev) => (prev ? { ...prev, isSyncing: true, syncError: false } : prev));
    const payload = {
      current_strand: snapshot.currentStrand,
      current_question: snapshot.currentQuestion,
      answers: snapshot.answers,
      status: snapshot.status,
    };

    const correlationId = createSessionId();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`/api/preonboarding/sessions/${snapshot.sessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-Id': correlationId,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`sync-failed-${response.status}`);

        setState((prev) =>
          prev
            ? {
                ...prev,
                isSyncing: false,
                syncError: false,
                lastSyncedAt: nowIso(),
              }
            : prev,
        );

        return true;
      } catch {
        if (attempt < 2) {
          await sleep(300 * 2 ** attempt);
        }
      }
    }

    setState((prev) => (prev ? { ...prev, isSyncing: false, syncError: true } : prev));
    return false;
  };

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const canUseLocalStorage = isLocalStorageAvailable();
      if (!active) return;

      setLocalStorageEnabled(canUseLocalStorage);
      if (!canUseLocalStorage) {
        setStorageWarning('Bitte schließe den Browser nicht, da dein Fortschritt sonst verloren gehen könnte.');
      }

      const local = canUseLocalStorage ? loadLocalState() : null;
      const sessionFromCookie = readCookie(SESSION_COOKIE);
      const baseState = local ?? createInitialState(sessionFromCookie ?? undefined);

      if (!local && !sessionFromCookie) {
        try {
          await fetch('/api/preonboarding/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: baseState.sessionId }),
          });
        } catch {
          // Local-first fallback by design.
        }
      }

      let hydratedState = baseState;

      try {
        const response = await fetch(`/api/preonboarding/sessions/${baseState.sessionId}`, { method: 'GET' });
        if (response.ok) {
          const remote = (await response.json()) as {
            current_question?: QuestionId;
            current_strand?: PreOnboardingState['currentStrand'];
            status?: PreOnboardingState['status'];
            answers?: AnswersMap;
            updated_at?: string;
          };

          const mergedAnswers = mergeAnswers(baseState.answers, remote.answers ?? {});
          const fallbackQuestion = deriveCurrentQuestion(mergedAnswers);
          const resolvedQuestion = remote.current_question ?? fallbackQuestion;

          hydratedState = {
            ...baseState,
            answers: mergedAnswers,
            currentQuestion: resolvedQuestion,
            questionHistory:
              baseState.questionHistory.length > 0 && baseState.currentQuestion === resolvedQuestion
                ? baseState.questionHistory
                : deriveQuestionHistory(mergedAnswers, resolvedQuestion),
            currentStrand: remote.current_strand ?? deriveStrandFromQ1(mergedAnswers.Q1?.selected?.[0]),
            status: remote.status ?? baseState.status,
            lastSyncedAt: remote.updated_at ?? baseState.lastSyncedAt,
          };
        }
      } catch {
        // Offline / endpoint unavailable: use local state.
      }

      if (!active) return;

      persistStateLocally(hydratedState, canUseLocalStorage);
      setState(hydratedState);
      setShowResumePrompt(hydratedState.status === 'paused');
      setLoading(false);
    }

    bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const progress = useMemo(() => {
    if (!state) return null;
    return getProgressForState(state);
  }, [state]);

  const registrationHref = useMemo(() => {
    if (!state) return '/login?mode=signup';
    return `/login?mode=signup&preonboarding_session_id=${encodeURIComponent(state.sessionId)}`;
  }, [state]);

  const submitAnswer = async (questionId: QuestionId, answer: AnswerValue) => {
    if (!state) return;

    const nextAnswers: AnswersMap = {
      ...state.answers,
      [questionId]: answer,
    };

    const selectedOption = answer.selected?.[0];
    const nextQuestion = getNextQuestionId(questionId, selectedOption);
    const isRegistrationTransition = nextQuestion === 'E2';

    const nextState: PreOnboardingState = {
      ...state,
      answers: nextAnswers,
      currentQuestion: isRegistrationTransition ? questionId : nextQuestion,
      questionHistory:
        nextQuestion === state.currentQuestion || isRegistrationTransition
          ? state.questionHistory
          : [...state.questionHistory, state.currentQuestion],
      currentStrand:
        questionId === 'Q1'
          ? deriveStrandFromQ1(selectedOption)
          : state.currentStrand ?? deriveStrandFromQ1(nextAnswers.Q1?.selected?.[0]),
      status: nextQuestion === 'E1' ? 'paused' : isRegistrationTransition ? 'completed' : state.status,
      syncError: false,
    };

    persistAndSet(nextState);
    setErrorMessage(null);

    if (nextQuestion === 'E1') {
      setShowResumePrompt(false);
    }

    await syncToServer(nextState);

    if (isRegistrationTransition) {
      router.push(registrationHref);
    }
  };

  const proceedInfoScreen = async (questionId: 'Q6' | 'Q12') => {
    await submitAnswer(questionId, { answered_at: nowIso() });
  };

  const submitComposite = async (questionId: 'Q4' | 'Q11' | 'Q13', birthDecade: string, genderIdentity: string) => {
    if (!birthDecade || !genderIdentity) {
      setErrorMessage('Bitte fülle dieses Feld aus, bevor du fortfährst.');
      return;
    }

    await submitAnswer(questionId, buildAnswerForComposite(birthDecade, genderIdentity));
  };

  const handleE1Confirm = async () => {
    if (!state) return;
    const nextState: PreOnboardingState = {
      ...state,
      status: 'paused',
      currentQuestion: 'E1',
    };
    persistAndSet(nextState);
    await syncToServer(nextState);
    router.push('/');
  };

  const goToRegistration = async () => {
    if (!state) return;
    const nextState: PreOnboardingState = {
      ...state,
      status: 'completed',
    };
    persistAndSet(nextState);
    await syncToServer(nextState);
    router.push(registrationHref);
  };

  const handleBack = () => {
    if (!state) return;
    const previousQuestion = getPreviousQuestionId(state.currentQuestion, state.questionHistory);
    if (!previousQuestion) return;

    const nextHistory =
      state.currentQuestion === 'Q2' || state.currentQuestion === 'Q7' || state.currentQuestion === 'Q12'
        ? []
        : state.questionHistory.slice(0, -1);

    const nextState: PreOnboardingState = {
      ...state,
      currentQuestion: previousQuestion,
      questionHistory: nextHistory,
      status: previousQuestion === 'E1' ? 'paused' : 'in_progress',
      syncError: false,
    };

    persistAndSet(nextState);
    setErrorMessage(null);
    void syncToServer(nextState);
  };

  const handleDirectToRegistration = () => {
    if (!state) return;
    void goToRegistration();
  };

  const submitCurrentChoice = async () => {
    if (!state) return;
    const selectedOption = stagedChoiceAnswers[state.currentQuestion] ?? state.answers[state.currentQuestion]?.selected?.[0];
    if (!selectedOption) {
      setErrorMessage('Bitte wähle eine Antwort aus, bevor du fortfährst.');
      return;
    }

    await submitAnswer(state.currentQuestion, buildAnswerForChoice(selectedOption));
  };

  const handleNext = async () => {
    if (!state) return;
    setErrorMessage(null);

    if (choiceQuestion) {
      await submitCurrentChoice();
      return;
    }

    if (current === 'Q4' || current === 'Q11' || current === 'Q13') {
      await submitComposite(current, birthDecade, genderIdentity);
      return;
    }

    if (current === 'Q6' || current === 'Q12') {
      await proceedInfoScreen(current);
    }
  };

  const restart = () => {
    const next = createInitialState();
    persistAndSet(next);
    setShowResumePrompt(false);
    setErrorMessage(null);
  };

  if (loading || !state) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.panel}>Lade Onboarding …</section>
        </div>
      </main>
    );
  }

  if (showResumePrompt) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.panel} aria-labelledby="resume-title">
            <p className={styles.eyebrow}>Pre-Onboarding</p>
            <h1 id="resume-title" className={styles.title}>
              Onboarding fortsetzen?
            </h1>
            <p className={styles.lead}>Deine Eingaben wurden gespeichert. Möchtest du dort weitermachen, wo du aufgehört hast?</p>
            <div className={styles.actions}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const resumedQuestion = deriveCurrentQuestion(state.answers);
                  const resumed: PreOnboardingState = {
                    ...state,
                    status: 'in_progress',
                    currentQuestion: resumedQuestion,
                    questionHistory: deriveQuestionHistory(state.answers, resumedQuestion),
                  };
                  persistAndSet(resumed);
                  setShowResumePrompt(false);
                }}
              >
                Ja, fortsetzen
              </button>
              <button type="button" className="btn btn-secondary" onClick={restart}>
                Nein, neu starten
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const current = state.currentQuestion;
  const choiceQuestion = SINGLE_CHOICE_QUESTIONS[current];
  const compositeAnswer = state.answers[current];
  const birthDecade = compositeAnswer?.birth_decade ?? '';
  const genderIdentity = compositeAnswer?.gender_identity ?? '';
  const selectedChoiceOption = stagedChoiceAnswers[current] ?? state.answers[current]?.selected?.[0] ?? '';
  const isBackDisabled = current === 'Q1';
  const canShowNext = current !== 'E1';
  const nextQuestionId = choiceQuestion ? getNextQuestionId(current, selectedChoiceOption || undefined) : getNextQuestionId(current);
  const isRegistrationCta = canShowNext && nextQuestionId === 'E2';
  const isNextDisabled =
    canShowNext &&
    ((choiceQuestion && !selectedChoiceOption) ||
      ((current === 'Q4' || current === 'Q11' || current === 'Q13') && (!birthDecade || !genderIdentity)));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.panel}>
          <p className={styles.eyebrow}>Pre-Onboarding</p>
          <h1 className={styles.title}>Meeting-Vorbereitung</h1>
          {progress ? (
            <p className={styles.progressText}>
              Schritt {progress.current} von {progress.total}
            </p>
          ) : (
            <p className={styles.progressText}>Der Fortschritt beginnt nach der ersten Frage.</p>
          )}
          {state.lastSyncedAt ? <p className={styles.inlineMuted}>Zuletzt synchronisiert: {new Date(state.lastSyncedAt).toLocaleTimeString('de-DE')}</p> : null}
        </header>

        <section className={`${styles.panel} ${styles.questionPanel}`}>
          {storageWarning ? <p className={styles.systemInfo}>{storageWarning}</p> : null}

          {choiceQuestion ? (
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className={styles.questionLegend}>{choiceQuestion.title}</legend>
              <div className={styles.options}>
                {choiceQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={`${styles.optionLabel} ${selectedChoiceOption === option.id ? styles.optionLabelSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name={current}
                      checked={selectedChoiceOption === option.id}
                      onChange={() => {
                        setStagedChoiceAnswers((prev) => ({ ...prev, [current]: option.id }));
                        setErrorMessage(null);
                      }}
                    />
                    <span className={styles.optionText}>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {(current === 'Q4' || current === 'Q11' || current === 'Q13') && (
            <div className={styles.compositeGrid}>
              <h2 className={styles.questionLegend}>{questionTitle(current)}</h2>
              <label className="form-label" htmlFor={`${current}-decade`}>
                Geburtsjahrzehnt
              </label>
              <select
                id={`${current}-decade`}
                className={`form-select ${styles.meetingSelect}`}
                value={birthDecade}
                onChange={(event) => {
                  const value = event.target.value;
                  const selected = buildAnswerForComposite(value, genderIdentity);
                  persistAndSet({ ...state, answers: { ...state.answers, [current]: selected } });
                }}
              >
                <option value="">Bitte auswählen</option>
                {DECADE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <label className="form-label" htmlFor={`${current}-gender`}>
                Geschlechtsidentität
              </label>
              <select
                id={`${current}-gender`}
                className={`form-select ${styles.meetingSelect}`}
                value={genderIdentity}
                onChange={(event) => {
                  const value = event.target.value;
                  const selected = buildAnswerForComposite(birthDecade, value);
                  persistAndSet({ ...state, answers: { ...state.answers, [current]: selected } });
                }}
              >
                <option value="">Bitte auswählen</option>
                {GENDER_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

            </div>
          )}

          {current === 'Q6' && (
            <div>
              <h2 className={styles.questionLegend}>{questionTitle('Q6')}</h2>
            </div>
          )}

          {current === 'Q12' && (
            <div>
              <h2 className={styles.questionLegend}>{questionTitle('Q12')}</h2>
            </div>
          )}

          {current === 'E1' && (
            <div>
              <h2 className={styles.questionLegend}>{questionTitle('E1')}</h2>
              <div className={styles.actions}>
                <button type="button" className="btn btn-primary" onClick={() => void handleE1Confirm()}>
                  Okay
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    void goToRegistration();
                  }}
                >
                  Jetzt doch fortsetzen
                </button>
              </div>
            </div>
          )}

          {errorMessage ? (
            <p className={styles.error} role="status" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          {choiceQuestion && !selectedChoiceOption ? (
            <p className={styles.inlineMuted}>Wähle eine Antwort aus und klicke dann auf „Weiter“.</p>
          ) : null}

          <div className={styles.navActions}>
            <button
              type="button"
              className={`btn btn-secondary ${isBackDisabled ? styles.disabledButton : ''}`}
              onClick={handleBack}
              disabled={isBackDisabled}
              aria-disabled={isBackDisabled}
            >
              Zurück
            </button>
            {canShowNext ? (
              <button
                type="button"
                className={`btn btn-primary ${isNextDisabled ? styles.disabledButton : ''}`}
                onClick={() => void handleNext()}
                disabled={Boolean(isNextDisabled)}
                aria-disabled={Boolean(isNextDisabled)}
              >
                {isRegistrationCta ? 'Registrierung' : 'Weiter'}
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary" onClick={handleDirectToRegistration}>
              Direkt zur Anmeldung
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
