import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const ports = ["3000", "3001"];
const webNextDir = join(process.cwd(), "apps", "web", ".next");
const turboCacheDir = join(process.cwd(), ".turbo");
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

function matchingDevPids() {
  try {
    const rows = execFileSync("ps", ["-eo", "pid=,command="], { encoding: "utf8" })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return rows.flatMap((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) return [];
      const [, pid, command] = match;
      const isThisScript = command.includes("scripts/clean-dev-ports.mjs");
      const isRepoDev =
        command.includes(repoRoot) &&
        (command.includes("turbo dev") ||
          command.includes("next dev") ||
          command.includes("next/dist/bin/next") ||
          command.includes("@boame/web"));

      return !isThisScript && isRepoDev ? [pid] : [];
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

stopPids(matchingDevPids(), "SIGTERM");

for (let attempt = 0; attempt < 30 && matchingDevPids().length > 0; attempt += 1) {
  sleep(100);
}

stopPids(matchingDevPids(), "SIGKILL");

for (const port of ports) {
  const pids = pidsForPort(port);
  stopPids(pids, "SIGTERM");

  for (let attempt = 0; attempt < 20 && pidsForPort(port).length > 0; attempt += 1) {
    sleep(100);
  }

  stopPids(pidsForPort(port), "SIGKILL");
}

if (existsSync(webNextDir)) {
  rmSync(webNextDir, { recursive: true, force: true });
  console.log("Cleared apps/web/.next dev cache");
}

if (existsSync(turboCacheDir)) {
  rmSync(turboCacheDir, { recursive: true, force: true });
  console.log("Cleared .turbo dev cache");
}
