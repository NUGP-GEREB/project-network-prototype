const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const commandIndex = args.findIndex(
  arg => !/^[A-Za-z_][A-Za-z0-9_]*=/.test(arg)
);

if (commandIndex === -1) {
  console.error(
    "Usage: node scripts/run-with-env.cjs KEY=value command [args...]"
  );
  process.exit(1);
}

const env = { ...process.env };
for (const assignment of args.slice(0, commandIndex)) {
  const equalsIndex = assignment.indexOf("=");
  env[assignment.slice(0, equalsIndex)] = assignment.slice(equalsIndex + 1);
}

function resolveCommand(command) {
  if (process.platform !== "win32" || path.extname(command)) {
    return command;
  }

  const pathEntries = (env.PATH || "").split(path.delimiter);
  const extensions = (env.PATHEXT || ".COM;.EXE;.BAT;.CMD")
    .split(";")
    .filter(Boolean);

  for (const entry of pathEntries) {
    for (const extension of extensions) {
      const candidate = path.join(
        entry,
        `${command}${extension.toLowerCase()}`
      );
      if (fs.existsSync(candidate)) return candidate;

      const upperCandidate = path.join(
        entry,
        `${command}${extension.toUpperCase()}`
      );
      if (fs.existsSync(upperCandidate)) return upperCandidate;
    }
  }

  return command;
}

const command = resolveCommand(args[commandIndex]);
const commandArgs = args.slice(commandIndex + 1);
const isCmdShim = process.platform === "win32" && /\.(cmd|bat)$/i.test(command);
const child = isCmdShim
  ? spawn(
      process.env.ComSpec || "cmd.exe",
      [
        "/d",
        "/s",
        "/c",
        [command, ...commandArgs]
          .map(arg => `"${String(arg).replace(/"/g, '""')}"`)
          .join(" "),
      ],
      {
        env,
        stdio: "inherit",
        windowsVerbatimArguments: true,
        windowsHide: true,
      }
    )
  : spawn(command, commandArgs, {
      env,
      stdio: "inherit",
      windowsHide: true,
    });

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
