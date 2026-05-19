// Parses a streaming token sequence containing <<<S:N>>> segment markers.
// Buffers tokens, detects markers without emitting their bytes to the DOM, and
// fires callbacks as each segment activates and finalizes.
export class ChunkStreamParser {
  private buf = '';
  private activeSeg = -1;
  private static readonly MARKER_RE = /<<<S:(\d+)>>>\n?/g;
  private static readonly MARKER_PREFIX = '<<<';

  constructor(
    private readonly onActivate: (localIdx: number) => void,
    private readonly onText: (localIdx: number, text: string) => void,
    private readonly onFinalize: (localIdx: number) => void
  ) {}

  feed(token: string): void {
    this.buf += token;
    this.flush();
  }

  finish(): void {
    if (this.buf && this.activeSeg >= 0) {
      this.onText(this.activeSeg, this.buf);
    }
    this.buf = '';
    if (this.activeSeg >= 0) {
      this.onFinalize(this.activeSeg);
      this.activeSeg = -1;
    }
  }

  private flush(): void {
    const re = ChunkStreamParser.MARKER_RE;
    re.lastIndex = 0;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = re.exec(this.buf)) !== null) {
      const before = this.buf.slice(lastIdx, match.index);
      if (before && this.activeSeg >= 0) {
        this.onText(this.activeSeg, before);
      }
      if (this.activeSeg >= 0) {
        this.onFinalize(this.activeSeg);
      }
      const newIdx = parseInt(match[1] ?? '0', 10);
      this.onActivate(newIdx);
      this.activeSeg = newIdx;
      lastIdx = match.index + match[0].length;
    }

    const remaining = this.buf.slice(lastIdx);

    // Hold back any trailing bytes that could be the start of a marker,
    // to avoid briefly showing <<<S: in the DOM before the marker is complete.
    const prefixIdx = remaining.lastIndexOf(ChunkStreamParser.MARKER_PREFIX);
    if (prefixIdx > 0) {
      const safe = remaining.slice(0, prefixIdx);
      if (safe && this.activeSeg >= 0) this.onText(this.activeSeg, safe);
      this.buf = remaining.slice(prefixIdx);
    } else if (prefixIdx === 0) {
      this.buf = remaining;
    } else {
      if (remaining && this.activeSeg >= 0) this.onText(this.activeSeg, remaining);
      this.buf = '';
    }
  }
}
