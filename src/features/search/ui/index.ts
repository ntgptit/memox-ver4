/**
 * Search UI (WBS 4.6) — the search screen: a prop-driven presentational component,
 * its debounced controller, the production container, and the state fixtures.
 */

export { SearchScreen, type SearchScreenProps } from './search-screen';
export { SearchContainer } from './search-container';
export { useSearch, type SearchDeps, type SearchController } from './use-search';
export {
  SEARCH_FIXTURES,
  SEARCH_FILTERS,
  type SearchFixtureKey,
  type SearchFilter,
  type SearchPhase,
  type SearchView,
} from './search-fixtures';
