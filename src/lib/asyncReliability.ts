export async function withTimeout<T>(promise: PromiseLike<T>, milliseconds: number, message = "The service took too long to respond."): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
}

export async function boundedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const parent = init?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
  const abort = () => controller.abort(parent?.reason);
  if (parent?.aborted) abort();
  else parent?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(new Error("The account service took too long to respond.")), 10000);
  try {
    const response = await fetch(input, { ...init, signal: controller.signal });
    // Include body transfer in the deadline; Supabase parses JSON after fetch returns.
    const bytes = await response.arrayBuffer();
    return new Response([101, 204, 205, 304].includes(response.status) ? null : bytes, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  } finally { clearTimeout(timer); parent?.removeEventListener("abort", abort); }
}

// New auth events take precedence over the initial asynchronous session read.
export function observeSession<T>(options: {
  initial: () => Promise<T | null>;
  subscribe: (listener: (value: T | null) => void) => () => void;
  apply: (value: T | null) => void;
  hydrate?: (value: T, stillCurrent: () => boolean) => Promise<unknown>;
  timeoutMs?: number;
}) {
  let active = true;
  let revision = 0;
  let deferred: ReturnType<typeof setTimeout> | undefined;
  const apply = (value: T | null) => {
    if (!active) return;
    const current = ++revision;
    clearTimeout(deferred);
    options.apply(value);
    if (value && options.hydrate) deferred = setTimeout(() => {
      if (active && revision === current) void options.hydrate!(value, () => active && revision === current).catch(() => undefined);
    }, 0);
  };
  const unsubscribe = options.subscribe(apply);
  const initialRevision = revision;
  // A subscription can deliver INITIAL_SESSION synchronously.
  if (initialRevision === 0) void withTimeout(options.initial(), options.timeoutMs ?? 8000)
    .then(value => { if (revision === initialRevision) apply(value); })
    .catch(() => { if (revision === initialRevision) apply(null); });
  return () => { active = false; revision++; clearTimeout(deferred); unsubscribe(); };
}

export function runNativeAction(action: () => unknown, timeoutMs = 8000) {
  return withTimeout(Promise.resolve().then(action), timeoutMs, "Xaman did not complete the action in time.");
}
