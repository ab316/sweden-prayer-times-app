import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';

import {
  subscribeToScheduleDebugEvents,
  type ScheduleDebugEvent,
} from '@/lib/notifications/debug-events';
import type { ReminderScheduleStatus } from '@/lib/notifications/reminders';

type ToastItem = ScheduleDebugEvent & { id: number };

let nextId = 0;

const STATUS_COLORS: Record<ReminderScheduleStatus, string> = {
  scheduled: '#22c55e',
  fresh: '#3b82f6',
  cancelled: '#f97316',
  'permission-denied': '#ef4444',
  'permission-not-requested': '#eab308',
  'no-schedule': '#6b7280',
  unsupported: '#6b7280',
};

function ToastCard({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(4500),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(onDone);
  }, [opacity, onDone]);

  const dot = STATUS_COLORS[item.result.status] ?? '#6b7280';
  const through = item.result.scheduledThrough
    ? new Date(item.result.scheduledThrough).toLocaleDateString('sv-SE')
    : null;
  const time = item.timestamp.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <Animated.View style={{ opacity }}>
      <View className="flex-row overflow-hidden rounded-lg bg-gray-900/95">
        <View style={{ width: 4, backgroundColor: dot }} />
        <View className="flex-1 px-3 py-2.5">
          <View className="flex-row items-center gap-1.5">
            <Text className="flex-1 text-xs font-semibold text-white" numberOfLines={1}>
              {item.label}
            </Text>
            <Text className="text-xs text-gray-400">{time}</Text>
          </View>
          <Text className="mt-0.5 text-xs text-gray-300">
            <Text style={{ color: dot }}>{item.result.status}</Text>
            {' · '}
            {item.result.scheduledCount} notifications
            {through ? ` · through ${through}` : ''}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

/** Overlay that shows schedule debug events as auto-dismissing toasts. Debug builds only. */
export function DebugScheduleToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToScheduleDebugEvents((event) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), { ...event, id }]);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <View className="absolute bottom-24 left-4 right-4 gap-1.5" pointerEvents="none">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          item={toast}
          onDone={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </View>
  );
}
