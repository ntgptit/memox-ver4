/**
 * Language-pair use cases (WBS 3.1). Pure orchestration over the repository port;
 * each returns a {@link Result}. Factory functions inject the port + services so the
 * domain stays testable with fakes (no real DB/clock).
 */

import { type UseCase, type IdGenerator, type Clock } from '@/shared';
import { makeLanguagePair, type LanguagePair } from './language-pair';
import type { LanguagePairRepository } from './ports';

export interface AddLanguagePairInput {
  learning: string;
  native: string;
}

export interface LanguageUseCaseDeps {
  repo: LanguagePairRepository;
  ids: IdGenerator;
  clock: Clock;
}

/** Create + persist a language pair. Validation failures short-circuit before the write. */
export function addLanguagePair(deps: LanguageUseCaseDeps): UseCase<AddLanguagePairInput, LanguagePair> {
  return {
    async execute(input) {
      const built = makeLanguagePair({
        id: deps.ids(),
        learning: input.learning,
        native: input.native,
        createdAt: deps.clock(),
      });
      // Persist only when construction succeeded; a validation failure short-circuits.
      return built.ok ? deps.repo.save(built.value) : built;
    },
  };
}

/** Remove a language pair by id. */
export function removeLanguagePair(deps: Pick<LanguageUseCaseDeps, 'repo'>): UseCase<string, void> {
  return {
    execute(id) {
      return deps.repo.remove(id);
    },
  };
}
