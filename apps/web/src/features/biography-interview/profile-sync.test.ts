import { beforeEach, describe, expect, it, vi } from 'vitest';

const extractBirthDataMock = vi.fn();
const extractProfileDataMock = vi.fn();

vi.mock('@/lib/extraction', () => ({
  extractBirthData: extractBirthDataMock,
  extractProfileData: extractProfileDataMock,
}));

function createServiceClientState(options?: {
  userRow?: Record<string, unknown> | null;
  profileRow?: Record<string, unknown> | null;
}) {
  const state = {
    userRow: options?.userRow ?? { birth_date: null, birth_place: null },
    profileRow: options?.profileRow ?? null,
    userUpdates: [] as Array<Record<string, unknown>>,
    profileUpserts: [] as Array<Record<string, unknown>>,
  };

  const serviceClient = {
    from(table: string) {
      if (table === 'users') {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: state.userRow, error: null }),
                };
              },
            };
          },
          update(payload: Record<string, unknown>) {
            return {
              eq: async () => {
                state.userUpdates.push(payload);
                state.userRow = {
                  ...(state.userRow ?? {}),
                  ...payload,
                };
                return { error: null };
              },
            };
          },
        };
      }

      if (table === 'user_profile') {
        return {
          select() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({ data: state.profileRow, error: null }),
                };
              },
            };
          },
          upsert: async (payload: Record<string, unknown>) => {
            state.profileUpserts.push(payload);
            state.profileRow = {
              ...(state.profileRow ?? {}),
              ...payload,
            };
            return { error: null };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };

  return { serviceClient, state };
}

describe('syncBiographyInterviewProfileData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('backfills missing birth and profile data from answered biography questions', async () => {
    extractBirthDataMock.mockReturnValue({
      birth_date: '1988-05-12',
      birth_place: 'Medellin, Kolumbien',
    });
    extractProfileDataMock.mockResolvedValue({
      influences: [
        {
          name: 'Alicia',
          type: 'mentor',
          why: 'Standhaft und aufmerksam',
        },
      ],
    });

    const { serviceClient, state } = createServiceClientState();
    const { syncBiographyInterviewProfileData } = await import('./profile-sync');

    await syncBiographyInterviewProfileData({
      serviceClient: serviceClient as never,
      userId: 'user-1',
      currentQuestionId: 'childhood.earliest_memory',
      currentAnswerText:
        'Eine meiner frühesten Erinnerungen ist ein sonniger Innenhof in Medellin, in dem Musik lief.',
      progressRows: [
        {
          interview_session_id: 'session-1',
          user_id: 'user-1',
          question_id: 'basis.birth',
          topic_id: 'basis_information',
          state: 'answered',
          asked_count: 1,
          asked_at: null,
          answered_at: null,
          deferred_at: null,
          skipped_at: null,
          answer_memory_id: null,
          prompt_snapshot: null,
          evaluator_summary: null,
          answer_excerpt:
            'Ich wurde am 12. Mai 1988 in Medellin in Kolumbien geboren und erinnere mich an eine große Familie.',
        },
        {
          interview_session_id: 'session-1',
          user_id: 'user-1',
          question_id: 'family.influence',
          topic_id: 'family_background',
          state: 'answered',
          asked_count: 1,
          asked_at: null,
          answered_at: null,
          deferred_at: null,
          skipped_at: null,
          answer_memory_id: null,
          prompt_snapshot: null,
          evaluator_summary: null,
          answer_excerpt:
            'Meine Großmutter Alicia hat mich inspiriert, weil sie ruhig, klug und standhaft war.',
        },
      ],
    });

    expect(extractBirthDataMock).toHaveBeenCalledWith(
      'Ich wurde am 12. Mai 1988 in Medellin in Kolumbien geboren und erinnere mich an eine große Familie.',
    );
    expect(extractProfileDataMock).toHaveBeenCalledWith(
      'Meine Großmutter Alicia hat mich inspiriert, weil sie ruhig, klug und standhaft war.',
      'influences',
    );
    expect(state.userUpdates).toEqual([
      {
        birth_date: '1988-05-12',
        birth_place: 'Medellin, Kolumbien',
      },
    ]);
    expect(state.profileUpserts).toHaveLength(1);
    expect(state.profileUpserts[0]?.user_id).toBe('user-1');
  });

  it('still syncs the current mapped answer when profile data already exists', async () => {
    extractProfileDataMock.mockResolvedValue({
      values: ['Zusammenhalt', 'Bildung', 'Verlässlichkeit'],
      motto: 'Zuhören vor urteilen.',
    });

    const { serviceClient, state } = createServiceClientState({
      userRow: { birth_date: '1988-05-12', birth_place: 'Medellin' },
      profileRow: { influences: [{ name: 'Alicia', type: 'mentor' }] },
    });
    const { syncBiographyInterviewProfileData } = await import('./profile-sync');

    await syncBiographyInterviewProfileData({
      serviceClient: serviceClient as never,
      userId: 'user-2',
      currentQuestionId: 'values.guiding_values',
      currentAnswerText:
        'Meine wichtigsten Werte sind Zusammenhalt, Bildung und Verlässlichkeit. Mein Leitgedanke ist, erst zuzuhören.',
      progressRows: [],
    });

    expect(state.userUpdates).toHaveLength(0);
    expect(extractProfileDataMock).toHaveBeenCalledWith(
      'Meine wichtigsten Werte sind Zusammenhalt, Bildung und Verlässlichkeit. Mein Leitgedanke ist, erst zuzuhören.',
      'values',
    );
    expect(state.profileUpserts).toHaveLength(1);
  });
});
