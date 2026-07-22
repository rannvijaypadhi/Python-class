import json, sys, random, math

data = sys.stdin.read().strip()
x = 50
y = 50
history = []
if data:
    try:
        obj = json.loads(data)
        x = obj.get("x", 50)
        y = obj.get("y", 50)
        history = obj.get("history", [])
    except:
        pass

def zone_x(v):
    if v < 33: return "left"
    if v < 66: return "center"
    return "right"

def zone_y(v):
    if v < 33: return "high"
    if v < 66: return "mid"
    return "low"

px = zone_x(x)
py = zone_y(y)

heat = {"left":0,"center":0,"right":0,"high":0,"mid":0,"low":0}
for h in history:
    hx = h.get("x",50)
    hy = h.get("y",50)
    heat[zone_x(hx)] += 1
    heat[zone_y(hy)] += 1

total = max(1,len(history))
hxw = {k:heat[k]/total for k in ["left","center","right"]}
hyw = {k:heat[k]/total for k in ["high","mid","low"]}

rx = random.random()
ry = random.random()

bias_x = {
    "left": 0.55 + hxw["left"]*0.35,
    "center": 0.55 + hxw["center"]*0.35,
    "right": 0.55 + hxw["right"]*0.35
}

bias_y = {
    "high": 0.55 + hyw["high"]*0.35,
    "mid": 0.55 + hyw["mid"]*0.35,
    "low": 0.55 + hyw["low"]*0.35
}

def pick_x():
    r = random.random()
    if r < bias_x[px]: return px
    return random.choice(["left","center","right"])

def pick_y():
    r = random.random()
    if r < bias_y[py]: return py
    return random.choice(["high","mid","low"])

gx = pick_x()
gy = pick_y()

def coord_x(z):
    if z=="left": return random.uniform(10,30)
    if z=="center": return random.uniform(40,60)
    return random.uniform(70,90)

def coord_y(z):
    if z=="high": return random.uniform(10,30)
    if z=="mid": return random.uniform(40,60)
    return random.uniform(70,90)

ai_x = coord_x(gx)
ai_y = coord_y(gy)

confidence = (
    bias_x[px] * 0.5 +
    bias_y[py] * 0.5 +
    (0.15 if gx==px else 0) +
    (0.15 if gy==py else 0)
)

output = {
    "player_zone_x": px,
    "player_zone_y": py,
    "ai_guess_x": gx,
    "ai_guess_y": gy,
    "ai_x": ai_x,
    "ai_y": ai_y,
    "confidence": round(confidence,3)
}

print(json.dumps(output))
