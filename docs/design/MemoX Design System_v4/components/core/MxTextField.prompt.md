MxTextField — inline text input. Base class `field`. Bare by default (just the token-styled input, for editor fields / game answers / paste boxes); pass `label`, `helper` or `error` to get a full labelled field group with an accessible name, description and validation state.

```jsx
// Bare (single-line):
<MxTextField value={term} onChange={setTerm} placeholder="Enter a term" node="editor/term" />

// Labelled + validated:
<MxTextField
  label="Email"
  type="email"
  inputMode="email"
  required
  value={email}
  onChange={setEmail}
  error={emailError}          // sets aria-invalid + role="alert"; hides helper
  helper="We never share it." // shown when there is no error
  node="account/email"
/>

// Multi-line:
<MxTextField multiline rows={2} placeholder="Enter the meaning" node="editor/meaning" />
```

Accessibility: with a `label` the input is wired via `htmlFor`/`id`; without one it takes `ariaLabel` (falling back to `placeholder`). `required` sets `aria-required` and a visual `*`; `error` sets `aria-invalid` and announces via `role="alert"`. Use `type` for the input kind and `inputMode` for the on-screen keyboard. Never hard-code colors — the error/disabled states are token-driven modifiers (`field--error`, `field--disabled`).
