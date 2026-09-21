// Détecte si une extension (ou autre script tiers) a enveloppé les
// primitives réseau du navigateur. Un fetch/Headers non natif peut
// corrompre les requêtes (ex. header non-latin1 →
// "String contains non ISO-8859-1 code point") sans que notre code
// y soit pour quoi que ce soit.
export function detectFetchTampering(): string[] {
  const offenders: string[] = [];
  const check = (name: string, value: unknown) => {
    try {
      const src = Function.prototype.toString.call(value);
      if (!src.includes('[native code]')) offenders.push(name);
    } catch {
      offenders.push(`${name}?`);
    }
  };
  try {
    check('fetch', window.fetch);
    check('Headers', window.Headers);
    check('Request', window.Request);
  } catch {
    // environnement sans window (SSR/tests) : rien à signaler
  }
  return offenders;
}
