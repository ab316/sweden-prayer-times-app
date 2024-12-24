export const fetchCityFromCoordinates = async (
  latitude: number,
  longitude: number
) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.address && data.address.city) {
      return data.address.city;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch city from coordinates", error);
    return null;
  }
};
