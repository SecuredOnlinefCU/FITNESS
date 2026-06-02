'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Dumbbell, Zap, Flame, TrendingUp, Home, Building, Smartphone, AlertTriangle, Check, ArrowRight, ArrowLeft, Loader, Trophy, Moon, Brain, Activity, Timer } from 'lucide-react';
import { onboardingApi, type GeneratedPlan } from '@/lib/api/modules/onboarding';
import type { OnboardingBlueprintResult } from '@/lib/types/domain';
import { Button } from '@/components/ui/button';

const STEPS = ['goal', 'level', 'equipment', 'schedule', 'injuries', 'lifestyle', 'assessment', 'blueprint'] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  goal: 'Goal', level: 'Experience', equipment: 'Equipment', schedule: 'Schedule',
  injuries: 'Limitations', lifestyle: 'Lifestyle', assessment: 'Fitness test', blueprint: 'Blueprint',
};

const GOALS = [
  { id: 'fat_loss', label: 'Fat Loss', desc: 'Burn fat, get lean, improve body composition', icon: Flame, color: 'from-orange-500 to-red-500' },
  { id: 'muscle_gain', label: 'Muscle Gain', desc: 'Build size, increase muscle mass, sculpt physique', icon: Dumbbell, color: 'from-blue-500 to-indigo-500' },
  { id: 'strength', label: 'Strength', desc: 'Lift heavier, build raw power, master compounds', icon: Zap, color: 'from-yellow-500 to-orange-500' },
  { id: 'endurance', label: 'Endurance', desc: 'Build stamina, improve cardiovascular fitness', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Best of all worlds \u2014 strength, conditioning, performance', icon: Target, color: 'from-purple-500 to-pink-500' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to structured training or returning after a long break', examples: 'Can do 5 push-ups, 30s plank', bar: 1 },
  { id: 'intermediate', label: 'Intermediate', desc: 'Consistent training for 6+ months with good form', examples: 'Can do 20 push-ups, squat bodyweight', bar: 2 },
  { id: 'advanced', label: 'Advanced', desc: '2+ years of progressive training, solid technique', examples: 'Can deadlift 1.5x bodyweight', bar: 3 },
];

const EQUIPMENT = [
  { id: 'full_gym', label: 'Full Gym', desc: 'Barbells, dumbbells, machines, cables, racks', icon: Building },
  { id: 'home', label: 'Home Gym', desc: 'Dumbbells, resistance bands, pull-up bar, bench', icon: Home },
  { id: 'bodyweight', label: 'Bodyweight', desc: 'Just your body \u2014 no equipment needed', icon: Smartphone },
];

const INJURY_OPTIONS = ['Lower back', 'Knee', 'Shoulder', 'Neck', 'Wrist', 'Hip', 'None'];

const SESSION_LENGTHS = [30, 45, 60, 75, 90];

const SLEEP_OPTIONS = [
  { value: 5, label: '< 5h', desc: 'Very poor' },
  { value: 6, label: '5-6h', desc: 'Below average' },
  { value: 7, label: '6-7h', desc: 'Average' },
  { value: 8, label: '7-8h', desc: 'Good' },
  { value: 9, label: '8h+', desc: 'Excellent' },
];

const STRESS_OPTIONS = [
  { value: 1, label: '1', desc: 'Very low' },
  { value: 2, label: '2', desc: 'Low' },
  { value: 3, label: '3', desc: 'Moderate' },
  { value: 4, label: '4', desc: 'High' },
  { value: 5, label: '5', desc: 'Very high' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Desk job, little movement' },
  { value: 'light', label: 'Lightly Active', desc: 'Walking, light daily movement' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Regular activity outside gym' },
  { value: 'heavy', label: 'Very Active', desc: 'Physical job or intense daily activity' },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 400 : -400, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -400 : 400, opacity: 0 }),
};

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <motion.div className="h-full bg-primary rounded-full" initial={false} animate={{ width: `${((current + 1) / total) * 100}%` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');
  const [equipment, setEquipment] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionLength, setSessionLength] = useState(60);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(3);
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [pushups, setPushups] = useState<number | ''>('');
  const [plankSeconds, setPlankSeconds] = useState<number | ''>('');
  const [squats, setSquats] = useState<number | ''>('');

  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [blueprint, setBlueprint] = useState<OnboardingBlueprintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIdx];

  const canNext = (() => {
    if (step === 'goal') return !!goal;
    if (step === 'level') return !!level;
    if (step === 'equipment') return !!equipment;
    if (step === 'schedule') return daysPerWeek >= 1 && daysPerWeek <= 7;
    return true;
  })();

  const next = useCallback(() => {
    if (stepIdx < STEPS.length - 1) { setDirection(1); setStepIdx(s => s + 1); }
  }, [stepIdx]);

  const prev = useCallback(() => {
    if (stepIdx > 0) { setDirection(-1); setStepIdx(s => s - 1); }
  }, [stepIdx]);

  const toggleInjury = (item: string) => {
    setLimitations(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleGenerateBlueprint = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await onboardingApi.generateBlueprint({
        goal, level, equipment, daysPerWeek, sessionLength,
        limitations: limitations.filter(l => l !== 'None'),
        sleepHours, stressLevel, activityLevel,
        pushups: pushups !== '' ? pushups : undefined,
        plankSeconds: plankSeconds !== '' ? plankSeconds : undefined,
        squats: squats !== '' ? squats : undefined,
      });
      setBlueprint(result);
      
      // If we have a blueprint, automatically generate the plan
      if (result) {
        await handleGeneratePlan();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await onboardingApi.generatePlan({
        goal, level, equipment, daysPerWeek,
        limitations: limitations.filter(l => l !== 'None'),
      });
      setPlan(result);
      localStorage.setItem('levelfit_onboarding_complete', 'true');
      router.push('/client/home');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); next(); }} className="min-h-dvh flex flex-col bg-background">
      <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8">
          <ProgressBar current={stepIdx} total={STEPS.length} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {STEP_LABELS[step]} &middot; Step {stepIdx + 1} of {STEPS.length}
            </span>
            {stepIdx > 0 && (
              <button type="button" onClick={prev} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute inset-0">

              {step === 'goal' && (
                <div className="space-y-6">
                  <div><h1 className="text-3xl font-black">What&apos;s your goal?</h1><p className="text-muted-foreground mt-2">This shapes every workout in your program.</p></div>
                  <div className="space-y-3">
                    {GOALS.map(g => (
                      <button type="button" key={g.id} onClick={() => setGoal(g.id)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${goal === g.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}>
                        <div className={`rounded-xl bg-gradient-to-br ${g.color} p-3 text-white`}><g.icon className="h-5 w-5" /></div>
                        <div className="flex-1"><p className="font-bold">{g.label}</p><p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p></div>
                        {goal === g.id && <Check className="h-5 w-5 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'level' && (
                <div className="space-y-6">
                  <div><h1 className="text-3xl font-black">What&apos;s your experience?</h1><p className="text-muted-foreground mt-2">Be honest \u2014 this calibrates your training volume.</p></div>
                  <div className="space-y-3">
                    {LEVELS.map(l => (
                      <button type="button" key={l.id} onClick={() => setLevel(l.id)} className={`w-full p-4 rounded-xl border-2 transition-all text-left ${level === l.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}>
                        <div className="flex items-center justify-between"><p className="font-bold text-lg">{l.label}</p>{level === l.id && <Check className="h-5 w-5 text-primary" />}</div>
                        <p className="text-sm text-muted-foreground mt-1">{l.desc}</p>
                        <div className="flex gap-1 mt-2">{[1, 2, 3].map(bar => <div key={bar} className={`h-1.5 flex-1 rounded-full ${bar <= l.bar ? 'bg-primary' : 'bg-muted'}`} />)}</div>
                        <p className="text-xs text-muted-foreground mt-2 italic">{l.examples}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'equipment' && (
                <div className="space-y-6">
                  <div><h1 className="text-3xl font-black">What equipment do you have?</h1><p className="text-muted-foreground mt-2">We&apos;ll only program exercises you can actually do.</p></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {EQUIPMENT.map(e => (
                      <button type="button" key={e.id} onClick={() => setEquipment(e.id)} className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${equipment === e.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}>
                        <div className="rounded-2xl bg-muted p-4"><e.icon className="h-8 w-8 text-primary" /></div>
                        <div className="text-center"><p className="font-bold">{e.label}</p><p className="text-xs text-muted-foreground mt-1">{e.desc}</p></div>
                        {equipment === e.id && <Check className="h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'schedule' && (
                <div className="space-y-8">
                  <div><h1 className="text-3xl font-black">How many days per week?</h1><p className="text-muted-foreground mt-2">More isn&apos;t always better. Consistency beats volume.</p></div>
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(d => (
                      <button type="button" key={d} onClick={() => setDaysPerWeek(d)} className={`aspect-square rounded-xl text-lg font-bold transition-all flex items-center justify-center ${daysPerWeek === d ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>{d}</button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {daysPerWeek <= 3 && 'Great for building consistency. Full-body sessions work best.'}
                    {daysPerWeek === 4 && 'The sweet spot. Upper/lower split for balanced progress.'}
                    {daysPerWeek === 5 && 'Push/pull/legs split. Great for intermediate+ lifters.'}
                    {daysPerWeek >= 6 && 'High frequency. Only recommended for advanced athletes.'}
                  </p>
                  <div><h2 className="text-xl font-black">How long per session?</h2><p className="text-muted-foreground mt-1">Include warm-up and cool-down.</p></div>
                  <div className="grid grid-cols-5 gap-2">
                    {SESSION_LENGTHS.map(len => (
                      <button type="button" key={len} onClick={() => setSessionLength(len)} className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${sessionLength === len ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                        <Timer className="h-4 w-4" />{len}min
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 'injuries' && (
                <div className="space-y-6">
                  <div><h1 className="text-3xl font-black">Any limitations?</h1><p className="text-muted-foreground mt-2">We&apos;ll swap exercises to keep you training safely.</p></div>
                  <div className="flex flex-wrap gap-2">
                    {INJURY_OPTIONS.map(item => (
                      <button type="button" key={item} onClick={() => toggleInjury(item)} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${limitations.includes(item) ? item === 'None' ? 'bg-emerald-500 text-white' : 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-foreground border border-border'}`}>{item}</button>
                    ))}
                  </div>
                  {limitations.length > 0 && !limitations.includes('None') && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-primary">We&apos;ll modify exercises to avoid {limitations.join(' and ').toLowerCase()} stress.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 'lifestyle' && (
                <div className="space-y-8">
                  <div><h1 className="text-3xl font-black">Your lifestyle</h1><p className="text-muted-foreground mt-2">Recovery matters as much as training. Let&apos;s calibrate.</p></div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-flow" /><p className="font-bold">Average sleep per night</p></div>
                    <div className="grid grid-cols-5 gap-2">
                      {SLEEP_OPTIONS.map(opt => (
                        <button type="button" key={opt.value} onClick={() => setSleepHours(opt.value)} className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${sleepHours === opt.value ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                          <span>{opt.label}</span><span className="text-[10px] font-normal opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Brain className="h-5 w-5 text-energy" /><p className="font-bold">Stress level (1-5)</p></div>
                    <div className="grid grid-cols-5 gap-2">
                      {STRESS_OPTIONS.map(opt => (
                        <button type="button" key={opt.value} onClick={() => setStressLevel(opt.value)} className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${stressLevel === opt.value ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                          <span>{opt.label}</span><span className="text-[10px] font-normal opacity-70">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-pulse" /><p className="font-bold">Activity outside the gym</p></div>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIVITY_OPTIONS.map(opt => (
                        <button type="button" key={opt.value} onClick={() => setActivityLevel(opt.value)} className={`py-3 px-4 rounded-xl text-sm font-bold transition-all text-left ${activityLevel === opt.value ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
                          <span>{opt.label}</span><span className="block text-[10px] font-normal opacity-70 mt-0.5">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 'assessment' && (
                <div className="space-y-8">
                  <div><h1 className="text-3xl font-black">Quick fitness test</h1><p className="text-muted-foreground mt-2">Optional but helps us calibrate your level more accurately.</p></div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Activity className="h-5 w-5 text-flow" /><p className="font-bold">Max push-ups in one set</p></div>
                    <input type="number" min={0} max={200} placeholder="e.g. 20" value={pushups} onChange={e => setPushups(e.target.value ? parseInt(e.target.value) : '')} className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                    <p className="text-xs text-muted-foreground">Beginner: 0-14 &middot; Intermediate: 15-29 &middot; Advanced: 30+</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Timer className="h-5 w-5 text-energy" /><p className="font-bold">Max plank hold (seconds)</p></div>
                    <input type="number" min={0} max={600} placeholder="e.g. 60" value={plankSeconds} onChange={e => setPlankSeconds(e.target.value ? parseInt(e.target.value) : '')} className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                    <p className="text-xs text-muted-foreground">Beginner: 0-59s &middot; Intermediate: 60-119s &middot; Advanced: 120s+</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2"><Dumbbell className="h-5 w-5 text-pulse" /><p className="font-bold">Max bodyweight squats in 60s</p></div>
                    <input type="number" min={0} max={200} placeholder="e.g. 25" value={squats} onChange={e => setSquats(e.target.value ? parseInt(e.target.value) : '')} className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                    <p className="text-xs text-muted-foreground">Beginner: 0-14 &middot; Intermediate: 15-24 &middot; Advanced: 25+</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border"><p className="text-xs text-muted-foreground">Skip this step if you&apos;re unsure \u2014 we&apos;ll use your self-selected level.</p></div>
                </div>
              )}

              {step === 'blueprint' && (
                <div className="space-y-6">
                  <div><h1 className="text-3xl font-black">Your fitness blueprint</h1><p className="text-muted-foreground mt-2">Here&apos;s what we built for you.</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border p-4"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Goal</p><p className="text-lg font-black mt-1">{GOALS.find(g => g.id === goal)?.label}</p></div>
                    <div className="rounded-xl border border-border p-4"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Level</p><p className="text-lg font-black mt-1 capitalize">{level}</p></div>
                    <div className="rounded-xl border border-border p-4"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Equipment</p><p className="text-lg font-black mt-1 capitalize">{equipment.replace(/_/g, ' ')}</p></div>
                    <div className="rounded-xl border border-border p-4"><p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Schedule</p><p className="text-lg font-black mt-1">{daysPerWeek} days &middot; {sessionLength}min</p></div>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Structure</p>
                    <div className="mt-2 space-y-1.5">
                      {getSplit(daysPerWeek).map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                          <span className="font-bold">{d.name}</span>
                          <span className="text-muted-foreground">&mdash; {d.focus}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {limitations.filter(l => l !== 'None').length > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
                      <p className="text-xs text-primary">Exercises modified for: {limitations.filter(l => l !== 'None').join(', ')}</p>
                    </div>
                  )}

                  {!blueprint && !generating && (
                    <Button type="button" onClick={handleGenerateBlueprint} className="w-full h-12 text-base font-bold">Generate my blueprint</Button>
                  )}
                  {generating && !blueprint && (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <Loader className="h-8 w-8 text-primary animate-spin" />
                      <div className="w-full max-w-xs space-y-2">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div className="h-full bg-primary rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">Building your personalized blueprint...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="space-y-3" role="alert" aria-live="polite">
                      <div className="p-3 rounded-xl bg-pulse/10 border border-pulse/20"><p className="text-sm text-pulse">{error}</p></div>
                      <Button type="button" onClick={() => { localStorage.setItem('levelfit_onboarding_complete', 'true'); router.push('/client/home'); }} variant="outline" className="w-full h-11 text-sm font-bold">
                        Skip to home
                      </Button>
                    </div>
                  )}

                  {blueprint && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Brain className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-black text-lg">Your Blueprint</p>
                            <p className="text-xs text-muted-foreground">Confidence: {Math.round(blueprint.blueprint.levelConfidence * 100)}% &middot; {blueprint.blueprint.trainingStyle}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div><p className="text-muted-foreground">Split</p><p className="font-bold">{blueprint.blueprint.split}</p></div>
                          <div><p className="text-muted-foreground">Periodization</p><p className="font-bold">{blueprint.blueprint.periodization}</p></div>
                          <div><p className="text-muted-foreground">Timeline</p><p className="font-bold">{blueprint.estimatedTimeline}</p></div>
                          <div><p className="text-muted-foreground">Recovery</p><p className="font-bold">{blueprint.recoveryProfile.recommendation}</p></div>
                        </div>
                      </div>

                      {!plan && !generating && (
                        <div className="space-y-2">
                          <Button type="button" onClick={handleGeneratePlan} className="w-full h-12 text-base font-bold">Generate my program</Button>
                          <Button type="button" onClick={() => { localStorage.setItem('levelfit_onboarding_complete', 'true'); router.push('/client/home'); }} variant="outline" className="w-full h-11 text-sm font-bold">
                            Skip to home
                          </Button>
                        </div>
                      )}
                      {generating && blueprint && !plan && (
                        <div className="flex flex-col items-center gap-4 py-8">
                          <Loader className="h-8 w-8 text-primary animate-spin" />
                          <div className="w-full max-w-xs space-y-2">
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <motion.div className="h-full bg-primary rounded-full" animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">Building your personalized program...</p>
                          </div>
                        </div>
                      )}

                      {plan && (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                           <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5">
                             <div className="flex items-center gap-3 mb-3">
                               <Trophy className="h-6 w-6 text-primary" />
                               <div><p className="font-black text-lg">{plan.program.name}</p><p className="text-xs text-muted-foreground">{plan.summary.totalWorkouts} workouts across 4 weeks</p></div>
                             </div>
                             <div className="space-y-1.5 mt-3">
                               {plan.program.weeks.map(w => (
                                 <div key={w.id} className="flex items-center gap-2 text-xs">
                                   <span className="font-bold text-foreground">Week {w.weekIndex}</span>
                                   <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{w.phaseLabel}</span>
                                   <span className="text-muted-foreground">&mdash; {w.workouts.length} workouts</span>
                                 </div>
                               ))}
                             </div>
                           </div>
                            <Button type="button" onClick={() => { localStorage.setItem('levelfit_onboarding_complete', 'true'); router.push('/client/home'); }} className="w-full h-12 text-base font-bold">Start training</Button>
                         </motion.div>
                       )}

                     </motion.div>
                   )}
                 </div>
               )}
             </motion.div>
          </AnimatePresence>
        </div>

        {step !== 'blueprint' && (
          <div className="mt-8">
            <Button onClick={next} disabled={!canNext} className="w-full h-12 text-base font-bold">Continue <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </div>
        )}
      </div>
    </form>
  );
}

function getSplit(days: number) {
  switch (days) {
    case 3: return [{ name: 'Full Body A', focus: 'Compound Strength' }, { name: 'Full Body B', focus: 'Hypertrophy' }, { name: 'Full Body C', focus: 'Power & Core' }];
    case 4: return [{ name: 'Upper Push', focus: 'Chest, Shoulders, Triceps' }, { name: 'Lower Body', focus: 'Quads, Hamstrings, Glutes' }, { name: 'Upper Pull', focus: 'Back, Biceps' }, { name: 'Full Body', focus: 'Compound Movements' }];
    case 5: return [{ name: 'Push', focus: 'Chest, Shoulders, Triceps' }, { name: 'Pull', focus: 'Back, Biceps' }, { name: 'Legs', focus: 'Quads, Hamstrings, Glutes' }, { name: 'Upper Push', focus: 'Chest, Shoulders, Triceps' }, { name: 'Pull & Core', focus: 'Back, Biceps, Core' }];
    case 6: return [{ name: 'Push', focus: 'Chest, Shoulders, Triceps' }, { name: 'Pull', focus: 'Back, Biceps' }, { name: 'Legs', focus: 'Quads, Hamstrings, Glutes' }, { name: 'Push', focus: 'Chest, Shoulders, Triceps' }, { name: 'Pull', focus: 'Back, Biceps' }, { name: 'Legs & Core', focus: 'Legs, Glutes, Core' }];
    default: return [{ name: 'Full Body A', focus: 'Compound Strength' }, { name: 'Full Body B', focus: 'Hypertrophy' }, { name: 'Full Body C', focus: 'Power & Core' }];
  }
}
