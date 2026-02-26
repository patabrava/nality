import {
  type AltAnswerValue,
  type AltDemographicAnswer,
  type AltPath,
  type AltStage,
  type AltStep,
  getNextStep,
  getRegistrationAnchorStepId,
} from '@/lib/onboarding/alt-config';

interface NextLocation {
  stage: Exclude<AltStage, 'entry' | 'completed'>;
  stepId: string | null;
  registrationSource: 'path' | 'neutral' | null;
}

function isDemographicAnswer(value: AltAnswerValue | undefined): value is AltDemographicAnswer {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasSelectedValue(value: string | string[] | undefined): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

export function isStepResponseValid(step: AltStep, value: AltAnswerValue | undefined): boolean {
  if (step.kind === 'info') {
    return true;
  }

  if (step.kind === 'single' || step.kind === 'decision') {
    return typeof value === 'string' && value.trim().length > 0;
  }

  if (step.kind === 'multi') {
    return Array.isArray(value) && value.length > 0;
  }

  if (step.kind === 'demographics') {
    if (!isDemographicAnswer(value)) return false;
    const fields = step.fields ?? [];
    if (fields.length === 0) return true;

    return fields.every((field) => {
      const fieldValue = value[field.id];
      if (field.multiple) {
        return Array.isArray(fieldValue) && fieldValue.length > 0;
      }
      return typeof fieldValue === 'string' && fieldValue.trim().length > 0;
    });
  }

  return false;
}

export function resolveNextLocation(
  path: AltPath,
  step: AltStep,
  value: AltAnswerValue | undefined,
): NextLocation {
  if (path === 'A' && step.id === 'A4') {
    const selection = typeof value === 'string' ? value : '';
    if (selection === 'start_storytelling') {
      return { stage: 'neutral', stepId: null, registrationSource: null };
    }
    return { stage: 'registration', stepId: null, registrationSource: 'path' };
  }

  if (path === 'B' && step.id === 'B4') {
    const selection = typeof value === 'string' ? value : '';
    if (selection === 'jump_to_neutral') {
      return { stage: 'neutral', stepId: null, registrationSource: null };
    }
  }

  if ((path === 'B' && step.id === 'B5') || (path === 'C' && step.id === 'C2')) {
    return { stage: 'registration', stepId: null, registrationSource: 'path' };
  }

  const nextStep = getNextStep(path, step.id);
  if (nextStep) {
    return { stage: 'path', stepId: nextStep.id, registrationSource: null };
  }

  return { stage: 'registration', stepId: null, registrationSource: 'path' };
}

export function resolveBackStepId(path: AltPath, currentStepId: string): string | null {
  const steps = {
    A: ['A1', 'A2', 'A3', 'A4'],
    B: ['B1', 'B2', 'B3', 'B4', 'B5'],
    C: ['C1', 'C2'],
  }[path];

  const index = steps.indexOf(currentStepId);
  if (index <= 0) return null;
  return steps[index - 1] ?? null;
}

export function getNeutralReturnStepId(path: AltPath): string {
  if (path === 'A') return 'A4';
  if (path === 'B') return 'B4';
  return 'C2';
}

export function getRegistrationBackTarget(path: AltPath, source: 'path' | 'neutral' | null): {
  stage: 'path' | 'neutral';
  stepId: string | null;
} {
  if (source === 'neutral') {
    return { stage: 'neutral', stepId: null };
  }

  return { stage: 'path', stepId: getRegistrationAnchorStepId(path) };
}

export function toggleMultiValue(existing: AltAnswerValue | undefined, optionId: string): string[] {
  const currentValues = Array.isArray(existing) ? existing : [];
  if (currentValues.includes(optionId)) {
    return currentValues.filter((value) => value !== optionId);
  }
  return [...currentValues, optionId];
}

export function updateDemographicValue(
  existing: AltAnswerValue | undefined,
  fieldId: string,
  nextValue: string | string[],
): AltDemographicAnswer {
  const current = isDemographicAnswer(existing) ? existing : {};
  return {
    ...current,
    [fieldId]: nextValue,
  };
}

export function hasAnsweredSelection(value: AltAnswerValue | undefined): boolean {
  if (typeof value === 'string') return hasSelectedValue(value);
  if (Array.isArray(value)) return hasSelectedValue(value);
  if (isDemographicAnswer(value)) {
    return Object.values(value).some((entry) => hasSelectedValue(entry));
  }
  return false;
}
