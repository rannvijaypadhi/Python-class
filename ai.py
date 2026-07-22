import json
import random
import sys
import math

# Read input from Node (score + misses)
data = sys.stdin.read().strip()

# Default state
score = 0
misses = {"left": 0, "center": 0, "right": 0}
streak = 0          # consecutive saves
pressure_level = 0  # how intense the AI gets

if data:
    try:
        obj = json.loads(data)
        score = obj.get("score", 0)
        misses = obj.get("misses", misses)
        streak = obj.get("streak", 0)
        pressure_level = obj.get("pressure", 0)
    except:
        pass

directions = ["left", "center", "right"]

# --- DIFFICULTY MODEL ---

# Base reaction time in ms
base_time = 1500

# Difficulty scales with score and streak
# Higher score + longer streak = less time to react
difficulty_factor = 1 + (score * 0.08) + (streak * 0.12)
difficulty_time = max(180, int(base_time / difficulty_factor))

# Pressure increases when player is doing well
pressure_level = min(100, pressure_level + score * 2 + streak * 3)

# --- WEAKNESS ANALYSIS ---

# Find your worst side
worst_zone = max(misses, key=misses.get)
worst_value = misses[worst_zone]

# Bias towards your worst side, but not always
# More misses = more bias
bias_chance = min(75, 15 + worst_value * 12)

# --- MIND GAMES / BEHAVIOR MODES ---

# AI modes:
# - "normal": balanced shooting
# - "pressure": aggressive, fast shots
# - "chaos": unpredictable, fakeouts
# - "sniper": repeatedly punishes one side

mode_roll = random.randint(1, 100)
if pressure_level > 70 and streak >= 3:
    mode = "pressure"
elif worst_value >= 4:
    mode = "sniper"
elif mode_roll <= 20:
    mode = "chaos"
else:
    mode = "normal"

# --- PATTERN GENERATION ---

pattern = []

def generate_pattern():
    # Create a 3‑shot pattern the player might try to read
    base = directions[:]
    random.shuffle(base)

    # Slight bias to worst zone in pattern
    if random.randint(1, 100) <= 50:
        base[0] = worst_zone

    return base

pattern = generate_pattern()

# --- SHOT DECISION ---

def choose_direction():
    r = random.randint(1, 100)

    if mode == "sniper":
        # Hammer the worst side with occasional breaks
        if r <= 70:
            return worst_zone
        else:
            return random.choice(directions)

    if mode == "pressure":
        # Faster shots, more bias, fewer center shots
        if r <= bias_chance:
            return worst_zone
        elif r <= bias_chance + 20:
            return random.choice(["left", "right"])
        else:
            return random.choice(directions)

    if mode == "chaos":
        # Very unpredictable, fakeouts
        if r <= 30:
            return worst_zone
        elif r <= 60:
            return pattern[random.randint(0, 2)]
        else:
            return random.choice(directions)

    # normal mode
    if r <= bias_chance:
        return worst_zone
    elif r <= bias_chance + 25:
        return pattern[random.randint(0, 2)]
    else:
        return random.choice(directions)

direction = choose_direction()

# --- TIME TUNING / SPECIAL SHOTS ---

# Occasionally fire a "bullet shot" with very low time
special_roll = random.randint(1, 100)
if special_roll <= 10 and score >= 5:
    # Bullet shot
    difficulty_time = max(120, difficulty_time - 150)
    shot_type = "bullet"
elif special_roll <= 25 and streak >= 3:
    # Fake slow shot (looks easy but pattern punishes later)
    difficulty_time = min(2000, difficulty_time + 300)
    shot_type = "fake"
else:
    shot_type = "normal"

# --- OUTPUT ---

output = {
    "direction": direction,
    "time_limit_ms": difficulty_time,
    "pattern": pattern,
    "mode": mode,
    "shot_type": shot_type,
    "pressure": pressure_level,
    "streak": streak
}

print(json.dumps(output))
