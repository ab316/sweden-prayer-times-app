import { Option } from "@/types";
import { ICity } from "@/types/ICity";

export async function fetchCitiesInSweden(): Promise<Option<ICity[]>> {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `[out:json][timeout:25];
        area["ISO3166-1"="SE"]->.sweden;
        node["place"="city"](area.sweden);
        out body;`;

  try {
    const body = `data=${encodeURIComponent(query)}`;
    const response = await fetch(overpassUrl, { method: "POST", body });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as IResponse;
    const cities = data.elements.map<ICity>((element) => ({
      name: element.tags.name,
      coords: {
        lat: element.lat,
        lon: element.lon,
      },
    }));

    console.log("Fetched cities in Sweden from Overpass API");
    return cities;
  } catch (error) {
    console.error(
      `Error fetching cities: ${error instanceof Error ? error.message : error}`
    );
    return null;
  }
}

type IResponse = {
  elements: {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: {
      place: string; // Should be "city"
      name: string;
    };
  }[];
};
