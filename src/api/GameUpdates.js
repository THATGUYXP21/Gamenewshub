const NEWS_FEED_URL = "https://feeds.feedburner.com/ign/games-all";
const RSS_TO_JSON_URL = "https://api.rss2json.com/v1/api.json";

function getTextSummary(html) {
  const document = new DOMParser().parseFromString(html || "", "text/html");
  return document.body.textContent?.replace(/\s+/g, " ").trim().slice(0, 280) || "";
}

export async function getGamingUpdates() {
  const params = new URLSearchParams({
    rss_url: NEWS_FEED_URL,
    refresh: Date.now().toString(),
  });
  const response = await fetch(`${RSS_TO_JSON_URL}?${params}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gaming news (${response.status})`);
  }

  const data = await response.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error(data.message || "The gaming news feed returned an invalid response");
  }

  return data.items
    .filter((item) => item.title && item.link)
    .map((item) => {
      const publishedDate = new Date(item.pubDate);

      return {
        id: item.guid || item.link,
        title: item.title,
        url: item.link,
        summary: getTextSummary(item.description),
        publishedAt: Number.isNaN(publishedDate.getTime())
          ? null
          : publishedDate.toISOString(),
        source: data.feed?.title || "Gaming News",
      };
    });
}
