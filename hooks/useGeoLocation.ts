import { fetchCityFromCoordinates } from "@/api/openStreetMap";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export const useGeoLocation = () => {
  const [error, setError] = useState<Error | null>(null);

  const retryPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError(new Error("Permission to access location was denied."));
    } else {
      setError(null);
    }
  };

  const getCurrentLocation = async () => {
    let location: Location.LocationObject;
    const lastLocation = await Location.getLastKnownPositionAsync();
    if (lastLocation) {
      location = lastLocation;
    } else {
      const currentLocation = await Location.getCurrentPositionAsync({});
      location = currentLocation;
    }

    if (!location) {
      return null;
    }

    return location;
  };

  const getCurrentCity = async (): Promise<string | null> => {
    let location = await getCurrentLocation();
    if (!location) return null;

    const { coords } = location;

    return new Promise((resolve) => {
      fetchCityFromCoordinates(coords.latitude, coords.longitude).then(
        (city) => {
          if (city) {
            resolve(city);
          } else {
            console.log("No city found from coordinates");
            resolve(null);
          }
        }
      );
    });
  };

  useEffect(() => {
    retryPermissions();
  }, []);

  return { error, getCurrentCity, getCurrentLocation };
};
