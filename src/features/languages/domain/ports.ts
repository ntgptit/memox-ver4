/**
 * Ports the languages domain depends on (WBS 3.1). Implemented by the data layer
 * (WBS 3.2) over `expo-sqlite`; the domain knows only these interfaces.
 */

import type { Repository, Observable } from '@/shared';
import type { LanguagePair } from './language-pair';

/** Persistence + reactivity for language pairs. */
export interface LanguagePairRepository extends Repository<LanguagePair>, Observable {}
