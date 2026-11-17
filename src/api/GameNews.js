const API_KEY = import.meta.env.VITE_NEWS_API_KEY;

export async function getGameNews(searchTerm = "") {
  try {
    const params = new URLSearchParams({
      key: API_KEY,
      page_size: "12",
      ordering: "-added",
    });
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    const response = await fetch(
      `https://api.rawg.io/api/games?${params}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch gaming data");
    }

    const data = await response.json();
return data.results.map((game) => ({
      id: game.id,
      title: game.name,
      image: game.background_image,
      released: game.released,
      rating: game.rating,
      platforms: game.platforms?.map(
        (platform) => platform.platform.name
      ) || [],
      description: game.description_raw || "No description available."
    }));

  } catch (error) {
    console.error("Gaming API Error:", error);
    return [];
  }
}
