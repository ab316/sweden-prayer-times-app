import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityOption } from '../components/city-option';

type City = {
  name: string;
  subtitle: string;
};

const RECENT_CITIES: City[] = [
  { name: 'Gothenburg', subtitle: 'Current Location' },
  { name: 'Stockholm', subtitle: 'Sweden' },
  { name: 'Malmö', subtitle: 'Sweden' },
];

const POPULAR_CITIES = ['Uppsala', 'Västerås', 'Örebro', 'Linköping', 'Helsingborg'];

const ICON_COLORS = {
  primary: '#003527',
  outline: '#707974',
};

export default function SelectCityScreen() {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Gothenburg');

  const recentCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return RECENT_CITIES;
    }

    return RECENT_CITIES.filter((city) => city.name.toLowerCase().includes(normalizedQuery));
  }, [query]);

  const popularCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return POPULAR_CITIES;
    }

    return POPULAR_CITIES.filter((city) => city.toLowerCase().includes(normalizedQuery));
  }, [query]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="border-b border-surface-variant/50 bg-background/80 px-container-padding py-4">
        <View className="w-full max-w-2xl flex-row items-center justify-between self-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="-ml-2 rounded-full p-2">
            <MaterialIcons name="arrow-back" size={24} color={ICON_COLORS.primary} />
          </Pressable>
          <Text className="font-headline-md text-headline-md text-on-surface">Location</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow px-container-padding py-section-gap"
        className="flex-1">
        <View className="w-full max-w-2xl flex-1 gap-section-gap self-center">
          <View className="gap-element-gap">
            <View className="relative w-full">
              <View className="absolute bottom-0 left-0 top-0 z-10 justify-center pl-4">
                <MaterialIcons name="search" size={22} color={ICON_COLORS.outline} />
              </View>
              <TextInput
                accessibilityLabel="Search Swedish cities"
                value={query}
                onChangeText={setQuery}
                placeholder="Search Swedish cities..."
                placeholderTextColor={ICON_COLORS.outline}
                autoCapitalize="words"
                className="w-full rounded-xl border border-surface-variant bg-surface-container-lowest py-4 pl-12 pr-4 font-body-lg text-body-lg text-on-surface"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.02,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Detect my location"
              onPress={() => setSelectedCity('Gothenburg')}
              className="w-full flex-row items-center justify-center gap-3 rounded-full border border-secondary py-4">
              <MaterialIcons name="my-location" size={18} color={ICON_COLORS.primary} />
              <Text className="font-label-sm text-label-sm text-primary">Detect My Location</Text>
            </Pressable>
          </View>

          <View className="gap-element-gap">
            <Text className="px-2 font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Recently Used
            </Text>
            <View className="gap-2">
              {recentCities.length > 0 ? (
                recentCities.map((city) => (
                  <CityOption
                    key={city.name}
                    name={city.name}
                    subtitle={city.name === selectedCity ? 'Current Location' : city.subtitle}
                    active={city.name === selectedCity}
                    onPress={() => setSelectedCity(city.name)}
                  />
                ))
              ) : (
                <Text className="px-2 font-body-md text-body-md text-on-surface-variant">
                  No recent cities match your search.
                </Text>
              )}
            </View>
          </View>

          <View className="gap-element-gap">
            <Text className="px-2 font-label-sm text-label-sm uppercase tracking-widest text-outline">
              Popular
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {popularCities.length > 0 ? (
                popularCities.map((city) => (
                  <Pressable
                    key={city}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${city}`}
                    onPress={() => setSelectedCity(city)}
                    className={`rounded-full px-5 py-2.5 ${
                      city === selectedCity ? 'bg-primary' : 'bg-surface-container-low'
                    }`}>
                    <Text
                      className={`font-body-md text-body-md ${
                        city === selectedCity ? 'text-on-primary' : 'text-on-surface'
                      }`}>
                      {city}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text className="px-2 font-body-md text-body-md text-on-surface-variant">
                  No popular cities match your search.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
