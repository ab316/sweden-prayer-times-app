import { fetchCityFromCoordinates } from "@/api/openStreetMap";
import { Option } from "@/types";
import { ICity } from "@/types/ICity";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export const useGeoLocation = () => {
  const [error, setError] = useState<Error | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const retryPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError(new Error("Permission to access location was denied."));
    } else {
      setIsPermissionGranted(true);
      setError(null);
    }
  };

  const getCurrentLocation = async () => {
    if (!isPermissionGranted) {
      await retryPermissions();
    }

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

  const getCurrentCity = async (): Promise<Option<ICity>> => {
    let location = await getCurrentLocation();
    if (!location) return null;

    const { coords } = location;

    return await new Promise((resolve) => {
      fetchCityFromCoordinates(coords.latitude, coords.longitude).then(
        (city) => {
          if (city) {
            resolve({
              name: city,
              coords: { lat: coords.latitude, lon: coords.longitude },
            });
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
