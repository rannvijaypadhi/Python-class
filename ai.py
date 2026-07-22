import json
import random
import sys

data = sys.stdin.read().strip()
score = 0
misses = {"left": 0, "center": 0, "right": 0}

if data:
    try:
        obj = json.loads(data)
        score = obj.get("score", 0)
        misses = obj.get("misses", misses)
    except:
        pass

directions = ["left", "center", "right"]

base_time = 1500
difficulty_time = max(300, base_time - score * 40)

worst_zone = max(misses, key=misses.get)
bias_chance = min(70, misses[worst_zone] * 10)

pattern = []
for _ in range(3):
    pattern.append(random.choice(directions))

aggressive = score >= 10

if aggressive:
    difficulty_time = max(200, difficulty_time - 200)
    bias_chance = min(90, bias_chance + 20)

r = random.randint(1, 100)

if r <= bias_chance:
    direction = worst_zone
elif r <= bias_chance + 20:
    direction = pattern[random.randint(0, 2)]
else:
    direction = random.choice(directions)

print(json.dumps({
    "direction": direction,
    "time_limit_ms": difficulty_time,
    "pattern": pattern
}))
