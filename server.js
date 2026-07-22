const express = require("express");
const { spawn } = require("child_process");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/next-shot", (req, res) => {
    const py = spawn("python", ["ai.py"]);
    py.stdin.write(JSON.stringify(req.body));
    py.stdin.end();

    let data = "";
    py.stdout.on("data", d => data += d);

    py.on("close", () => {
        try {
            res.json(JSON.parse(data));
        } catch {
            res.status(500).json({ error: "ai_failed" });
        }
    });
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
