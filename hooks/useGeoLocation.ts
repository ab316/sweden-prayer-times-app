import { useEffect, useState } from "react";
import Geolocation from "@react-native-community/geolocation";
import { fetchCityFromCoordinates } from "@/api/openStreetMap";
import { ICoodinates } from "@/types/ICoordinates";

export const useGeoLocation = () => {
  const [coords, setCoords] = useState<ICoodinates>({
    lat: 0,
    lon: 0,
  });
  const [city, setCity] = useState<string | null>(null);

  const update = () => {
    Geolocation.getCurrentPosition((info) => {
      const newCoords = {
        lat: info.coords.latitude,
        lon: info.coords.longitude,
      };
      setCoords(newCoords);
      fetchCityFromCoordinates(newCoords.lat, newCoords.lon).then((city) => {
        if (city) {
          setCity(city);
          console.log("City found from coordinates:", city);
        } else {
          console.log("No city found from coordinates");
          setCity(null);
        }
      });
    });
  };

  useEffect(() => {
    Geolocation.setRNConfiguration({
      authorizationLevel: "whenInUse",
      skipPermissionRequests: false,
    });

    update();
  }, []);

  return { coords, city, update };
};
