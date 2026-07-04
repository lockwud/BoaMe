const { getDefaultConfig } = require("expo/metro-config");
const fs = require("fs");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const config = getDefaultConfig(projectRoot);
const packageJson = require("./package.json");
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const findPackageRoot = (entryPath) => {
  let directory = path.dirname(entryPath);

  while (directory !== path.dirname(directory)) {
    if (fs.existsSync(path.join(directory, "package.json"))) {
      return directory;
    }

    directory = path.dirname(directory);
  }

  return path.dirname(entryPath);
};
const resolveFromMobile = (name) => {
  try {
    return path.dirname(require.resolve(`${name}/package.json`, { paths: [projectRoot] }));
  } catch {
    return findPackageRoot(require.resolve(name, { paths: [projectRoot] }));
  }
};
const pnpmLinkedPackages = Object.keys(packageJson.dependencies ?? {}).filter((name) => name !== "@boame/shared-types");
const pnpmLinkedPackagePaths = Object.fromEntries(pnpmLinkedPackages.map((name) => [name, resolveFromMobile(name)]));

config.watchFolders = [
  path.resolve(workspaceRoot, "packages/shared-types"),
  ...Object.values(pnpmLinkedPackagePaths)
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  ...pnpmLinkedPackagePaths
};

const reactNativePath = pnpmLinkedPackagePaths["react-native"];
const nativeOnlyWatchExclusions = reactNativePath
  ? [
      "android",
      "flow",
      "ReactAndroid",
      "ReactCommon/hermes",
      "sdks",
      "scripts",
      "third-party-podspecs"
    ].map((folder) => new RegExp(`${escapeRegExp(path.join(reactNativePath, folder))}(/.*)?$`))
  : [];

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList) ? config.resolver.blockList : config.resolver.blockList ? [config.resolver.blockList] : []),
  ...nativeOnlyWatchExclusions
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const linkedPackageName = pnpmLinkedPackages.find(
    (name) => moduleName === name || moduleName.startsWith(`${name}/`)
  );

  if (linkedPackageName) {
    return context.resolveRequest(
      {
        ...context,
        originModulePath: path.join(projectRoot, "index.js")
      },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
