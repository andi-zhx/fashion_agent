const { spawn } = require("child_process");

const child = spawn("python", ["app.py"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code) => {
  process.exit(code || 0);
});
