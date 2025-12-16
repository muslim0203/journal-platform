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

export async function harvestOjsArticles(options: OaiOptions = {}): Promise<Article[]> {
  const endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
  const metadataPrefix = options.metadataPrefix ?? "oai_dc";
  const limit = options.limit ?? 200;

  const url = `${endpoint}?verb=ListRecords&metadataPrefix=${encodeURIComponent(metadataPrefix)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OJS-Harvester/1.0)",
        Accept: "application/xml,text/xml,*/*",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
    });
    const json = parser.parse(xml);
    const records = json["OAI-PMH"]?.ListRecords?.record;
    const list = records ? (Array.isArray(records) ? records : [records]) : [];

    const articles: Article[] = [];
    for (const rec of list) {
      if (articles.length >= limit) break;
      const md = rec?.metadata?.["oai_dc:dc"];
      if (!md) continue;

      const titles = toFlatStrings(md["dc:title"]);
      const creators = toFlatStrings(md["dc:creator"]);
      const descs = toFlatStrings(md["dc:description"]);
      const dates = toFlatStrings(md["dc:date"]);
      const identifiers = toFlatStrings(md["dc:identifier"]);
      const subjects = toFlatStrings(md["dc:subject"]);

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

      articles.push({
        slug: slugify(title),
        title,
        authors: creators.map((fullName) => ({ fullName })),
        journal: journalName,
        year,
        doi: identifiers.find((i) => typeof i === "string" && i.startsWith("10.")),
        topics: subjects.slice(0, 5),
        abstract: descs[0] || "",
        pdfUrl,
      });
    }

    return articles;
  } catch (err) {
    console.error("OJS fetch failed:", err);
    return [];
  }
}

