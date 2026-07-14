/**
 * Study-result container (WBS 7.4) — resolves the session repositories, wires
 * the transactional finalize use case into {@link useStudyResult}, and forwards
 * the exit intents.
 */

import { useEffect, useState } from 'react';

import { isErr } from '@/shared';
import { systemClock } from '@/shared/runtime';
import { createSessionRepositories } from '@/features/session/data';

import { finalizeSessionUseCase } from '../domain';
import { StudyResultScreen, type StudyResultScreenProps } from './study-result-screen';
import { useStudyResult, dayKey, type StudyResultDeps } from './use-study-result';

export type StudyResultContainerProps = Omit<StudyResultScreenProps, 'data' | 'onRetryFinalize'> & {
  sessionId: string;
};

export function StudyResultContainer({ sessionId, ...props }: StudyResultContainerProps) {
  const [deps, setDeps] = useState<StudyResultDeps | null>(null);

  useEffect(() => {
    let alive = true;
    void createSessionRepositories().then((session) => {
      if (!alive) return;
      const finalize = finalizeSessionUseCase({ sessions: session.sessions, clock: systemClock });
      const todaySessions = async () => {
        const r = await session.sessions.list();
        const today = dayKey(systemClock());
        return isErr(r) ? [] : r.value.filter((s) => dayKey(s.startedAt) === today);
      };
      setDeps({
        finalize: async (id) => {
          try {
            return !isErr(await finalize.execute(id));
          } catch {
            return false;
          }
        },
        getSession: async (id) => {
          const r = await session.sessions.getById(id);
          return isErr(r) ? null : r.value;
        },
        attemptsBySession: async (id) => {
          const r = await session.attempts.listBySession(id);
          return isErr(r) ? [] : r.value;
        },
        minutesToday: async () => {
          let minutes = 0;
          for (const s of await todaySessions()) {
            const a = await session.attempts.listBySession(s.id);
            const attempts = isErr(a) ? [] : a.value;
            const last = attempts.length > 0 ? attempts[attempts.length - 1].answeredAt : s.startedAt;
            const end = s.finalizedAt ?? last;
            minutes += Math.max(0, Math.round((end - s.startedAt) / 60_000));
          }
          return minutes;
        },
        activeDayKeys: async () => {
          const r = await session.sessions.list();
          const days = new Set<string>();
          for (const s of isErr(r) ? [] : r.value) {
            const a = await session.attempts.listBySession(s.id);
            for (const at of isErr(a) ? [] : a.value) days.add(dayKey(at.answeredAt));
          }
          return days;
        },
        now: systemClock,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  if (deps === null) {
    return <StudyResultScreen data={{ status: 'finalizing', retry: false }} {...props} />;
  }
  return <LoadedResult sessionId={sessionId} deps={deps} {...props} />;
}

function LoadedResult({
  sessionId,
  deps,
  ...props
}: Omit<StudyResultContainerProps, 'sessionId'> & { sessionId: string; deps: StudyResultDeps }) {
  const controller = useStudyResult(sessionId, deps);
  return <StudyResultScreen data={controller.data} onRetryFinalize={controller.retryFinalize} {...props} />;
}
