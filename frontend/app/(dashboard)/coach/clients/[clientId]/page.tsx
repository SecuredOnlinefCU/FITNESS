'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/states/skeleton';
import { ErrorState } from '@/components/states/error-state';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { clientsApi } from '@/lib/api/modules/clients';
import {
  ArrowLeft, ShieldCheck, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Dumbbell, Activity, FileText, Plus, Trash2, Zap, Brain, Heart, Target,
  Clock, ChevronRight, Flame, AlertCircle, CheckCircle, XCircle,
} from 'lucide-react';
import type { ClientDossier } from '@/lib/api/modules/clients';

const TABS = ['Overview', 'Performance', 'Intelligence', 'Programs', 'Workouts', 'Progress', 'Notes'] as const;
type Tab = (typeof TABS)[number];

function MomentumGauge({ score, trend }: { score: number; trend: string }) {
  const color = score >= 75 ? 'text-success' : score >= 50 ? 'text-energy' : 'text-pulse';
  const bg = score >= 75 ? 'bg-success' : score >= 50 ? 'bg-energy' : 'bg-pulse';
  const TrendIcon = trend === 'RISING' ? TrendingUp : trend === 'FALLING' ? TrendingDown : Minus;
  const trendColor = trend === 'RISING' ? 'text-success' : trend === 'FALLING' ? 'text-pulse' : 'text-muted-foreground';

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
          <path className="text-muted/30" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={color} stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-black ${color}`}>{score}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-muted-foreground">Momentum</p>
        <div className="flex items-center gap-1">
          <TrendIcon className={`h-4 w-4 ${trendColor}`} />
          <span className={`text-sm font-bold ${trendColor}`}>{trend}</span>
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const config = {
    LOW: { color: 'bg-success/10 text-success', icon: CheckCircle, label: 'Low risk' },
    MEDIUM: { color: 'bg-energy/10 text-energy', icon: AlertCircle, label: 'Medium risk' },
    HIGH: { color: 'bg-pulse/10 text-pulse', icon: AlertTriangle, label: 'High risk' },
    CRITICAL: { color: 'bg-pulse/20 text-pulse', icon: XCircle, label: 'Critical' },
  } as const;
  const c = config[level as keyof typeof config] ?? config.LOW;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${c.color}`}>
      <Icon className="h-3 w-3" />{c.label}
    </span>
  );
}

export default function ClientDossierPage(props: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(props.params);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [noteText, setNoteText] = useState('');

  const dossier = useAsyncData(() => clientsApi.getDossier(clientId), [clientId]);

  const loading = dossier.loading;
  const error = dossier.error;
  const data = dossier.data as ClientDossier | undefined;

  const user = data?.user;
  const profile = data?.clientProfile;
  const healthScore = data?.healthScore;
  const momentum = data?.momentum;
  const plateaus = data?.plateaus ?? [];
  const overtraining = data?.overtraining;
  const churnRisk = data?.churnRisk;
  const smartActions = data?.smartActions ?? [];
  const riskFlags = data?.riskFlags ?? [];
  const assignments = data?.assignments ?? [];
  const sessions = data?.sessions ?? [];
  const metrics = data?.metrics ?? [];
  const notes = data?.notes ?? [];
  const programMemberships = data?.programMemberships ?? [];

  const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';
  const initials = user ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase() : '';

  const completedSessions = sessions.filter((s) => s.status === 'completed').length;
  const totalSessions = sessions.length;
  const adherenceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  async function handleAddNote() {
    if (!noteText.trim()) return;
    await clientsApi.addNote(clientId, noteText.trim());
    setNoteText('');
    dossier.reload();
  }

  async function handleDeleteNote(noteId: string) {
    await clientsApi.deleteNote(clientId, noteId);
    dossier.reload();
  }

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="mb-4">
          <Link href="/coach/clients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />Back to clients
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => dossier.reload()} />
        ) : !user ? (
          <ErrorState message="Client not found" />
        ) : (
          <>
            {/* Hero Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">
                      {initials}
                    </div>
                    <div>
                      <h1 className="text-2xl font-black font-display">{name}</h1>
                      <p className="text-muted-foreground">{user.email}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {profile?.currentPhase && (
                          <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">{profile.currentPhase}</span>
                        )}
                        {profile?.currentGoal && (
                          <span className="rounded-full bg-flow/10 px-3 py-0.5 text-xs font-bold text-flow">{profile.currentGoal}</span>
                        )}
                        {churnRisk && <RiskBadge level={churnRisk.level} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {momentum && <MomentumGauge score={momentum.score} trend={momentum.trend} />}
                    <div className="text-right">
                      <p className="text-3xl font-black">{healthScore?.score ?? '--'}</p>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Row */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-4 md:grid-cols-5">
                  <div className="rounded-2xl bg-muted p-3 text-center">
                    <p className="text-lg font-black text-primary">{adherenceRate}%</p>
                    <p className="text-xs text-muted-foreground">Adherence</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-center">
                    <p className="text-lg font-black">{completedSessions}/{totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions (14d)</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-center">
                    <p className="text-lg font-black text-energy">{riskFlags.length}</p>
                    <p className="text-xs text-muted-foreground">Risk Flags</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-center">
                    <p className={`text-lg font-black ${overtraining?.risk === 'HIGH' ? 'text-pulse' : overtraining?.risk === 'MODERATE' ? 'text-energy' : 'text-success'}`}>
                      {overtraining?.risk ?? 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">Overtraining</p>
                  </div>
                  <div className="rounded-2xl bg-muted p-3 text-center">
                    <p className="text-lg font-black">{notes.length}</p>
                    <p className="text-xs text-muted-foreground">Coach Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2.5 text-sm font-bold transition ${
                    activeTab === tab
                      ? 'border-b-2 border-primary text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* Smart Actions */}
                {smartActions.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <h3 className="font-black">Recommended Actions</h3>
                      </div>
                      <div className="space-y-2">
                        {smartActions.slice(0, 5).map((action) => (
                          <div key={action.id} className="flex items-start gap-3 rounded-2xl bg-muted p-3">
                            <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              action.priority >= 90 ? 'bg-pulse/10 text-pulse' :
                              action.priority >= 75 ? 'bg-energy/10 text-energy' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {action.priority}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold">{action.title}</p>
                              <p className="text-xs text-muted-foreground">{action.body}</p>
                            </div>
                            <Link href={action.actionHref} className="text-primary hover:underline">
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Momentum Breakdown */}
                {momentum && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-flow" />
                        <h3 className="font-black">Momentum Breakdown</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="text-2xl font-black text-primary">{momentum.performanceScore}</p>
                          <p className="text-xs text-muted-foreground">Performance</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="text-2xl font-black text-flow">{momentum.behaviorScore}</p>
                          <p className="text-xs text-muted-foreground">Behavior</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="text-2xl font-black text-energy">{momentum.engagementScore}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3">
                          <p className="text-2xl font-black text-success">{momentum.recoveryScore}</p>
                          <p className="text-xs text-muted-foreground">Recovery</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Flags */}
                {riskFlags.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-energy" />
                        <h3 className="font-black">Open Risk Flags</h3>
                      </div>
                      <div className="space-y-2">
                        {riskFlags.map((flag) => (
                          <div key={flag.id} className="flex items-start gap-3 rounded-2xl bg-pulse/5 border border-pulse/20 p-3">
                            <AlertTriangle className={`mt-0.5 h-4 w-4 ${flag.severity === 'HIGH' || flag.severity === 'CRITICAL' ? 'text-pulse' : 'text-energy'}`} />
                            <div>
                              <p className="text-sm font-bold">{flag.title}</p>
                              {flag.body && <p className="text-xs text-muted-foreground">{flag.body}</p>}
                              <p className="mt-1 text-xs text-muted-foreground">{new Date(flag.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Notes */}
                {notes.length > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="font-black">Recent Notes</h3>
                        <button onClick={() => setActiveTab('Notes')} className="text-xs text-primary hover:underline">View all</button>
                      </div>
                      <div className="space-y-2">
                        {notes.slice(0, 3).map((note) => (
                          <div key={note.id} className="rounded-2xl bg-muted p-3">
                            <p className="text-sm">{note.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'Performance' && (
              <div className="space-y-6">
                {/* Plateaus */}
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      <h3 className="font-black">Strength Progression</h3>
                    </div>
                    {plateaus.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Not enough data to analyze strength trends.</p>
                    ) : (
                      <div className="space-y-2">
                        {plateaus.map((p) => (
                          <div key={p.exerciseId} className="flex items-center justify-between rounded-2xl bg-muted p-3">
                            <div>
                              <p className="font-bold">{p.exerciseName}</p>
                              <p className="text-xs text-muted-foreground">
                                Est. 1RM: {p.currentMax} (was {p.previousMax})
                              </p>
                            </div>
                            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                              p.status === 'IMPROVING' ? 'bg-success/10 text-success' :
                              p.status === 'PLATEAU' ? 'bg-energy/10 text-energy' :
                              'bg-pulse/10 text-pulse'
                            }`}>
                              {p.status === 'IMPROVING' ? `+${p.changePercent}%` :
                               p.status === 'PLATEAU' ? `${p.weeksAtLevel}w plateau` :
                               `${p.changePercent}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Overtraining Risk */}
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pulse" />
                      <h3 className="font-black">Overtraining Risk</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <RiskBadge level={overtraining?.risk === 'HIGH' ? 'CRITICAL' : overtraining?.risk === 'MODERATE' ? 'HIGH' : 'LOW'} />
                      <div className="text-sm text-muted-foreground">
                        {overtraining?.reason}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-2xl bg-muted p-2">
                        <p className="text-lg font-black">{overtraining?.sessionsThisWeek ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Sessions/week</p>
                      </div>
                      <div className="rounded-2xl bg-muted p-2">
                        <p className="text-lg font-black">{overtraining?.avgReadiness ?? '--'}</p>
                        <p className="text-xs text-muted-foreground">Avg readiness</p>
                      </div>
                      <div className="rounded-2xl bg-muted p-2">
                        <p className="text-lg font-black">{overtraining?.avgRPE ?? '--'}</p>
                        <p className="text-xs text-muted-foreground">Avg RPE</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Churn Risk */}
                {churnRisk && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-energy" />
                        <h3 className="font-black">Churn Risk</h3>
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <RiskBadge level={churnRisk.level} />
                        <span className="text-2xl font-black">{churnRisk.score}/100</span>
                      </div>
                      {churnRisk.factors.length > 0 && (
                        <div className="space-y-2">
                          {churnRisk.factors.map((f, i) => (
                            <div key={i} className="flex items-center justify-between rounded-2xl bg-muted p-3">
                              <div>
                                <p className="text-sm font-bold">{f.factor.replace(/_/g, ' ').toLowerCase()}</p>
                                <p className="text-xs text-muted-foreground">{f.detail}</p>
                              </div>
                              <span className="text-sm font-bold text-pulse">+{f.weight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'Intelligence' && (
              <div className="space-y-6">
                {/* Health Score Breakdown */}
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-black">Health Score Breakdown</h3>
                    </div>
                    {healthScore ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-muted p-3 text-center">
                          <p className="text-2xl font-black text-primary">{healthScore.adherenceScore}</p>
                          <p className="text-xs text-muted-foreground">Adherence</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3 text-center">
                          <p className="text-2xl font-black text-flow">{healthScore.progressScore}</p>
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3 text-center">
                          <p className="text-2xl font-black text-energy">{healthScore.engagementScore}</p>
                          <p className="text-xs text-muted-foreground">Engagement</p>
                        </div>
                        <div className="rounded-2xl bg-muted p-3 text-center">
                          <p className="text-2xl font-black text-success">{healthScore.paymentScore}</p>
                          <p className="text-xs text-muted-foreground">Payment</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No health score calculated yet.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Momentum History */}
                <Card>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <h3 className="font-black">Momentum Trend</h3>
                    </div>
                    {momentum ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="font-black">{momentum.score}/100</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              momentum.score >= 75 ? 'bg-success' : momentum.score >= 50 ? 'bg-energy' : 'bg-pulse'
                            }`}
                            style={{ width: `${momentum.score}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Performance: {momentum.performanceScore}</span>
                          <span>Behavior: {momentum.behaviorScore}</span>
                          <span>Engagement: {momentum.engagementScore}</span>
                          <span>Recovery: {momentum.recoveryScore}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No momentum data yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'Programs' && (
              <div className="space-y-4">
                <h3 className="font-black">Assigned Programs</h3>
                {programMemberships.filter((m) => m.program?.coachUserId === user?.id).length === 0 ? (
                  <div className="rounded-2xl bg-muted p-6 text-center">
                    <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-bold text-muted-foreground">No programs assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {programMemberships
                      .filter((m) => m.program?.coachUserId === user?.id)
                      .map((m) => (
                        <Card key={m.id}>
                          <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <Dumbbell className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-bold">{m.program?.name || 'Untitled'}</p>
                                <p className="text-xs text-muted-foreground">
                                  Joined {new Date(m.joinedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full bg-success/10 px-3 py-0.5 text-xs font-bold text-success">{m.status}</span>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Workouts' && (
              <div className="space-y-4">
                <h3 className="font-black">Workout Assignments</h3>
                {assignments.length === 0 ? (
                  <div className="rounded-2xl bg-muted p-6 text-center">
                    <Dumbbell className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-bold text-muted-foreground">No workouts assigned yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignments.map((a) => (
                      <Card key={a.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Dumbbell className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-bold">{a.workout?.title || 'Untitled'}</p>
                              <p className="text-xs text-muted-foreground">
                                {a.assignedForDate ? new Date(a.assignedForDate).toLocaleDateString() : 'No date'}
                              </p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                            a.status === 'completed' ? 'bg-success/10 text-success' :
                            a.status === 'in_progress' ? 'bg-energy/10 text-energy' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {a.status}
                          </span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Progress' && (
              <div className="space-y-4">
                <h3 className="font-black">Progress Metrics</h3>
                {metrics.length === 0 ? (
                  <div className="rounded-2xl bg-muted p-6 text-center">
                    <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-bold text-muted-foreground">No metrics recorded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {metrics.map((m) => (
                      <Card key={m.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold capitalize">{m.metricType.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-muted-foreground">{m.recordedAt ? new Date(m.recordedAt).toLocaleDateString() : ''}</p>
                            </div>
                            <p className="text-2xl font-black">{m.value}{m.unit ? ` ${m.unit}` : ''}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Notes' && (
              <div className="space-y-4">
                <h3 className="font-black">Coach Notes</h3>
                <div className="flex gap-2">
                  <input
                    className="h-11 flex-1 rounded-2xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground"
                    placeholder="Add a note about this client..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                    <Plus className="mr-1 h-4 w-4" />Add
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <div className="rounded-2xl bg-muted p-6 text-center">
                    <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-bold text-muted-foreground">No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="flex items-start justify-between p-4">
                          <div className="flex-1">
                            <p className="text-sm">{note.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
                          </div>
                          <button onClick={() => handleDeleteNote(note.id)} className="ml-2 text-muted-foreground hover:text-pulse">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  );
}
