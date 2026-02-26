'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchUserProfile } from '@/lib/supabase/client';
import {
  type AddressPreference,
  type AltOnboardingDraft,
  type AltRegistrationDraft,
  type EntryAnswerId,
  createEmptyAltOnboardingDraft,
  ENTRY_OPTIONS,
  ENTRY_QUESTION,
  getFirstStep,
  getPathFromEntryAnswer,
  getPreviousStep,
  getStepById,
  getStepIndex,
  PATH_STEPS,
} from '@/lib/onboarding/alt-config';
import {
  getNeutralReturnStepId,
  getRegistrationBackTarget,
  isStepResponseValid,
  resolveNextLocation,
} from '@/lib/onboarding/alt-machine';
import {
  clearAltOnboardingDraft,
  loadAltOnboardingDraft,
  saveAltOnboardingDraft,
} from '@/lib/onboarding/alt-draft-storage';
import { AltProgressHeader } from '@/components/onboarding-alt/AltProgressHeader';
import { AltStepRenderer } from '@/components/onboarding-alt/AltStepRenderer';
import { NeutralStartBlock } from '@/components/onboarding-alt/NeutralStartBlock';
import { AltRegistrationModule } from '@/components/onboarding-alt/AltRegistrationModule';
import { AddressPreferenceModal } from '@/components/onboarding-alt/AddressPreferenceModal';

interface AltFinalizePayload {
  registration: AltRegistrationDraft;
  addressPreference: AddressPreference;
  entry: AltOnboardingDraft['entry'];
  path: AltOnboardingDraft['path'];
  responses: AltOnboardingDraft['responses'];
  neutralBlockVisited: boolean;
}

interface AltPendingPayload extends Omit<AltFinalizePayload, 'addressPreference'> {
  addressPreference: AddressPreference | null;
}

interface AltPendingResponse {
  success: boolean;
  token: string;
  expiresAt: string;
}

interface AltErrorResponse {
  error?: string;
}

function buildFinalizePayload(draft: AltOnboardingDraft, addressPreference: AddressPreference): AltFinalizePayload | null {
  if (!draft.registration) return null;

  return {
    registration: draft.registration,
    addressPreference,
    entry: draft.entry,
    path: draft.path,
    responses: draft.responses,
    neutralBlockVisited: draft.neutralBlockVisited,
  };
}

function buildPendingPayload(draft: AltOnboardingDraft, registration: AltRegistrationDraft): AltPendingPayload {
  return {
    registration,
    addressPreference: draft.addressPreference,
    entry: draft.entry,
    path: draft.path,
    responses: draft.responses,
    neutralBlockVisited: draft.neutralBlockVisited,
  };
}

function buildAuthCallbackRedirectUrl(pendingToken: string | null): string | null {
  if (typeof window === 'undefined') return null;

  const callbackUrl = new URL('/auth/callback', window.location.origin);
  if (pendingToken) {
    callbackUrl.searchParams.set('altToken', pendingToken);
  }
  return callbackUrl.toString();
}

export function AltOnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    signUpWithPassword,
    signInWithGoogle,
  } = useAuth();

  const [draft, setDraft] = useState<AltOnboardingDraft>(() => createEmptyAltOnboardingDraft());
  const [entrySelection, setEntrySelection] = useState<EntryAnswerId | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRegistrationSubmitting, setIsRegistrationSubmitting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAwaitingEmailConfirmation, setIsAwaitingEmailConfirmation] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [modalAddressPreference, setModalAddressPreference] = useState<AddressPreference>('du');
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const autoFinalizeTriggered = useRef(false);

  const pendingTokenFromQuery = useMemo(() => {
    const value = searchParams.get('altToken');
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }, [searchParams]);

  useEffect(() => {
    const storedDraft = loadAltOnboardingDraft();
    setDraft(storedDraft);
    setEntrySelection(storedDraft.entry?.answerId ?? null);
    setModalAddressPreference(storedDraft.addressPreference ?? 'du');
    setIsDraftHydrated(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'dark');

    return () => {
      if (previousTheme) {
        root.setAttribute('data-theme', previousTheme);
      } else {
        root.removeAttribute('data-theme');
      }
    };
  }, []);

  useEffect(() => {
    if (!isDraftHydrated) return;
    saveAltOnboardingDraft(draft);
  }, [draft, isDraftHydrated]);

  useEffect(() => {
    if (draft.addressPreference) {
      setModalAddressPreference(draft.addressPreference);
    }
  }, [draft.addressPreference]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    let cancelled = false;
    const checkCompletion = async () => {
      const profile = await fetchUserProfile(user.id);
      if (!cancelled && profile?.onboarding_complete) {
        clearAltOnboardingDraft();
        router.replace('/dash');
      }
    };

    void checkCompletion();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, router, user?.id]);

  const currentStep = useMemo(() => {
    if (!draft.path || !draft.currentStepId) return null;
    return getStepById(draft.path, draft.currentStepId);
  }, [draft.currentStepId, draft.path]);

  const currentStepAnswer = useMemo(() => {
    if (!currentStep) return undefined;
    return draft.responses[currentStep.id];
  }, [currentStep, draft.responses]);

  const stageLabel = useMemo(() => {
    if (!draft.path) return 'Startfrage';
    if (draft.stage === 'neutral') return 'Neutraler Storytelling-Block';
    if (draft.stage === 'registration') return 'Registrierung';
    if (!currentStep) return 'Onboarding';
    const index = getStepIndex(draft.path, currentStep.id);
    return `Schritt ${index + 1} von ${PATH_STEPS[draft.path].length}`;
  }, [currentStep, draft.path, draft.stage]);

  const updateDraft = useCallback((updater: (previous: AltOnboardingDraft) => AltOnboardingDraft) => {
    setDraft((previous) => updater(previous));
  }, []);

  const createPendingLink = useCallback(async (payload: AltPendingPayload): Promise<string | null> => {
    try {
      const response = await fetch('/api/onboarding/alt/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as AltPendingResponse | AltErrorResponse | null;
      if (!response.ok) {
        const message = data && 'error' in data ? data.error ?? null : null;
        setRegistrationError(message ?? 'Verknuepfung fuer spaetere Finalisierung fehlgeschlagen.');
        return null;
      }

      if (!data || !('token' in data) || typeof data.token !== 'string' || !data.token.trim()) {
        setRegistrationError('Verknuepfung fuer spaetere Finalisierung fehlt.');
        return null;
      }

      return data.token;
    } catch {
      setRegistrationError('Verbindung fehlgeschlagen. Bitte erneut versuchen.');
      return null;
    }
  }, []);

  const finalizeOnboarding = useCallback(
    async (draftToFinalize: AltOnboardingDraft, addressPreference: AddressPreference) => {
      const pendingToken = draftToFinalize.pendingLinkToken ?? pendingTokenFromQuery;

      if (!isAuthenticated || !user) {
        updateDraft((previous) => ({
          ...previous,
          pendingFinalize: true,
          addressPreference,
          pendingLinkToken: pendingToken,
        }));
        setStatusMessage(
          'Deine Auswahl ist gespeichert. Bitte melde dich nach der E-Mail-Bestätigung wieder an, damit wir den Vorgang abschließen können.',
        );
        return;
      }

      let requestBody: AltFinalizePayload | { pendingToken: string; addressPreference: AddressPreference };
      if (pendingToken) {
        requestBody = {
          pendingToken,
          addressPreference,
        };
      } else {
        const payload = buildFinalizePayload(draftToFinalize, addressPreference);
        if (!payload) {
          setFinalizeError('Registrierungsdaten fehlen.');
          return;
        }
        requestBody = payload;
      }

      setIsFinalizing(true);
      setFinalizeError(null);
      setStatusMessage(null);

      try {
        const response = await fetch('/api/onboarding/alt/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = data?.error ?? 'Finalisierung fehlgeschlagen.';
          setFinalizeError(message);
          updateDraft((previous) => ({
            ...previous,
            pendingFinalize: true,
            addressPreference,
            pendingLinkToken: pendingToken,
          }));
          return;
        }

        clearAltOnboardingDraft();
        setDraft((previous) => ({
          ...previous,
          stage: 'completed',
          pendingFinalize: false,
          pendingLinkToken: null,
          awaitingAddressPreferenceAfterOAuth: false,
          completedAt: new Date().toISOString(),
        }));
        router.replace('/dash');
      } catch {
        setFinalizeError('Die Verbindung zum Server ist fehlgeschlagen. Bitte erneut versuchen.');
        updateDraft((previous) => ({
          ...previous,
          pendingFinalize: true,
          addressPreference,
          pendingLinkToken: pendingToken,
        }));
      } finally {
        setIsFinalizing(false);
      }
    },
    [isAuthenticated, pendingTokenFromQuery, router, updateDraft, user],
  );

  useEffect(() => {
    if (!pendingTokenFromQuery) return;

    updateDraft((previous) => {
      if (previous.pendingLinkToken === pendingTokenFromQuery && previous.pendingFinalize) {
        return previous;
      }

      return {
        ...previous,
        pendingLinkToken: pendingTokenFromQuery,
        pendingFinalize: true,
      };
    });
  }, [pendingTokenFromQuery, updateDraft]);

  useEffect(() => {
    if (isAuthenticated && draft.awaitingAddressPreferenceAfterOAuth && !draft.addressPreference) {
      setShowAddressModal(true);
    }
  }, [draft.addressPreference, draft.awaitingAddressPreferenceAfterOAuth, isAuthenticated]);

  useEffect(() => {
    const hasPendingToken = Boolean(draft.pendingLinkToken ?? pendingTokenFromQuery);
    if (
      !isAuthenticated ||
      !hasPendingToken ||
      draft.addressPreference ||
      draft.stage === 'completed' ||
      isAwaitingEmailConfirmation
    )
      return;

    setStatusMessage('Bitte bestaetige noch die Anrede, damit wir dein Onboarding abschliessen koennen.');
    setShowAddressModal(true);
  }, [
    draft.addressPreference,
    draft.pendingLinkToken,
    draft.stage,
    isAuthenticated,
    isAwaitingEmailConfirmation,
    pendingTokenFromQuery,
  ]);

  const hasFinalizeSource =
    draft.registration !== null || draft.pendingLinkToken !== null || pendingTokenFromQuery !== null;

  const canAutoFinalize =
    isAuthenticated &&
    draft.pendingFinalize &&
    draft.addressPreference !== null &&
    hasFinalizeSource &&
    !isFinalizing;

  useEffect(() => {
    if (!canAutoFinalize) {
      autoFinalizeTriggered.current = false;
      return;
    }
    if (autoFinalizeTriggered.current) return;

    autoFinalizeTriggered.current = true;
    void finalizeOnboarding(draft, draft.addressPreference as AddressPreference);
  }, [canAutoFinalize, draft, finalizeOnboarding, isFinalizing]);

  const handleEntryContinue = () => {
    if (!entrySelection) {
      setStepError('Bitte wähle eine Antwort aus.');
      return;
    }

    const path = getPathFromEntryAnswer(entrySelection);
    const firstStep = getFirstStep(path);

    updateDraft((previous) => ({
      ...previous,
      entry: { answerId: entrySelection, path },
      path,
      stage: 'path',
      currentStepId: firstStep.id,
      responses: {
        ...previous.responses,
        ENTRY: entrySelection,
      },
    }));
    setStepError(null);
  };

  const handleStepNext = () => {
    if (!draft.path || !currentStep) return;

    const value = draft.responses[currentStep.id];
    if (!isStepResponseValid(currentStep, value)) {
      setStepError('Bitte beantworte den Schritt, bevor du fortfahrst.');
      return;
    }

    const next = resolveNextLocation(draft.path, currentStep, value);
    updateDraft((previous) => ({
      ...previous,
      stage: next.stage,
      currentStepId: next.stepId,
      neutralBlockVisited: next.stage === 'neutral' ? true : previous.neutralBlockVisited,
      routeToRegistrationSource: next.stage === 'registration' ? next.registrationSource : previous.routeToRegistrationSource,
    }));
    setStepError(null);
  };

  const handleStepBack = () => {
    if (!draft.path || !currentStep) {
      updateDraft((previous) => ({ ...previous, stage: 'entry' }));
      return;
    }

    const previousStep = getPreviousStep(draft.path, currentStep.id);
    if (!previousStep) {
      updateDraft((previous) => ({
        ...previous,
        stage: 'entry',
        currentStepId: null,
      }));
      return;
    }

    updateDraft((previous) => ({
      ...previous,
      stage: 'path',
      currentStepId: previousStep.id,
    }));
    setStepError(null);
  };

  const handleBackFromRegistration = () => {
    setIsAwaitingEmailConfirmation(false);

    if (!draft.path) {
      updateDraft((previous) => ({ ...previous, stage: 'entry' }));
      return;
    }

    const target = getRegistrationBackTarget(draft.path, draft.routeToRegistrationSource);
    updateDraft((previous) => ({
      ...previous,
      stage: target.stage,
      currentStepId: target.stepId,
      routeToRegistrationSource: null,
    }));
  };

  const handlePasswordRegistration = async (submission: {
    firstNameOrNickname: string;
    lastName: string;
    email: string;
    password: string;
    method: 'password';
  }) => {
    setRegistrationError(null);
    setStatusMessage(null);
    setIsAwaitingEmailConfirmation(false);
    setIsRegistrationSubmitting(true);

    const registrationDraft: AltRegistrationDraft = {
      firstNameOrNickname: submission.firstNameOrNickname,
      lastName: submission.lastName,
      email: submission.email,
      method: 'password',
    };

    const pendingToken = await createPendingLink(buildPendingPayload(draft, registrationDraft));
    if (!pendingToken) {
      setIsRegistrationSubmitting(false);
      return;
    }

    updateDraft((previous) => ({
      ...previous,
      registration: registrationDraft,
      pendingFinalize: true,
      pendingLinkToken: pendingToken,
    }));

    const redirectTo = buildAuthCallbackRedirectUrl(pendingToken);
    const signUpOptions = redirectTo ? { redirectTo } : undefined;
    const { error } = await signUpWithPassword(submission.email, submission.password, signUpOptions);

    setIsRegistrationSubmitting(false);

    if (error) {
      setRegistrationError(error.message ?? 'Registrierung fehlgeschlagen.');
      return;
    }

    setShowAddressModal(false);
    setIsAwaitingEmailConfirmation(true);
    setStatusMessage('Deine E-Mail wurde registriert. Bitte prüfe dein Postfach, um dein Konto zu bestätigen.');
  };

  const handleGoogleRegistration = async (submission: AltRegistrationDraft) => {
    setRegistrationError(null);
    setStatusMessage(null);
    setIsAwaitingEmailConfirmation(false);
    setIsRegistrationSubmitting(true);

    const pendingToken = await createPendingLink(buildPendingPayload(draft, submission));
    if (!pendingToken) {
      setIsRegistrationSubmitting(false);
      return;
    }

    updateDraft((previous) => ({
      ...previous,
      registration: submission,
      pendingFinalize: false,
      pendingLinkToken: pendingToken,
      awaitingAddressPreferenceAfterOAuth: true,
    }));

    const redirectTo = buildAuthCallbackRedirectUrl(pendingToken);
    const googleOptions = redirectTo ? { redirectTo } : undefined;
    const { error } = await signInWithGoogle(googleOptions);

    setIsRegistrationSubmitting(false);

    if (error) {
      setRegistrationError(error.message ?? 'Google-Registrierung fehlgeschlagen.');
      updateDraft((previous) => ({
        ...previous,
        awaitingAddressPreferenceAfterOAuth: false,
      }));
    }
  };

  const handleAddressConfirm = async () => {
    const nextDraft: AltOnboardingDraft = {
      ...draft,
      addressPreference: modalAddressPreference,
      awaitingAddressPreferenceAfterOAuth: false,
      pendingFinalize: true,
    };
    setDraft(nextDraft);
    setShowAddressModal(false);
    await finalizeOnboarding(nextDraft, modalAddressPreference);
  };

  const handleNeutralBack = () => {
    if (!draft.path) {
      updateDraft((previous) => ({ ...previous, stage: 'entry' }));
      return;
    }

    updateDraft((previous) => ({
      ...previous,
      stage: 'path',
      currentStepId: getNeutralReturnStepId(draft.path as NonNullable<typeof draft.path>),
    }));
  };

  const handleNeutralContinue = () => {
    updateDraft((previous) => ({
      ...previous,
      stage: 'registration',
      routeToRegistrationSource: 'neutral',
      neutralBlockVisited: true,
    }));
  };

  const disableNext = !currentStep || !isStepResponseValid(currentStep, currentStepAnswer);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--md-sys-color-background)',
        color: 'var(--md-sys-color-on-background)',
        padding: '24px 16px 40px',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px' }}>
          <p
            style={{
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.75rem',
            }}
          >
            Pre-Registration Onboarding
          </p>
          <h1 style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: '2rem' }}>
            Willkommen bei Nality
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.7 }}>
            Wir passen den Einstieg an deine Antwort an und speichern deinen Fortschritt automatisch.
          </p>
          {draft.stage === 'entry' ? (
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                marginTop: '12px',
                color: 'var(--accent-gold)',
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              ← Zur Startseite
            </Link>
          ) : null}
        </header>

        {draft.path && (draft.stage === 'path' || draft.stage === 'neutral') ? (
          <AltProgressHeader path={draft.path} currentStepId={draft.currentStepId} stageLabel={stageLabel} />
        ) : null}

        {statusMessage ? (
          <p
            style={{
              margin: '0 0 12px',
              border: '1px solid var(--md-sys-color-outline)',
              background: 'var(--md-sys-color-surface-container)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {statusMessage}
          </p>
        ) : null}

        {finalizeError ? (
          <p
            style={{
              margin: '0 0 12px',
              border: '1px solid #e6a19a',
              background: '#3a1d1a',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#ffd9d5',
            }}
          >
            {finalizeError}
          </p>
        ) : null}

        {draft.stage === 'entry' ? (
          <section
            style={{
              borderRadius: '14px',
              border: '1px solid var(--md-sys-color-outline-variant)',
              background: 'var(--md-sys-color-surface-container-low)',
              padding: '20px',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
              Screen 0
            </p>
            <h2 style={{ margin: '8px 0 0', fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 500 }}>
              {ENTRY_QUESTION}
            </h2>

            <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
              {ENTRY_OPTIONS.map((option) => {
                const selected = entrySelection === option.answerId;
                return (
                  <label
                    key={option.id}
                    style={{
                      border: selected
                        ? '1px solid var(--md-sys-color-primary)'
                        : '1px solid var(--md-sys-color-outline-variant)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      display: 'grid',
                      gap: '4px',
                      cursor: 'pointer',
                      background: selected ? 'var(--md-sys-color-surface-container-high)' : 'transparent',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="entry"
                        checked={selected}
                        onChange={() => setEntrySelection(option.answerId)}
                        style={{ accentColor: 'var(--md-sys-color-primary)' }}
                      />
                      {option.label}
                    </span>
                    <span style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                      {option.description}
                    </span>
                  </label>
                );
              })}
            </div>

            {stepError ? <p style={{ margin: '12px 0 0', color: '#ffd9d5' }}>{stepError}</p> : null}

            <div style={{ marginTop: '18px' }}>
              <button
                type="button"
                onClick={handleEntryContinue}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.5rem',
                }}
              >
                Weiter
              </button>
            </div>
          </section>
        ) : null}

        {draft.stage === 'path' && currentStep ? (
          <AltStepRenderer
            step={currentStep}
            value={currentStepAnswer}
            disableNext={disableNext}
            errorMessage={stepError}
            onBack={handleStepBack}
            onNext={handleStepNext}
            onChange={(value) => {
              updateDraft((previous) => ({
                ...previous,
                responses: {
                  ...previous.responses,
                  [currentStep.id]: value,
                },
              }));
              setStepError(null);
            }}
          />
        ) : null}

        {draft.stage === 'neutral' ? (
          <NeutralStartBlock onContinueToRegistration={handleNeutralContinue} onBackToPath={handleNeutralBack} />
        ) : null}

        {draft.stage === 'registration' ? (
          isAwaitingEmailConfirmation ? (
            <section
              role="status"
              aria-live="polite"
              style={{
                borderRadius: '14px',
                border: '1px solid var(--md-sys-color-outline-variant)',
                padding: '20px',
                background: 'var(--md-sys-color-surface-container-low)',
              }}
            >
              <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.45rem' }}>E-Mail registriert</h2>
              <p style={{ margin: '10px 0 0', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.6 }}>
                Wir haben deine Registrierung gespeichert. Bitte prüfe jetzt dein Postfach und bestätige deine E-Mail,
                um fortzufahren.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
                <Link
                  href="/login"
                  className="btn btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    textDecoration: 'none',
                  }}
                >
                  Zum Login
                </Link>
              </div>
            </section>
          ) : (
            <AltRegistrationModule
              initialValues={draft.registration}
              isSubmitting={isRegistrationSubmitting || isFinalizing}
              errorMessage={registrationError}
              onPasswordSubmit={handlePasswordRegistration}
              onGoogleSubmit={handleGoogleRegistration}
              onBack={handleBackFromRegistration}
            />
          )
        ) : null}

        {authLoading ? (
          <p style={{ marginTop: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
            Authentifizierung wird geladen ...
          </p>
        ) : null}

        <p
          style={{
            margin: '24px 0 0',
            textAlign: 'center',
            color: 'var(--md-sys-color-on-surface-variant)',
            fontSize: '0.95rem',
          }}
        >
          Bereits ein Konto?{' '}
          <Link
            href="/login"
            style={{
              color: 'var(--accent-gold)',
              textDecoration: 'none',
            }}
          >
            Direkt zum Login
          </Link>
        </p>
      </div>

      <AddressPreferenceModal
        isOpen={showAddressModal}
        value={modalAddressPreference}
        isSaving={isFinalizing}
        errorMessage={finalizeError}
        onChange={setModalAddressPreference}
        onConfirm={handleAddressConfirm}
      />
    </div>
  );
}
