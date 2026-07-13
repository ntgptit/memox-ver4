/**
 * Languages UI (WBS 3.3) — the language-pairs screen: a prop-driven presentational
 * component, its controller hook, the production container, and the view-model +
 * state-matrix fixtures shared by the tests and the visual golden.
 */

export { LanguagesScreen, type LanguagesScreenProps } from './languages-screen';
export { LanguagesContainer } from './languages-container';
export { useLanguages, type LanguagesDeps, type LanguagesController } from './use-languages';
export {
  type LanguagesData,
  type LanguagePairView,
  type LanguagesFixtureKey,
  LANGUAGES_FIXTURES,
  pairTitle,
  pairSubtitle,
} from './fixtures';
