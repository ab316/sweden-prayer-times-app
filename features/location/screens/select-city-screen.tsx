import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '@/components/ui/section-header';
import { theme } from '@/constants/theme';

import { CityOption } from '../components/city-option';
import { useLocation } from '../hooks/use-location';
import { POPULAR_CITIES, SWEDISH_CITIES, type City } from '../types';

export default function SelectCityScreen() {
  const {
    city: selectedCity,
    recentCities,
    detecting,
    detectionError,
    selectCity,
    detectLocation,
  } = useLocation();
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  const searchResults = useMemo<City[]>(() => {
    if (!trimmed) return [];
    return SWEDISH_CITIES.filter((c) => c.name.toLowerCase().includes(trimmed)).slice(0, 20);
  }, [trimmed]);

  const handleSelect = async (c: City) => {
    await selectCity(c);
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-screen-pad py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="-ml-2 rounded-full p-2">
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-text">Location</Text>
        <View className="w-9" />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="px-screen-pad pb-12"
        className="flex-1">
        <View className="gap-section-gap">
          {/* Search */}
          <View className="gap-3">
            <View
              className="relative flex-row items-center rounded-prayer-row bg-card px-3 py-2"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              }}>
              <MaterialIcons name="search" size={20} color={theme.textSub} />
              <TextInput
                accessibilityLabel="Search Swedish cities"
                value={query}
                onChangeText={setQuery}
                placeholder="Search Swedish cities..."
                placeholderTextColor={theme.textSub}
                autoCapitalize="words"
                className="ml-2 flex-1 font-body-md text-body-md text-text"
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={6}>
                  <MaterialIcons name="cancel" size={18} color={theme.textSub} />
                </Pressable>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Detect my location"
              onPress={detectLocation}
              disabled={detecting}
              className="flex-row items-center justify-center gap-2 rounded-prayer-row border border-primary px-4 py-3">
              {detecting ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <MaterialIcons name="my-location" size={18} color={theme.primary} />
              )}
              <Text className="font-label text-label uppercase text-primary">
                {detecting ? 'Detecting…' : 'Detect My Location'}
              </Text>
            </Pressable>
            {detectionError ? (
              <Text className="px-2 font-caption text-caption text-text-sub">{detectionError}</Text>
            ) : null}
          </View>

          {/* Search results */}
          {trimmed ? (
            <View className="gap-2">
              <SectionHeader>Results</SectionHeader>
              {searchResults.length > 0 ? (
                searchResults.map((c) => (
                  <CityOption
                    key={c.id}
                    name={c.name}
                    subtitle="Sweden"
                    active={c.id === selectedCity.id}
                    icon="location-city"
                    onPress={() => handleSelect(c)}
                  />
                ))
              ) : (
                <Text className="px-2 font-body-sm text-body-sm text-text-sub">
                  No cities match your search.
                </Text>
              )}
            </View>
          ) : (
            <>
              {/* Recently used */}
              {recentCities.length > 0 ? (
                <View className="gap-2">
                  <SectionHeader>Recently Used</SectionHeader>
                  {recentCities.map((c) => (
                    <CityOption
                      key={c.id}
                      name={c.name}
                      subtitle={c.id === selectedCity.id ? 'Current Location' : 'Sweden'}
                      active={c.id === selectedCity.id}
                      onPress={() => handleSelect(c)}
                    />
                  ))}
                </View>
              ) : null}

              {/* Popular */}
              <View className="gap-2">
                <SectionHeader>Popular</SectionHeader>
                <View className="flex-row flex-wrap gap-2">
                  {POPULAR_CITIES.map((c) => {
                    const isActive = c.id === selectedCity.id;
                    return (
                      <Pressable
                        key={c.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Select ${c.name}`}
                        onPress={() => handleSelect(c)}
                        className={`rounded-city-chips px-4 py-2 ${isActive ? 'bg-primary' : 'bg-card'}`}
                        style={{
                          shadowColor: '#000',
                          shadowOpacity: 0.04,
                          shadowRadius: 4,
                          shadowOffset: { width: 0, height: 1 },
                          elevation: 1,
                        }}>
                        <Text
                          className={`font-body-sm text-body-sm ${isActive ? 'text-card' : 'text-text'}`}>
                          {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
