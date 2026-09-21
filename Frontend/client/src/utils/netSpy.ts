// Instrument TEMPORAIRE (diagnostic) : journalise toute valeur de header
// non-latin1 qui traverse fetch/Headers/Request, + toute écriture d'une
// session corrompue en stockage (avec stack = le coupable).
// Comportement strictement préservé : on délègue tout, on ne masque rien.

function findBadChar(value: string): string | null {
  for (const c of value) {
    if (c.charCodeAt(0) > 255) return c;
  }
  return null;
}

function describeHeaders(source: string, headers: unknown) {
  try {
    let entries: Iterable<[string, string]> = [];
    if (headers instanceof Headers) {
      entries = [...(headers as any)] as [string, string][];
    } else if (Array.isArray(headers)) {
      entries = headers as [string, string][];
    } else if (headers && typeof headers === 'object') {
      entries = Object.entries(headers) as [string, string][];
    } else {
      return;
    }
    for (const [k, v] of entries) {
      const bad = findBadChar(String(v)) || findBadChar(String(k));
      if (bad) {
        console.warn(
          `[IPP-DIAG] header corrompu via ${source} :`,
          String(k),
          '| U+' + bad.charCodeAt(0).toString(16),
          '| debut valeur:',
          String(v).slice(0, 120)
        );
      }
    }
  } catch {
    // jamais bloquer l'envoi réel
  }
}

function isSessionKey(key: string): boolean {
  return key === 'supabase.auth.token' || (key.startsWith('sb-') && key.includes('auth-token'));
}

export function installNetworkSpy() {
  try {
    if ((window.fetch as any).__ippDiag) return; // déjà installé
    const NativeFetch = window.fetch.bind(window);
    const NativeHeaders = window.Headers;
    const NativeRequest = window.Request;

    const spyFetch = function (input: any, init?: any) {
      if (init && init.headers) describeHeaders('fetch', init.headers);
      return NativeFetch(input, init);
    };
    (spyFetch as any).__ippDiag = true;
    window.fetch = spyFetch as typeof fetch;

    const SpyHeaders = function (this: any, init?: any) {
      if (init) describeHeaders('Headers()', init);
      return new NativeHeaders(init);
    } as any;
    SpyHeaders.__ippDiag = true;
    Object.setPrototypeOf(SpyHeaders, NativeHeaders);
    SpyHeaders.prototype = NativeHeaders.prototype;
    window.Headers = SpyHeaders;

    const SpyRequest = function (this: any, input: any, init?: any) {
      if (init && init.headers) describeHeaders('Request()', init.headers);
      return new NativeRequest(input, init);
    } as any;
    SpyRequest.__ippDiag = true;
    Object.setPrototypeOf(SpyRequest, NativeRequest);
    SpyRequest.prototype = NativeRequest.prototype;
    window.Request = SpyRequest as any;

    const proto = NativeHeaders.prototype as any;
    const origSet = proto.set;
    const origAppend = proto.append;
    proto.set = function (n: string, v: string) {
      const bad = findBadChar(String(v)) || findBadChar(String(n));
      if (bad) {
        console.warn(
          '[IPP-DIAG] Headers.set corrompu :',
          String(n),
          '| U+' + bad.charCodeAt(0).toString(16),
          '| debut valeur:',
          String(v).slice(0, 120)
        );
      }
      return origSet.call(this, n, v);
    };
    proto.append = function (n: string, v: string) {
      const bad = findBadChar(String(v)) || findBadChar(String(n));
      if (bad) {
        console.warn(
          '[IPP-DIAG] Headers.append corrompu :',
          String(n),
          '| U+' + bad.charCodeAt(0).toString(16),
          '| debut valeur:',
          String(v).slice(0, 120)
        );
      }
      return origAppend.call(this, n, v);
    };

    const storageProto = Object.getPrototypeOf(localStorage) as any;
    const origSetItem = storageProto.setItem;
    storageProto.setItem = function (k: string, v: string) {
      try {
        if (isSessionKey(String(k))) {
          const bad = findBadChar(String(v));
          if (bad) {
            console.warn(
              '[IPP-DIAG] écriture session corrompue :',
              String(k),
              '| U+' + bad.charCodeAt(0).toString(16),
              '| debut valeur:',
              String(v).slice(0, 120)
            );
            console.warn('[IPP-DIAG] stack écrivain :', new Error('trace').stack);
          }
        }
      } catch {
        // jamais bloquer l'écriture réelle
      }
      return origSetItem.call(this, k, v);
    };
  } catch {
    // environnement non-standard : on ignore
  }
}
