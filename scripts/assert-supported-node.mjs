const major = Number.parseInt(process.versions.node.split(".")[0] ?? "", 10);

if (!Number.isFinite(major) || major < 20 || major >= 25) {
  console.error(
    `BoaMe mobile dev requires Node 20 or 22 LTS. Current Node is ${process.version}.\n` +
      "Run `nvm install 22 && nvm use` from the repo root, then run `pnpm dev:mobile` again."
  );
  process.exit(1);
}
