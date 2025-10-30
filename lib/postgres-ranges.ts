export function parsePgTstzRange(range: string | null): { start: string; end: string } | null {
  if (!range) return null;
  const match = range.match(/^[\[(](.*?),(.*?)[\])]$/);
  if (!match) return null;
  const [, startRaw, endRaw] = match;
  const normalize = (value: string) => (value === '' ? '' : value.replace(' ', 'T'));
  return {
    start: normalize(startRaw),
    end: normalize(endRaw)
  };
}
