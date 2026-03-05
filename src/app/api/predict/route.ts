import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PREDICTION_API_URL =
  "https://fast-api-prediction-production.up.railway.app/api/v1/predict";

const PREDICTION_API_URL =
  process.env.FASTAPI_PREDICT_URL ??
  process.env.PREDICTION_API_URL ??
  DEFAULT_PREDICTION_API_URL;

const UPSTREAM_TIMEOUT_MS = 15_000;

function buildUpstreamHeaders(request: NextRequest) {
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  headers.set("content-type", contentType ?? "application/json");

  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  request.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("x-")) headers.set(key, value);
  });

  return headers;
}

function buildDownstreamHeaders(upstreamHeaders: Headers) {
  const headers = new Headers();

  upstreamHeaders.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower === "connection" ||
      lower === "keep-alive" ||
      lower === "proxy-authenticate" ||
      lower === "proxy-authorization" ||
      lower === "te" ||
      lower === "trailer" ||
      lower === "transfer-encoding" ||
      lower === "upgrade" ||
      lower === "content-length" ||
      lower === "content-encoding"
    ) {
      return;
    }
    headers.set(key, value);
  });

  return headers;
}

function normalizeSpecies(value: unknown) {
  if (typeof value !== "string") {
    return { ok: false as const, error: "species must be a string" };
  }

  const map: Record<string, "Tilapia" | "Bangus"> = {
    "Red Tilapia": "Tilapia",
    Tilapia: "Tilapia",
    Bangus: "Bangus",
    tilapia: "Tilapia",
    bangus: "Bangus",
  };

  const normalized = map[value];
  if (!normalized) {
    return {
      ok: false as const,
      error: 'Invalid species. Must be "Tilapia" or "Bangus".',
    };
  }

  return { ok: true as const, value: normalized };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const requiredKeys = [
      "species",
      "dateFrom",
      "dateTo",
      "province",
      "city",
      "barangay",
    ] as const;
    for (const key of requiredKeys) {
      if (!(key in parsedBody)) {
        return NextResponse.json(
          { error: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
    }

    const originalSpecies = (parsedBody as Record<string, unknown>).species;
    const normalizedSpecies = normalizeSpecies(originalSpecies);
    if (!normalizedSpecies.ok) {
      return NextResponse.json({ error: normalizedSpecies.error }, { status: 400 });
    }

    const upstreamBody = JSON.stringify({
      ...(parsedBody as Record<string, unknown>),
      species: normalizedSpecies.value,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    let upstreamResponse: Response;
    try {
      const requestId =
        request.headers.get("x-request-id") ??
        request.headers.get("x-correlation-id") ??
        undefined;
      console.info(
        JSON.stringify({
          msg: "proxy_predict_request",
          upstream: PREDICTION_API_URL,
          requestId,
          species: normalizedSpecies.value,
        })
      );

      upstreamResponse = await fetch(PREDICTION_API_URL, {
        method: "POST",
        headers: buildUpstreamHeaders(request),
        body: upstreamBody,
        signal: controller.signal,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { error: "Failed to reach ML service", details: message },
        { status: 502 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: buildDownstreamHeaders(upstreamResponse.headers),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Unexpected error in predict proxy", details: message },
      { status: 500 }
    );
  }
}
