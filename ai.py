import json
import random
import sys
import math

data = sys.stdin.read().strip()

score = 0
misses = {"left": 0, "center": 0, "right": 0}
streak = 0
pressure_level = 0

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

base_time = 1500

difficulty_factor = 1 + (score * 0.08) + (streak * 0.12)
difficulty_time = max(180, int(base_time / difficulty_factor))

pressure_level = min(100, pressure_level + score * 2 + streak * 3)

worst_zone = max(misses, key=misses.get)
worst_value = misses[worst_zone]

bias_chance = min(75, 15 + worst_value * 12)

mode_roll = random.randint(1, 100)
if pressure_level > 70 and streak >= 3:
    mode = "pressure"
elif worst_value >= 4:
    mode = "sniper"
elif mode_roll <= 20:
    mode = "chaos"
else:
    mode = "normal"

pattern = []

def generate_pattern():
    base = directions[:]
    random.shuffle(base)

    if random.randint(1, 100) <= 50:
        base[0] = worst_zone

    return base

pattern = generate_pattern()

def choose_direction():
    r = random.randint(1, 100)

    if mode == "sniper":
        if r <= 70:
            return worst_zone
        else:
            return random.choice(directions)

    if mode == "pressure":
        if r <= bias_chance:
            return worst_zone
        elif r <= bias_chance + 20:
            return random.choice(["left", "right"])
        else:
            return random.choice(directions)

    if mode == "chaos":
        if r <= 30:
            return worst_zone
        elif r <= 60:
            return pattern[random.randint(0, 2)]
        else:
            return random.choice(directions)

    if r <= bias_chance:
        return worst_zone
    elif r <= bias_chance + 25:
        return pattern[random.randint(0, 2)]
    else:
        return random.choice(directions)

direction = choose_direction()

special_roll = random.randint(1, 100)
if special_roll <= 10 and score >= 5:
    difficulty_time = max(120, difficulty_time - 150)
    shot_type = "bullet"
elif special_roll <= 25 and streak >= 3:
    difficulty_time = min(2000, difficulty_time + 300)
    shot_type = "fake"
else:
    shot_type = "normal"

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
