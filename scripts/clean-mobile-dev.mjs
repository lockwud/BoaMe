import { execFileSync } from "node:child_process";

const ports = ["8081", "19000", "19001", "19002"];
const repoRoot = process.cwd();

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function pidsForPort(port) {
  try {
    return [...new Set(execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" }).trim().split(/\s+/).filter(Boolean))];
  } catch {
    return [];
  }
}

function matchingMobileDevPids() {
  try {
    const rows = execFileSync("ps", ["-eo", "pid=,command="], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return rows.flatMap((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) return [];
      const [, pid, command] = match;
      const isThisScript = command.includes("scripts/clean-mobile-dev.mjs");
      const isRepoMobileDev =
        command.includes(repoRoot) &&
        (command.includes("expo start") ||
          command.includes("@expo/cli") ||
          command.includes("metro") ||
          command.includes("@boame/mobile"));

      return !isThisScript && isRepoMobileDev ? [pid] : [];
    });
  } catch {
    return [];
  }
}

function stopPids(pids, signal) {
  for (const pid of [...new Set(pids)].filter(Boolean)) {
    try {
      process.kill(Number(pid), signal);
      console.log(`${signal === "SIGKILL" ? "Force stopped" : "Stopped"} process ${pid}`);
    } catch {
      // Process may have already exited.
    }
  }
}

stopPids(matchingMobileDevPids(), "SIGTERM");

for (let attempt = 0; attempt < 30 && matchingMobileDevPids().length > 0; attempt += 1) {
  sleep(100);
}

stopPids(matchingMobileDevPids(), "SIGKILL");

for (const port of ports) {
  const pids = pidsForPort(port);
  stopPids(pids, "SIGTERM");

  for (let attempt = 0; attempt < 20 && pidsForPort(port).length > 0; attempt += 1) {
    sleep(100);
  }

  stopPids(pidsForPort(port), "SIGKILL");
}
