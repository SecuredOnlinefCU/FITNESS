import { chromium } from 'playwright';
const API = 'https://api-production-c73f.up.railway.app';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const req = async (path, opts = {}) => {
  const res = await ctx.request.fetch(`${API}${path}`, {
    ...opts, headers: { 'Content-Type': 'application/json', ...opts.headers },
  });
  const body = res.status() >= 400 ? await res.text() : await res.json();
  return { status: res.status(), body };
};
let passed = 0, failed = 0;
const check = (name, ok, detail) => { if (ok) { passed++; console.log(`  ✅ ${name}`); } else { failed++; console.log(`  ❌ ${name} — ${detail}`); } };

console.log('\n=== Auth ===');
const email = `test-${Date.now()}@levelfitest.com`;
const signup = await req('/api/auth/signup', { method: 'POST', data: { email, password: 'TestPass123!', firstName: 'Test', lastName: 'Coach', role: 'coach' } });
check('Signup coach', signup.status === 201 || signup.status === 200, `${signup.status}`);
const login = await req('/api/auth/login', { method: 'POST', data: { email, password: 'TestPass123!' } });
check('Login', login.status === 200, `${login.status}`);
const token = login.body?.token || login.body?.accessToken;
const auth = (t) => ({ headers: { Authorization: `Bearer ${t || token}` } });

console.log('\n=== Setup: program ===');
const prog = await req('/api/programs', { method: 'POST', ...auth(), data: { name: 'Test Program' } });
check('Create program', prog.status === 201, `${prog.status}`);
const programId = prog.body?.id || prog.body?.program?.id;
check('Got programId', !!programId, programId);

console.log('\n=== Feed: Post CRUD ===');
const post = await req('/api/feed/posts', { method: 'POST', ...auth(), data: { scopeType: 'PROGRAM', scopeId: programId, type: 'COACH_MESSAGE', bodyText: 'Welcome!' } });
check('Create COACH_MESSAGE', post.status === 201, `${post.status}`);
check('type=COACH_MESSAGE', post.body?.type === 'COACH_MESSAGE', post.body?.type);
const postId = post.body?.id;

const post2 = await req('/api/feed/posts', { method: 'POST', ...auth(), data: { scopeType: 'PROGRAM', scopeId: programId, type: 'WORKOUT_ASSIGNED', bodyText: 'Workout today' } });
check('Create WORKOUT_ASSIGNED', post2.status === 201, `${post2.status}`);
check('Has primaryAction', !!post2.body?.primaryAction, JSON.stringify(post2.body?.primaryAction));
const postId2 = post2.body?.id;

const posts = await req(`/api/feed/program/${programId}`, { ...auth() });
check('List program posts', posts.status === 200, `${posts.status}`);
check('>=2 posts', posts.body?.items?.length >= 2, `${posts.body?.items?.length}`);
check('Author present', !!posts.body?.items?.[0]?.author, 'author missing');
check('primaryAction present', !!posts.body?.items?.[1]?.primaryAction, 'action missing');

const getPost = await req(`/api/feed/posts/${postId}`, { ...auth() });
check('GET single post', getPost.status === 200, `${getPost.status}`);

const patchPost = await req(`/api/feed/posts/${postId}`, { method: 'PATCH', ...auth(), data: { bodyText: 'Updated' } });
check('PATCH post', patchPost.status === 200, `${patchPost.status}`);

console.log('\n=== Feed: Type filter ===');
const filtered = await req(`/api/feed/program/${programId}?type=WORKOUT_ASSIGNED`, { ...auth() });
check('Filter WORKOUT_ASSIGNED', filtered.status === 200, `${filtered.status}`);
check('All match type', filtered.body?.items?.every(p => p.type === 'WORKOUT_ASSIGNED'), 'mixed types');

console.log('\n=== Feed: Reactions ===');
const react = await req(`/api/feed/posts/${postId}/reactions`, { method: 'POST', ...auth(), data: { reactionType: 'LIKE' } });
check('Add reaction', react.status === 201, `${react.status}`);
const postsAfter = await req(`/api/feed/program/${programId}`, { ...auth() });
check('currentUserReacted true', postsAfter.body?.items?.find(p => p.id === postId)?.currentUserReacted, 'not true');
const delReact = await req(`/api/feed/posts/${postId}/reactions`, { method: 'DELETE', ...auth() });
check('Delete reaction', delReact.status === 200, `${delReact.status}`);

console.log('\n=== Feed: Saves ===');
const save = await req(`/api/feed/posts/${postId}/saves`, { method: 'POST', ...auth() });
check('Save post', save.status === 201, `${save.status}`);
const delSave = await req(`/api/feed/posts/${postId}/saves`, { method: 'DELETE', ...auth() });
check('Unsave post', delSave.status === 200, `${delSave.status}`);

console.log('\n=== Feed: Comments ===');
const comment = await req(`/api/feed/posts/${postId}/comments`, { method: 'POST', ...auth(), data: { bodyText: 'Great!' } });
check('Add comment', comment.status === 201, `${comment.status}`);
const comments = await req(`/api/feed/posts/${postId}/comments`, { ...auth() });
check('List comments', comments.status === 200, `${comments.status}`);
check('Comment author', !!comments.body?.items?.[0]?.author, 'author missing');

console.log('\n=== Feed: Momentum ===');
const momentum = await req('/api/feed/momentum', { ...auth() });
check('GET momentum', momentum.status === 200, `${momentum.status}`);
check('Has score', typeof momentum.body?.score === 'number', `${momentum.body?.score}`);
check('5 components', momentum.body?.components?.length === 5, `${momentum.body?.components?.length}`);
check('Has trend', ['up','down','stable'].includes(momentum.body?.trend), momentum.body?.trend);

console.log('\n=== Feed: Nudges ===');
const nudges = await req('/api/feed/nudges', { ...auth() });
check('GET nudges', nudges.status === 200, `${nudges.status}`);
check('Is array', Array.isArray(nudges.body?.items), `${typeof nudges.body?.items}`);

console.log('\n=== Feed: Analytics ===');
const analytics = await req(`/api/feed/posts/${postId}/analytics`, { ...auth() });
check('GET analytics', analytics.status === 200, `${analytics.status}`);
check('Has views', typeof analytics.body?.views === 'number', `${analytics.body?.views}`);
check('Has engagementRate', typeof analytics.body?.engagementRate === 'number', `${analytics.body?.engagementRate}`);

console.log('\n=== Feed: Reports ===');
const report = await req('/api/feed/reports', { method: 'POST', ...auth(), data: { targetType: 'POST', targetId: postId, reasonCode: 'SPAM' } });
check('Create report', report.status === 201, `${report.status}`);

console.log('\n=== Feed: Delete ===');
const del = await req(`/api/feed/posts/${postId}`, { method: 'DELETE', ...auth() });
check('Delete post', del.status === 200, `${del.status}`);
const del2 = await req(`/api/feed/posts/${postId2}`, { method: 'DELETE', ...auth() });
check('Delete post2', del2.status === 200, `${del2.status}`);

console.log('\n=== Feed: Auth enforcement ===');
const unauth1 = await req('/api/feed/momentum'); check('Momentum needs auth', unauth1.status === 401, `${unauth1.status}`);
const unauth2 = await req('/api/feed/nudges'); check('Nudges needs auth', unauth2.status === 401, `${unauth2.status}`);
const unauth3 = await req(`/api/feed/posts/${postId}/analytics`); check('Analytics needs auth', unauth3.status === 401, `${unauth3.status}`);

console.log(`\n✅ ${passed} passed, ❌ ${failed} failed\n`);
await browser.close();
process.exit(failed > 0 ? 1 : 0);
