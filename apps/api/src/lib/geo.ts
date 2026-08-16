/**
 * Вычисление расстояния между двумя координатами по формуле Haversine (в метрах)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // радиус Земли в метрах
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Расчет гео-оценки близости (от 0 до 100)
 * 0 м -> 100 баллов, 1 км -> 85 баллов, 5 км -> 40 баллов, 15+ км -> 10 баллов
 */
export function getGeoProximityScore(distanceMeters: number): number {
  if (distanceMeters <= 300) return 100;
  if (distanceMeters <= 1000) return 85;
  if (distanceMeters <= 3000) return 65;
  if (distanceMeters <= 7000) return 40;
  if (distanceMeters <= 15000) return 20;
  return 5;
}

/**
 * Расчет соответствия тегов интересам пользователя
 */
export function getTagMatchScore(itemTags: string[], userInterests: string[]): { score: number; matchedTags: string[] } {
  if (!userInterests.length || !itemTags.length) {
    return { score: 20, matchedTags: [] };
  }

  const matched = itemTags.filter((tag) =>
    userInterests.some(
      (interest) =>
        interest.toLowerCase().trim() === tag.toLowerCase().trim() ||
        tag.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(tag.toLowerCase())
    )
  );

  const ratio = matched.length / Math.max(userInterests.length, 1);
  const score = Math.min(100, Math.round(ratio * 80 + (matched.length > 0 ? 20 : 0)));

  return { score, matchedTags: matched };
}
