MxLink — a text / navigation link button (accent colour, no filled or block chrome). Use for "go somewhere" affordances, not primary actions.

```jsx
<MxLink node="dashboard/see-all-decks">See all decks</MxLink>
<MxLink icon="open_in_new" trailingIcon={null} href="/help" node="settings/help">Learn more</MxLink>
```

- Renders a `<button>` by default; pass `href` for an `<a>`.
- Trailing `chevron_right` by default (the "more" affordance); pass `trailingIcon={null}` to omit.
- Prefer over `MxButton variant="ghost" block` for see-all / inline navigation — a link shouldn't look like a full-width button.
- Tap target is ≥48px even though the text is visually compact.
