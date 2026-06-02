const API = 'https://api-production-c73f.up.railway.app';

async function main() {
  const coachEmail = `setup-coach-${Date.now()}@levelfitest.com`;
  const clientEmail = `setup-client-${Date.now()}@levelfitest.com`;
  const password = 'TestPass123!';

  // Signup coach
  const signupRes = await fetch(`${API}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: coachEmail, password, confirmPassword: password, role: 'coach', firstName: 'Setup', lastName: 'Coach' }),
  });
  const signup = await signupRes.json();
  if (!signup.accessToken) { console.error('Signup failed:', signup); process.exit(1); }

  // Invite client
  const inviteRes = await fetch(`${API}/api/auth/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signup.accessToken}` },
    body: JSON.stringify({ email: clientEmail, firstName: 'E2E', lastName: 'Client' }),
  });
  const invite = await inviteRes.json();
  if (!invite.acceptUrl) { console.error('Invite failed:', invite); process.exit(1); }

  // Output as env vars
  console.log(`ACCEPT_URL=${invite.acceptUrl}`);
  console.log(`CLIENT_EMAIL=${clientEmail}`);
  console.log(`PASSWORD=${password}`);
}

main();
