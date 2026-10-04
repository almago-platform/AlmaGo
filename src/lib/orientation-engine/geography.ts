export type OrientationGeographicTier =
  | "chosen_city"
  | "nearby"
  | "land"
  | "germany";

export type OrientationGeographicScope = {
  tier: OrientationGeographicTier;
  cities: string[];
  landNames: string[];
  queryLocations: string[];
};

type OrientationCityMetadata = {
  value: string;
  aliases: readonly string[];
  land: string;
  latitude: number;
  longitude: number;
  regionalLands?: readonly string[];
};

const CITY_METADATA: readonly OrientationCityMetadata[] = [
  { value: "Aachen", aliases: ["Aachen"], land: "Nordrhein-Westfalen", latitude: 50.7753, longitude: 6.0839 },
  { value: "Berlin", aliases: ["Berlin"], land: "Berlin", latitude: 52.52, longitude: 13.405, regionalLands: ["Berlin", "Brandenburg"] },
  { value: "Bielefeld", aliases: ["Bielefeld"], land: "Nordrhein-Westfalen", latitude: 52.0302, longitude: 8.5325 },
  { value: "Bochum", aliases: ["Bochum"], land: "Nordrhein-Westfalen", latitude: 51.4818, longitude: 7.2162 },
  { value: "Bonn", aliases: ["Bonn"], land: "Nordrhein-Westfalen", latitude: 50.7374, longitude: 7.0982 },
  { value: "Brême", aliases: ["Brême", "Bremen"], land: "Bremen", latitude: 53.0793, longitude: 8.8017, regionalLands: ["Bremen", "Niedersachsen"] },
  { value: "Cologne", aliases: ["Cologne", "Köln", "Koln"], land: "Nordrhein-Westfalen", latitude: 50.9375, longitude: 6.9603 },
  { value: "Darmstadt", aliases: ["Darmstadt"], land: "Hessen", latitude: 49.8728, longitude: 8.6512 },
  { value: "Dortmund", aliases: ["Dortmund"], land: "Nordrhein-Westfalen", latitude: 51.5136, longitude: 7.4653 },
  { value: "Dresde", aliases: ["Dresde", "Dresden"], land: "Sachsen", latitude: 51.0504, longitude: 13.7373 },
  { value: "Düsseldorf", aliases: ["Düsseldorf", "Dusseldorf"], land: "Nordrhein-Westfalen", latitude: 51.2277, longitude: 6.7735 },
  { value: "Erlangen", aliases: ["Erlangen"], land: "Bayern", latitude: 49.5897, longitude: 11.0119 },
  { value: "Francfort", aliases: ["Francfort", "Frankfurt", "Frankfurt am Main"], land: "Hessen", latitude: 50.1109, longitude: 8.6821 },
  { value: "Fribourg", aliases: ["Fribourg", "Freiburg", "Freiburg im Breisgau"], land: "Baden-Württemberg", latitude: 47.999, longitude: 7.8421 },
  { value: "Hambourg", aliases: ["Hambourg", "Hamburg"], land: "Hamburg", latitude: 53.5511, longitude: 9.9937, regionalLands: ["Hamburg", "Niedersachsen", "Schleswig-Holstein"] },
  { value: "Hanovre", aliases: ["Hanovre", "Hannover"], land: "Niedersachsen", latitude: 52.3759, longitude: 9.732 },
  { value: "Heidelberg", aliases: ["Heidelberg"], land: "Baden-Württemberg", latitude: 49.3988, longitude: 8.6724 },
  { value: "Iéna", aliases: ["Iéna", "Jena"], land: "Thüringen", latitude: 50.9271, longitude: 11.5892 },
  { value: "Karlsruhe", aliases: ["Karlsruhe"], land: "Baden-Württemberg", latitude: 49.0069, longitude: 8.4037 },
  { value: "Leipzig", aliases: ["Leipzig"], land: "Sachsen", latitude: 51.3397, longitude: 12.3731 },
  { value: "Mayence", aliases: ["Mayence", "Mainz"], land: "Rheinland-Pfalz", latitude: 49.9929, longitude: 8.2473 },
  { value: "Munich", aliases: ["Munich", "München", "Munchen"], land: "Bayern", latitude: 48.1351, longitude: 11.582 },
  { value: "Münster", aliases: ["Münster", "Munster"], land: "Nordrhein-Westfalen", latitude: 51.9607, longitude: 7.6261 },
  { value: "Nuremberg", aliases: ["Nuremberg", "Nürnberg", "Nurnberg"], land: "Bayern", latitude: 49.4521, longitude: 11.0767 },
  { value: "Potsdam", aliases: ["Potsdam"], land: "Brandenburg", latitude: 52.3906, longitude: 13.0645 },
  { value: "Sarrebruck", aliases: ["Sarrebruck", "Saarbrücken", "Saarbrucken"], land: "Saarland", latitude: 49.2402, longitude: 6.9969 },
  { value: "Stuttgart", aliases: ["Stuttgart"], land: "Baden-Württemberg", latitude: 48.7758, longitude: 9.1829 },
  { value: "Tübingen", aliases: ["Tübingen", "Tubingen"], land: "Baden-Württemberg", latitude: 48.5216, longitude: 9.0576 },
  { value: "Ulm", aliases: ["Ulm"], land: "Baden-Württemberg", latitude: 48.4011, longitude: 9.9876 },
];

function normalized(value: string | null | undefined) {
  return (value || "")
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

const CITY_BY_ALIAS = new Map<string, OrientationCityMetadata>(
  CITY_METADATA.flatMap((city) =>
    [city.value, ...city.aliases].map((alias) => [normalized(alias), city] as const)
  ),
);

export function orientationCityMetadata(value: string | null | undefined) {
  return CITY_BY_ALIAS.get(normalized(value)) || null;
}

export function canonicalOrientationCity(value: string | null | undefined) {
  return orientationCityMetadata(value)?.value || normalized(value);
}

export function orientationCityLand(value: string | null | undefined) {
  return orientationCityMetadata(value)?.land || null;
}

function radians(value: number) {
  return (value * Math.PI) / 180;
}

export function orientationCityDistanceKm(
  from: string | null | undefined,
  to: string | null | undefined,
) {
  const a = orientationCityMetadata(from);
  const b = orientationCityMetadata(to);
  if (!a || !b) return null;
  if (a.value === b.value) return 0;

  const earthRadiusKm = 6371;
  const latDelta = radians(b.latitude - a.latitude);
  const lonDelta = radians(b.longitude - a.longitude);
  const latA = radians(a.latitude);
  const latB = radians(b.latitude);

  const haversine =
    Math.sin(latDelta / 2) ** 2
    + Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

function nearbyCities(preferredCities: readonly string[], radiusKm: number) {
  const chosen = preferredCities
    .map(orientationCityMetadata)
    .filter((city): city is OrientationCityMetadata => Boolean(city));
  const chosenValues = new Set(chosen.map((city) => city.value));

  return CITY_METADATA
    .filter((city) => !chosenValues.has(city.value))
    .map((city) => {
      const distance = Math.min(
        ...chosen.map((origin) =>
          orientationCityDistanceKm(origin.value, city.value) ?? Number.POSITIVE_INFINITY
        ),
      );
      return { city, distance };
    })
    .filter((entry) => Number.isFinite(entry.distance) && entry.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance || a.city.value.localeCompare(b.city.value))
    .map((entry) => entry.city.value);
}

function regionalLands(preferredCities: readonly string[]) {
  return unique(
    preferredCities.flatMap((value) => {
      const city = orientationCityMetadata(value);
      if (!city) return [];
      return [...(city.regionalLands || [city.land])];
    }),
  );
}

function landCities(
  preferredCities: readonly string[],
  excludedCities: readonly string[],
) {
  const lands = new Set(regionalLands(preferredCities));
  const excluded = new Set(excludedCities.map(canonicalOrientationCity));

  return CITY_METADATA
    .filter((city) => lands.has(city.land) && !excluded.has(city.value))
    .map((city) => city.value);
}

export function buildOrientationGeographicScopes(
  preferredCities: readonly string[],
  nearbyRadiusKm = 100,
): OrientationGeographicScope[] {
  const chosen = unique(
    preferredCities
      .map((city) => orientationCityMetadata(city)?.value || city.trim())
      .filter(Boolean),
  );

  if (chosen.length === 0) {
    return [{
      tier: "germany",
      cities: [],
      landNames: [],
      queryLocations: ["Germany"],
    }];
  }

  const nearby = nearbyCities(chosen, nearbyRadiusKm);
  const lands = regionalLands(chosen);
  const sameRegion = landCities(chosen, [...chosen, ...nearby]);

  const scopes: OrientationGeographicScope[] = [{
    tier: "chosen_city",
    cities: chosen,
    landNames: lands,
    queryLocations: chosen,
  }];

  if (nearby.length > 0) {
    scopes.push({
      tier: "nearby",
      cities: nearby,
      landNames: lands,
      queryLocations: nearby.slice(0, 3),
    });
  }

  if (sameRegion.length > 0 || lands.length > 0) {
    scopes.push({
      tier: "land",
      cities: sameRegion,
      landNames: lands,
      queryLocations: lands,
    });
  }

  scopes.push({
    tier: "germany",
    cities: [],
    landNames: [],
    queryLocations: ["Germany"],
  });

  return scopes;
}

export function orientationScopeContainsCity(
  scope: OrientationGeographicScope,
  city: string | null | undefined,
) {
  if (scope.tier === "germany") return true;
  const canonical = canonicalOrientationCity(city);
  if (!canonical) return false;

  if (scope.cities.some((value) => canonicalOrientationCity(value) === canonical)) {
    return true;
  }

  if (scope.tier === "land") {
    const land = orientationCityLand(city);
    return Boolean(land && scope.landNames.includes(land));
  }

  return false;
}
