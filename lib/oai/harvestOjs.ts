import { XMLParser } from "fast-xml-parser";
import type { Article } from "@/lib/mockArticles";
import { slugify } from "@/lib/mockArticles";

type OaiOptions = {
  endpoint?: string;
  metadataPrefix?: string;
  limit?: number;
};

export const toFlatStrings = (val: unknown): string[] => {
  if (val == null) return [];
  if (Array.isArray(val)) return val.flatMap(toFlatStrings);
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    if (typeof obj["#text"] === "string") return [obj["#text"] as string];
    return Object.values(obj).flatMap(toFlatStrings);
  }
  return [String(val)];
};

export const firstString = (val: unknown): string => toFlatStrings(val)[0] ?? "";

const DEFAULT_ENDPOINT = "https://mijournals.com/index.php/Human_Studies/oai";

// Helper function to process a single OAI record into an Article
function processRecord(rec: unknown, endpoint: string): Article | null {
  if (!rec || typeof rec !== "object") return null;
  const recObj = rec as Record<string, unknown>;
  const md = recObj?.metadata as Record<string, unknown> | undefined;
  const dc = md?.["oai_dc:dc"] as Record<string, unknown> | undefined;
  if (!dc) return null;

  const titles = toFlatStrings(dc["dc:title"]);
  const creators = toFlatStrings(dc["dc:creator"]);
  const descs = toFlatStrings(dc["dc:description"]);
  const dates = toFlatStrings(dc["dc:date"]);
  const identifiers = toFlatStrings(dc["dc:identifier"]);
  const subjects = toFlatStrings(dc["dc:subject"]);

  const title = titles[0] || "Nomsiz maqola";
  const yearMatch = (dates[0] || "").match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  const articleViewUrl = identifiers.find((i) => i.includes("/article/view/"));
  const pdfIdentifier =
    identifiers.find((i) => i.toLowerCase().endsWith(".pdf")) ??
    identifiers.find((i) => i.toLowerCase().includes(".pdf"));

  let pdfUrl = "";
  if (pdfIdentifier && pdfIdentifier.startsWith("http")) {
    pdfUrl = pdfIdentifier;
  } else if (articleViewUrl && articleViewUrl.startsWith("http")) {
    const match = articleViewUrl.match(/\/article\/view\/(\d+)/);
    if (match) {
      const articleId = match[1];
      const baseUrl = articleViewUrl.split("/article/view/")[0];
      pdfUrl = `${baseUrl}/article/view/${articleId}/${articleId}/0`;
    } else {
      pdfUrl = articleViewUrl;
    }
  }

  const journalName = endpoint.includes("Human_Studies")
    ? "Human Studies"
    : endpoint.includes("biocontrol")
    ? "Biocontrol & Biotech"
    : "OJS Journal";

  // Generate stable slug ONCE during harvest
  const articleSlug = slugify(title);
  
  // Safety check: ensure slug is not empty
  if (!articleSlug) {
    console.warn(`[Harvest] Skipping article with empty slug: "${title.substring(0, 50)}..."`);
    return null;
  }

  return {
    slug: articleSlug, // Store slug explicitly - do NOT recompute elsewhere
    title,
    authors: creators.map((fullName) => ({ fullName })),
    journal: journalName,
    year,
    doi: identifiers.find((i) => typeof i === "string" && i.startsWith("10.")),
    topics: subjects.slice(0, 5),
    abstract: descs[0] || "",
    pdfUrl,
  };
}

// Helper function to extract resumptionToken from parsed OAI response
function extractResumptionToken(json: unknown): string | null {
  try {
    const resumptionToken = json?.["OAI-PMH"]?.ListRecords?.resumptionToken;
    if (!resumptionToken) return null;
    
    // Handle both string and object formats
    if (typeof resumptionToken === "string") {
      return resumptionToken.trim() || null;
    }
    if (typeof resumptionToken === "object" && resumptionToken !== null) {
      const tokenObj = resumptionToken as Record<string, unknown>;
      const token = tokenObj["#text"] || tokenObj["@_token"] || tokenObj["token"];
      if (typeof token === "string") {
        return token.trim() || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function harvestOjsArticles(options: OaiOptions = {}): Promise<Article[]> {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const metadataPrefix = options.metadataPrefix ?? "oai_dc";
  const limit = options.limit ?? 10000; // High limit, but we'll respect it at the end

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
  });

  const allArticles: Article[] = [];
  let resumptionToken: string | null = null;
  let pageNumber = 1;

  try {
    // Initial request
    let url = `${endpoint}?verb=ListRecords&metadataPrefix=${encodeURIComponent(metadataPrefix)}`;
    
    while (true) {
      console.log(`[Harvest] Fetching page ${pageNumber}${resumptionToken ? ` with resumptionToken` : ""}...`);
      
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OJS-Harvester/1.0)",
          Accept: "application/xml,text/xml,*/*",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        console.error(`[Harvest] HTTP error ${res.status} on page ${pageNumber}`);
        break;
      }

      const xml = await res.text();
      const json = parser.parse(xml);

      // Extract records from this page
      const records = json["OAI-PMH"]?.ListRecords?.record;
      const recordList = records ? (Array.isArray(records) ? records : [records]) : [];

      console.log(`[Harvest] Page ${pageNumber}: Found ${recordList.length} records`);

      // Process records from this page
      let reachedLimit = false;
      for (const rec of recordList) {
        if (allArticles.length >= limit) {
          console.log(`[Harvest] Reached limit of ${limit} articles, stopping`);
          reachedLimit = true;
          break;
        }
        const article = processRecord(rec, endpoint);
        if (article) {
          allArticles.push(article);
        }
      }

      console.log(`[Harvest] Page ${pageNumber}: Processed ${allArticles.length} total articles so far`);

      // Stop if limit reached
      if (reachedLimit) {
        break;
      }

      // Check for resumptionToken
      resumptionToken = extractResumptionToken(json);
      
      if (resumptionToken) {
        console.log(`[Harvest] Page ${pageNumber}: Found resumptionToken: "${resumptionToken.substring(0, 50)}..."`);
        url = `${endpoint}?verb=ListRecords&resumptionToken=${encodeURIComponent(resumptionToken)}`;
        pageNumber++;
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log(`[Harvest] Page ${pageNumber}: No resumptionToken found, pagination complete`);
        break;
      }
    }

    console.log(`[Harvest] Harvest complete: Collected ${allArticles.length} articles from ${pageNumber} page(s)`);
    return allArticles;
  } catch (err) {
    console.error(`[Harvest] OJS fetch failed on page ${pageNumber}:`, err);
    console.log(`[Harvest] Returning ${allArticles.length} articles collected before error`);
    return allArticles;
  }
}

