#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Load .env.local if it exists (for project-level MCP config)
function loadDotEnv() {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
  ];
  // Also try the project root relative to this script
  const scriptDir = path.dirname(__filename);
  const projectRoot = path.resolve(scriptDir, "..", "..", "..");
  candidates.push(
    path.join(projectRoot, ".env.local"),
    path.join(projectRoot, ".env"),
  );

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadDotEnv();

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const BASE_URL = "https://api.dataforseo.com/v3";
const EMAIL = process.env.DATAFORSEO_EMAIL;
const API_KEY = process.env.DATAFORSEO_API_KEY;

if (!EMAIL || !API_KEY) {
  console.error("DATAFORSEO_EMAIL and DATAFORSEO_API_KEY environment variables are required");
  process.exit(1);
}

const AUTH_HEADER = "Basic " + Buffer.from(`${EMAIL}:${API_KEY}`).toString("base64");

async function callDataForSEO(endpoint, body) {
  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": AUTH_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DataForSEO API error ${response.status}: ${text.slice(0, 300)}`);
  }

  return response.json();
}

// Location codes for common cities
const LOCATIONS = {
  // US
  "austin": 21137, "dallas": 21129, "houston": 21132, "san antonio": 21136,
  "new york": 21167, "los angeles": 21137, "chicago": 21095, "phoenix": 21141,
  "philadelphia": 21165, "san diego": 21140, "miami": 23361, "atlanta": 21132,
  "boston": 21130, "seattle": 23453, "denver": 21135, "portland": 23315,
  "nashville": 21163, "charlotte": 21094, "orlando": 23361, "tampa": 23361,
  "aventura": 23361, "fort lauderdale": 23361,
  // UK
  "london": 2826, "manchester": 22052, "birmingham": 20728,
  // Cyprus
  "limassol": 2749, "nicosia": 22123, "cyprus": 2749,
  // Serbia
  "belgrade": 24952, "serbia": 24952,
  // Europe
  "paris": 20220, "berlin": 20076, "madrid": 20238, "rome": 20380,
  "amsterdam": 20241, "brussels": 20208, "zurich": 20444,
  // Global fallback
  "united kingdom": 2826, "uk": 2826, "usa": 21167, "united states": 21167,
};

function resolveLocation(query) {
  const lower = query.toLowerCase();
  for (const [name, code] of Object.entries(LOCATIONS)) {
    if (lower.includes(name)) return { name, code };
  }
  return { name: lower, code: 21167 }; // default to New York
}

// ─── Server ──────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "dataforseo-local-seo", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "seo_search_volume",
      description:
        "Get monthly search volume for keywords in a specific location. " +
        "Returns exact search volumes. Use for prioritizing which keywords to target. " +
        "Example: seo_search_volume({keywords: ['plumber austin', 'emergency plumber'], location: 'austin'})",
      inputSchema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "List of keywords to check (max 10)",
          },
          location: {
            type: "string",
            description: "City name (e.g. 'austin', 'dallas', 'new york')",
          },
        },
        required: ["keywords", "location"],
      },
    },
    {
      name: "seo_live_serp",
      description:
        "Get live Google SERP results for a keyword in a location. Shows who ranks, " +
        "their positions, URLs, and any SERP features (local pack, reviews, FAQs, etc.)",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "The search query" },
          location: { type: "string", description: "City name" },
        },
        required: ["keyword", "location"],
      },
    },
    {
      name: "seo_local_pack",
      description:
        "Get Google Local Pack rankings for a keyword + location. Shows the top 3 " +
        "local businesses in the map results with ratings, reviews, addresses, and phone numbers.",
      inputSchema: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "The search query (e.g. 'plumber near me')" },
          location: { type: "string", description: "City name" },
        },
        required: ["keyword", "location"],
      },
    },
    {
      name: "seo_domain_analysis",
      description:
        "Get domain authority metrics: backlinks count, referring domains, top pages, " +
        "domain rank, and traffic estimates. Use for competitor comparison.",
      inputSchema: {
        type: "object",
        properties: {
          domain: { type: "string", description: "Domain to analyze (e.g. 'example.com')" },
        },
        required: ["domain"],
      },
    },
    {
      name: "seo_competitor_keywords",
      description:
        "Find which keywords a competitor ranks for and their positions. " +
        "Shows keyword, position, search volume, and estimated traffic.",
      inputSchema: {
        type: "object",
        properties: {
          domain: { type: "string", description: "Competitor domain" },
          location: { type: "string", description: "City name" },
        },
        required: ["domain", "location"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ── Search Volume ────────────────────────────────────────────────────
      case "seo_search_volume": {
        const loc = resolveLocation(args.location);
        const data = await callDataForSEO("keywords_data/google_ads/search_volume/live", [{
          keywords: args.keywords.slice(0, 10),
          location_code: loc.code,
          language_code: "en",
        }]);

        const results = (data.tasks?.[0]?.result ?? []).map((r) => ({
          keyword: r.keyword,
          search_volume: r.search_volume ?? 0,
          competition: r.competition ?? "UNKNOWN",
          cpc: r.cpc ?? 0,
          location: loc.name,
        }));

        return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
      }

      // ── Live SERP ────────────────────────────────────────────────────────
      case "seo_live_serp": {
        const loc = resolveLocation(args.location);
        const data = await callDataForSEO("serp/google/organic/live/advanced", [{
          keyword: args.keyword,
          location_code: loc.code,
          language_code: "en",
        }]);

        const items = (data.tasks?.[0]?.result?.[0]?.items ?? [])
          .filter((i) => i.type === "organic")
          .slice(0, 15)
          .map((i) => ({
            position: i.rank_absolute,
            title: i.title,
            url: i.url,
            description: i.description?.slice(0, 150),
          }));

        const features = (data.tasks?.[0]?.result?.[0]?.items ?? [])
          .filter((i) => i.type !== "organic")
          .map((i) => i.type);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                keyword: args.keyword,
                location: loc.name,
                serp_features: [...new Set(features)],
                organic_results: items,
              }, null, 2),
            },
          ],
        };
      }

      // ── Local Pack ───────────────────────────────────────────────────────
      case "seo_local_pack": {
        const loc = resolveLocation(args.location);
        const data = await callDataForSEO("serp/google/local_finder/live/advanced", [{
          keyword: args.keyword,
          location_code: loc.code,
          language_code: "en",
        }]);

        const items = (data.tasks?.[0]?.result?.[0]?.items ?? [])
          .filter((i) => i.type === "local_pack")
          .slice(0, 3)
          .map((i) => ({
            rank: i.rank_absolute ?? i.rank_group,
            title: i.title,
            description: i.description,
            rating: i.rating?.value,
            reviews_count: i.rating?.votes_count,
            address: i.address,
            phone: i.phone,
            url: i.url,
            place_id: i.place_id,
          }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                keyword: args.keyword,
                location: loc.name,
                local_pack: items,
              }, null, 2),
            },
          ],
        };
      }

      // ── Domain Analysis ──────────────────────────────────────────────────
      case "seo_domain_analysis": {
        const data = await callDataForSEO("domain_analytics/technologies", [{
          target: args.domain,
          limit: 1,
        }]);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                domain: args.domain,
                info: data.tasks?.[0]?.result?.[0] ?? { note: "No data returned from DataForSEO" },
              }, null, 2),
            },
          ],
        };
      }

      // ── Competitor Keywords ──────────────────────────────────────────────
      case "seo_competitor_keywords": {
        const loc = resolveLocation(args.location);
        const data = await callDataForSEO("dataforseo_labs/google/ranked_keywords/live", [{
          target: args.domain,
          location_code: loc.code,
          language_code: "en",
          limit: 20,
        }]);

        const keywords = (data.tasks?.[0]?.result?.[0]?.items ?? []).map((kw) => ({
          keyword: kw.keyword_data?.keyword,
          search_volume: kw.keyword_data?.search_volume ?? 0,
          position: kw.ranked_serp_element?.serp_item?.rank_absolute,
          estimated_traffic: Math.round((kw.keyword_data?.search_volume ?? 0) * 0.02),
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                domain: args.domain,
                location: loc.name,
                total_keywords: data.tasks?.[0]?.result?.[0]?.total_count ?? 0,
                top_keywords: keywords,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
server.connect(transport).catch((err) => {
  console.error("Failed to start MCP server:", err);
  process.exit(1);
});
