export type XrplIntelSourceType =
  | "official"
  | "technical"
  | "institutional"
  | "media"
  | "fallback";

export type XrplIntelItem = {
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  source: string;
  sourceType: XrplIntelSourceType | string;
  category: string;
  bucket: string;
  tags: string[];
  signalType: string;
  officialSource: boolean;
  needsConfirmation: boolean;
  confidenceScore: number;
  whyItMatters: string;
  description: string;
};

export type XrplIntelSource = {
  name: string;
  category: string;
  sourceType: XrplIntelSourceType | string;
  homeUrl: string;
};

export type XrplIntelBrief = {
  title: string;
  generatedAt: string;
  topBuckets: Array<{
    bucket: string;
    count: number;
  }>;
  summary: string;
  legalNote: string;
};

export type XrplIntelResponse = {
  success: boolean;
  mode: "xrpl-intelligence" | string;
  generatedAt: string;
  count: number;
  fallback: boolean;
  sourceTag: number;
  sources?: XrplIntelSource[];
  buckets?: string[];
  brief?: XrplIntelBrief;
  debug?: Array<{
    source: string;
    sourceType?: string;
    category?: string;
    count: number;
    error?: string;
  }>;
  items: XrplIntelItem[];
  error?: string;
};

export type FetchXrplIntelOptions = {
  limit?: number;
  signal?: AbortSignal;
};

const DEFAULT_INTEL_LIMIT = 36;

export async function fetchXrplIntelligence(
  options: FetchXrplIntelOptions = {},
): Promise<XrplIntelResponse> {
  const limit = sanitizeLimit(options.limit);
  const response = await fetch(`/api/news?limit=${limit}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: options.signal,
  });

  const data = (await response.json()) as Partial<XrplIntelResponse>;

  if (!response.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "XRPL Intelligence API request failed.",
    );
  }

  if (!data.success || !Array.isArray(data.items)) {
    throw new Error("XRPL Intelligence API returned an invalid response.");
  }

  return {
    success: Boolean(data.success),
    mode: data.mode ?? "xrpl-intelligence",
    generatedAt: data.generatedAt ?? new Date().toISOString(),
    count: Number(data.count ?? data.items.length),
    fallback: Boolean(data.fallback),
    sourceTag: Number(data.sourceTag ?? 2606170002),
    sources: Array.isArray(data.sources) ? data.sources : [],
    buckets: Array.isArray(data.buckets) ? data.buckets : [],
    brief: data.brief,
    debug: Array.isArray(data.debug) ? data.debug : [],
    items: data.items.map(normalizeIntelItem),
    error: data.error,
  };
}

export function getIntelBucketItems(items: XrplIntelItem[], bucket: string) {
  if (bucket === "All") {
    return items;
  }

  return items.filter((item) => item.bucket === bucket || item.category === bucket);
}

export function getIntelBuckets(items: XrplIntelItem[]) {
  const buckets = new Map<string, number>();

  for (const item of items) {
    const bucket = item.bucket || item.category || "XRPL Intelligence";
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return [
    {
      bucket: "All",
      count: items.length,
    },
    ...Array.from(buckets.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([bucket, count]) => ({
        bucket,
        count,
      })),
  ];
}

export function formatIntelDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getSourceTypeLabel(sourceType: string) {
  if (sourceType === "official") {
    return "Official";
  }

  if (sourceType === "technical") {
    return "Technical";
  }

  if (sourceType === "institutional") {
    return "Institutional";
  }

  if (sourceType === "media") {
    return "Media";
  }

  if (sourceType === "fallback") {
    return "Fallback";
  }

  return sourceType || "Source";
}

export function getConfidenceLabel(score: number) {
  if (score >= 90) {
    return "High";
  }

  if (score >= 75) {
    return "Strong";
  }

  if (score >= 60) {
    return "Medium";
  }

  return "Needs review";
}

function sanitizeLimit(value: number | undefined) {
  if (!Number.isFinite(value ?? NaN)) {
    return DEFAULT_INTEL_LIMIT;
  }

  return Math.min(80, Math.max(1, Math.round(value ?? DEFAULT_INTEL_LIMIT)));
}

function normalizeIntelItem(item: Partial<XrplIntelItem>): XrplIntelItem {
  return {
    title: String(item.title ?? "Untitled intelligence item"),
    link: String(item.link ?? "#"),
    pubDate: String(item.pubDate ?? new Date().toISOString()),
    author: item.author ? String(item.author) : undefined,
    source: String(item.source ?? "Unknown source"),
    sourceType: String(item.sourceType ?? "media"),
    category: String(item.category ?? "XRPL Intelligence"),
    bucket: String(item.bucket ?? item.category ?? "XRPL Intelligence"),
    tags: Array.isArray(item.tags) ? item.tags.map(String).slice(0, 12) : [],
    signalType: String(item.signalType ?? "ecosystem-signal"),
    officialSource: Boolean(item.officialSource),
    needsConfirmation: Boolean(item.needsConfirmation),
    confidenceScore: Number(item.confidenceScore ?? 50),
    whyItMatters: String(
      item.whyItMatters ??
        "Relevant for XRPL intelligence. Review the source before publishing.",
    ),
    description: String(item.description ?? ""),
  };
}
