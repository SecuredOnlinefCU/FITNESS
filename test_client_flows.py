#!/usr/bin/env python3
"""End-to-end test: all 12 client sidebar flows against the backend API.

Usage:
    python test_client_flows.py [--url URL] [--email EMAIL]

Defaults:
    URL = http://localhost:4000
    email = test-client-flow-{timestamp}@example.com
"""

import sys, time, argparse, json
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
SKIP = "\033[93mSKIP\033[0m"
BOLD = "\033[1m"

results: list[dict] = []
session: dict = {}  # shared state (token, userId, programId, ...)


def req(method: str, url: str, body: dict | None = None, token: str | None = None) -> tuple[int, dict]:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(body).encode() if body else None
    r = Request(url, data=data, headers=headers, method=method)
    try:
        resp = urlopen(r, timeout=10)
        raw = resp.read().decode()
        return resp.status, json.loads(raw) if raw else {}
    except HTTPError as e:
        raw = e.read().decode()
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, {"error": raw}
    except URLError as e:
        return 0, {"error": str(e.reason)}


def ok200(*codes: int) -> bool:
    return any(c in (200, 201) for c in codes)

def test(name: str, label: str, ok: bool, detail: str = ""):
    status = PASS if ok else FAIL
    results.append({"name": name, "label": label, "ok": ok, "detail": detail})
    print(f"  {status} {label}" + (f" — {detail}" if detail else ""))


def section(title: str):
    print(f"\n{BOLD}{title}{'=' * 60}")


def run(api_url: str, test_email: str):
    a = api_url.rstrip("/")

    # ── Health ────────────────────────────────────────────────────
    section("0. Health check")
    code, data = req("GET", f"{a}/health")
    test("health", "GET /health", code == 200, data.get("status", ""))

    # ── Auth: signup a fresh client ────────────────────────────────
    section("1. Auth — signup + login")
    now = datetime.now(timezone.utc).strftime("%H%M%S%f")
    email = test_email or f"test-flow-{now}@example.com"
    pwd = "TestPass123!"

    code, data = req("POST", f"{a}/api/auth/signup", {
        "email": email, "password": pwd, "confirmPassword": pwd,
        "role": "client", "firstName": "Flow", "lastName": "Test",
    })
    ok = code == 201 and "accessToken" in data
    test("auth", "POST /api/auth/signup", ok, f"HTTP {code}")
    if not ok:
        print("  Signup failed — cannot continue. Check if backend is running and DB is up.")
        print_report()
        sys.exit(1)

    token = data["accessToken"]
    session["token"] = token
    session["userId"] = data["user"]["id"]

    # Login separately to verify
    code, data = req("POST", f"{a}/api/auth/login", {"email": email, "password": pwd})
    test("auth", "POST /api/auth/login", code == 200 and "accessToken" in data, f"HTTP {code}")

    # ── 1. Today ──────────────────────────────────────────────────
    section("1. /client/today — Intelligence & daily plan")
    code, data = req("GET", f"{a}/api/intelligence/today", token=token)
    has_score = isinstance(data.get("completionScore"), (int, float)) if code == 200 else False
    test("today", "GET /api/intelligence/today", code == 200, f"HTTP {code}" + (f", score={data.get('completionScore')}" if has_score else ""))

    # ── 2. Home ────────────────────────────────────────────────────
    section("2. /client/home — Aggregated dashboard")
    code1, prog = req("GET", f"{a}/api/programs", token=token)
    code2, tasks = req("GET", f"{a}/api/tasks", token=token)
    code3, notif = req("GET", f"{a}/api/notifications", token=token)
    code4, recov = req("GET", f"{a}/api/recovery/today", token=token)
    all_ok = all(ok200(c) for c in (code1, code2, code3, code4))
    test("home", "GET /api/programs + tasks + notifications + recovery", all_ok,
         f"prog={code1} tasks={code2} notif={code3} recov={code4}")

    # ── 3. Workouts ───────────────────────────────────────────────
    section("3. /client/workouts — Training calendar, history, exercises")
    code1, hist = req("GET", f"{a}/api/training/history", token=token)
    code2, assigns = req("GET", f"{a}/api/training/client-assignments", token=token)
    code3, exer = req("GET", f"{a}/api/training/exercises", token=token)
    all_ok = all(ok200(c) for c in (code1, code2, code3))
    test("workouts", "GET history + assignments + exercises", all_ok,
         f"hist={code1} assign={code2} exer={code3}")

    # ── 4. Recovery ───────────────────────────────────────────────
    section("4. /client/recovery — Readiness, sleep, HRV")
    code1, rtoday = req("GET", f"{a}/api/recovery/today", token=token)
    code2, rhist = req("GET", f"{a}/api/recovery/history?days=30", token=token)
    code3, _ = req("POST", f"{a}/api/recovery/metrics", token=token,
                   body={"sleepMinutes": 480, "sleepScore": 85, "hrvMs": 55, "restingHeartRate": 62})
    all_ok = all(ok200(c) for c in (code1, code2, code3))
    test("recovery", "GET today + history + POST metrics", all_ok,
         f"today={code1} history={code2} upsert={code3}")

    # ── 5. Progress ───────────────────────────────────────────────
    section("5. /client/progress — Metrics, photos, 1RM")
    code1, photos = req("GET", f"{a}/api/progress/photos", token=token)
    code2, ckin = req("GET", f"{a}/api/progress/checkins", token=token)
    code3, est = req("GET", f"{a}/api/training/estimated-max", token=token)
    code4, _ = req("POST", f"{a}/api/progress/metrics", token=token,
                   body={"metricType": "weight", "value": 75.5, "unit": "kg"})
    all_ok = all(ok200(c) for c in (code1, code2, code3, code4))
    test("progress", "GET photos + checkins + 1RM + POST metric", all_ok,
         f"photos={code1} checkins={code2} 1rm={code3} log={code4}")

    # ── 6. Nutrition ──────────────────────────────────────────────
    section("6. /client/nutrition — Meal logs, plans, hydration, macros")
    code1, logs = req("GET", f"{a}/api/nutrition/meal-logs", token=token)
    code2, plans = req("GET", f"{a}/api/nutrition/plans", token=token)
    code3, hydra = req("GET", f"{a}/api/nutrition/hydration", token=token)
    code4, targets = req("GET", f"{a}/api/nutrition/macro-targets", token=token)
    code5, _ = req("POST", f"{a}/api/nutrition/meal-logs", token=token,
                   body={"mealType": "BREAKFAST", "title": "Oatmeal", "calories": 350, "protein": 15, "carbs": 60, "fat": 5})
    code6, _ = req("POST", f"{a}/api/nutrition/hydration", token=token, body={"amountMl": 500})
    all_ok = all(ok200(c) for c in (code1, code2, code3, code4, code5, code6))
    test("nutrition", "GET meals+plans+hydration+macros + POST meal+hydration", all_ok,
         f"logs={code1} plans={code2} hydra={code3} macros={code4} logmeal={code5} loghydra={code6}")

    # ── 7. Program ────────────────────────────────────────────────
    section("7. /client/program — Active program with weeks")
    code, data = req("GET", f"{a}/api/programs", token=token)
    has_program = code == 200 and len(data.get("items", [])) > 0
    has_weeks = False
    if has_program:
        prog_item = data["items"][0]
        session["programId"] = prog_item.get("program", {}).get("id") or prog_item.get("id")
        if "weeks" in prog_item.get("program", {}):
            has_weeks = len(prog_item["program"]["weeks"]) > 0
    test("program", "GET /api/programs", code == 200,
         f"HTTP {code}, program={'yes' if has_program else 'no'}, weeks={'yes' if has_weeks else 'no'}")

    # ── 8. Feed ───────────────────────────────────────────────────
    section("8. /client/feed — Posts, momentum, reactions, saves")
    pid = session.get("programId")
    if pid:
        code1, posts = req("GET", f"{a}/api/feed/program/{pid}", token=token)
        code2, momentum = req("GET", f"{a}/api/feed/momentum", token=token)
        code3, _ = req("GET", f"{a}/api/feed/program/{pid}?type=COACH_MESSAGE", token=token)
        all_feed = all(ok200(c) for c in (code1, code2, code3))
        has_momentum = isinstance(momentum.get("total"), (int, float)) if code2 == 200 else False
        test("feed", "GET posts + momentum + filtered posts", all_feed,
             f"posts={code1} momentum={code2}({'yes' if has_momentum else 'no'}) filter={code3}")
    else:
        code_m, momentum = req("GET", f"{a}/api/feed/momentum", token=token)
        has_momentum = ok200(code_m) and isinstance(momentum.get("total"), (int, float))
        test("feed", "GET momentum (no program yet)", ok200(code_m),
             f"momentum={code_m} total={momentum.get('total', 'N/A')} — posts skipped, no program")

    # ── 9. Tasks ──────────────────────────────────────────────────
    section("9. /client/tasks — Assignments grouped by status")
    code, data = req("GET", f"{a}/api/tasks", token=token)
    items = data.get("items", [])
    test("tasks", "GET /api/tasks", code == 200, f"HTTP {code}, {len(items)} items")

    # ── 10. Messages ──────────────────────────────────────────────
    section("10. /dashboard/messages — Threads + messages")
    code1, threads = req("GET", f"{a}/api/messaging/threads", token=token)
    thread_items = threads.get("items", [])
    code2 = 0
    if thread_items:
        tid = thread_items[0]["id"]
        code2, _ = req("GET", f"{a}/api/messaging/threads/{tid}/messages", token=token)
        session["threadId"] = tid
    all_msg = code1 == 200
    test("messages", "GET threads", code1 == 200,
         f"threads={code1}, {len(thread_items)} threads" + (f", msgs={code2}" if thread_items else ""))

    # ── 11. Billing ───────────────────────────────────────────────
    section("11. /client/billing — Subscriptions + payments")
    code1, subs = req("GET", f"{a}/api/payments/subscriptions", token=token)
    code2, pays = req("GET", f"{a}/api/payments/payments", token=token)
    all_ok = all(ok200(c) for c in (code1, code2))
    test("billing", "GET subscriptions + payments", all_ok,
         f"subs={code1} ({len(subs.get('items', []))}) pays={code2} ({len(pays.get('items', []))})")

    # ── 12. Notifications ─────────────────────────────────────────
    section("12. /client/notifications — Notification list")
    code, data = req("GET", f"{a}/api/notifications", token=token)
    notifs = data.get("items", [])
    test("notifications", "GET /api/notifications", code == 200,
         f"HTTP {code}, {len(notifs)} notifications")

    # ── Summary ───────────────────────────────────────────────────
    print_report()


def print_report():
    passed = sum(1 for r in results if r["ok"])
    failed = sum(1 for r in results if not r["ok"])
    total = len(results)
    print(f"\n{'=' * 60}")
    print(f"{BOLD}CLIENT FLOW TEST SUMMARY{'=' * 40}")
    print(f"  {PASS} {passed}/{total} passed")
    print(f"  {FAIL} {failed}/{total} failed")
    if failed:
        print(f"\n  Failed flows:")
        for r in results:
            if not r["ok"]:
                print(f"    [{r['name']}] {r['label']} — {r['detail']}")
    print(f"{'=' * 60}")
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test all 12 client sidebar flows")
    parser.add_argument("--url", default="http://localhost:4000", help="Backend API URL")
    parser.add_argument("--email", default="", help="Test email (auto-generated if empty)")
    args = parser.parse_args()
    run(args.url, args.email)
