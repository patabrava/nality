import { beforeEach, describe, expect, it, vi } from 'vitest';
import { convertOnboardingToEvents } from '@/lib/events/onboarding-mapper';

type OnboardingAnswer = {
  id: string;
  user_id: string;
  question_topic: string;
  answer_text: string;
  created_at: string;
  answer_json?: Record<string, unknown> | null;
};

function createSupabaseMock(rows: OnboardingAnswer[]) {
  const updateCalls: Array<{ payload: unknown; id: string }> = [];

  const client = {
    from: (table: string) => {
      if (table !== 'onboarding_answers') {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: () => ({
          eq: () => ({
            order: () => ({ data: rows, error: null }),
          }),
        }),
        update: (payload: unknown) => ({
          eq: (_field: string, id: string) => {
            updateCalls.push({ payload, id });
            return { error: null };
          },
        }),
      };
    },
  };

  return { client, updateCalls };
}

describe('convertOnboardingToEvents', () => {
  const userId = 'user-123';
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('routes onboarding answers to users, user_profile, and life_event, marking answers extracted', async () => {
    const answers: OnboardingAnswer[] = [
      {
        id: 'a1',
        user_id: userId,
        question_topic: 'identity',
        answer_text: 'Ich heiße Max Mustermann, bitte per du.',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'a2',
        user_id: userId,
        question_topic: 'origins',
        answer_text: 'Geboren am 10.05.1988 in Frankfurt.',
        created_at: '2024-01-01T00:01:00Z',
      },
      {
        id: 'a3',
        user_id: userId,
        question_topic: 'influences',
        answer_text: 'Shakespeare und Sextus Empiricus.',
        created_at: '2024-01-01T00:02:00Z',
      },
      {
        id: 'a4',
        user_id: userId,
        question_topic: 'values',
        answer_text: 'anpassungsfähig, risikofreudig, lebensfreudig',
        created_at: '2024-01-01T00:03:00Z',
      },
      {
        id: 'a5',
        user_id: userId,
        question_topic: 'career',
        answer_text: 'Head of Applied bei The Little Spine.',
        created_at: '2024-01-01T00:04:00Z',
      },
    ];

    const { client, updateCalls } = createSupabaseMock(answers);

    const fetchMock = vi.fn(async (_url, init) => {
      const body = JSON.parse(String(init?.body || '{}'));
      const topic = body.topic as string;
      const destination =
        topic === 'identity' || topic === 'origins'
          ? 'users'
          : topic === 'influences' || topic === 'values'
          ? 'user_profile'
          : 'life_event';

      if (destination === 'life_event') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            destination,
            events: [
              {
                title: `${topic} event`,
                description: body.content,
                start_date: null,
                category: 'career',
                confidence: 0.9,
                source: 'onboarding',
              },
            ],
          }),
          text: async () => 'ok',
        };
      }

      return {
        ok: true,
        json: async () => ({
          success: true,
          destination,
        }),
        text: async () => 'ok',
      };
    });

    // @ts-expect-error override global in test
    global.fetch = fetchMock;

    const result = await convertOnboardingToEvents(userId, client as any, {
      baseUrl,
      accessToken: 'token-123',
    });

    expect(result.usersUpdated).toBe(true);
    expect(result.profileUpdated).toBe(true);
    expect(result.eventsCreated).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);

    // All answers should have been processed and marked extracted
    expect(updateCalls).toHaveLength(answers.length);

    // Extraction API should be called once per answer with onboarding source and userId
    expect(fetchMock).toHaveBeenCalledTimes(answers.length);
    expect(fetchMock.mock.calls[0]).toBeDefined();
    const firstCall = fetchMock.mock.calls[0];
    const firstCallBody = JSON.parse(String(firstCall?.[1]?.body ?? '{}'));
    expect(firstCallBody.source).toBe('onboarding');
    expect(firstCallBody.userId).toBe(userId);
  });
});
