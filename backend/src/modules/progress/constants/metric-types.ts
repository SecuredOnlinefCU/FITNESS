export const METRIC_TYPES = [
  { key: 'weight', label: 'Weight', defaultUnit: 'kg', category: 'body' },
  { key: 'body_fat_percent', label: 'Body Fat %', defaultUnit: '%', category: 'body' },
  { key: 'lean_mass', label: 'Lean Mass', defaultUnit: 'kg', category: 'body' },
  { key: 'bmi', label: 'BMI', defaultUnit: '', category: 'body' },
  { key: 'chest', label: 'Chest', defaultUnit: 'cm', category: 'measurement' },
  { key: 'shoulders', label: 'Shoulders', defaultUnit: 'cm', category: 'measurement' },
  { key: 'waist', label: 'Waist', defaultUnit: 'cm', category: 'measurement' },
  { key: 'hips', label: 'Hips', defaultUnit: 'cm', category: 'measurement' },
  { key: 'thighs', label: 'Thighs', defaultUnit: 'cm', category: 'measurement' },
  { key: 'calves', label: 'Calves', defaultUnit: 'cm', category: 'measurement' },
  { key: 'biceps', label: 'Biceps', defaultUnit: 'cm', category: 'measurement' },
  { key: 'forearms', label: 'Forearms', defaultUnit: 'cm', category: 'measurement' },
  { key: 'resting_heart_rate', label: 'Resting HR', defaultUnit: 'bpm', category: 'vitals' },
  { key: 'blood_pressure_systolic', label: 'Systolic BP', defaultUnit: 'mmHg', category: 'vitals' },
  { key: 'blood_pressure_diastolic', label: 'Diastolic BP', defaultUnit: 'mmHg', category: 'vitals' },
  { key: 'vo2_max', label: 'VO₂ Max', defaultUnit: 'ml/kg/min', category: 'vitals' },
  { key: 'body_fat_mass', label: 'Body Fat Mass', defaultUnit: 'kg', category: 'body' },
  { key: 'water', label: 'Hydration', defaultUnit: 'L', category: 'wellness' },
  { key: 'sleep_hours', label: 'Sleep', defaultUnit: 'hrs', category: 'wellness' },
  { key: 'steps', label: 'Steps', defaultUnit: '', category: 'wellness' },
  { key: 'calories_consumed', label: 'Calories In', defaultUnit: 'kcal', category: 'nutrition' },
  { key: 'calories_burned', label: 'Calories Out', defaultUnit: 'kcal', category: 'nutrition' },
  { key: 'protein', label: 'Protein', defaultUnit: 'g', category: 'nutrition' },
  { key: 'hydration_ml', label: 'Water Intake', defaultUnit: 'ml', category: 'wellness' },
] as const;

export type MetricTypeKey = typeof METRIC_TYPES[number]['key'];

export function getMetricInfo(key: string) {
  return METRIC_TYPES.find(m => m.key === key) ?? { key, label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), defaultUnit: '', category: 'other' };
}
