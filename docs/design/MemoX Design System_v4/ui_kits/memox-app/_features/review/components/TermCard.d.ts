export interface TermCardProps {
  /**
   * Playback state. `idle` (base) shows the volume icon; `audio` switches to an
   * equalizer glyph + a "Playing…" line. Flutter models this as a `bool playing`.
   */
  state?: 'idle' | 'audio';
}

/**
 * Review term card with an audio control. The kit hardcodes the sample term (학교)
 * as a fixture and stubs the audio button with a node id; the Flutter `TermCard`
 * parameterizes the content (`term`), represents `state` as a `bool playing`, and
 * wires the real `onAudio` callback — recorded as exceptions.
 */
export function TermCard(props: TermCardProps): JSX.Element;
