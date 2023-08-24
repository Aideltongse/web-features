// This script helps you start writing a new feature YAML file.
// To get started, run: `npm run --silent feature-init -- --help`

import fs from "node:fs/promises";
import { fileURLToPath } from "url";

import { stringify } from "yaml";
import * as prettier from "prettier";
import yargs from "yargs";

const argv = yargs(process.argv.slice(2))
  .scriptName("feature-init")
  .usage("$0 <feature-identifier>", "Start a new feature YAML file", (yargs) =>
    yargs.positional("feature-identifier", {
      describe: "the feature key (i.e., the filename without `.yml`)",
    }),
  )
  .option("dry-run", {
    alias: "n",
    boolean: true,
    default: false,
    describe: "Print instead of writing to a file",
  })
  .option("caniuse", {
    type: "string",
    demandOption: true,
    default: "",
    describe: "Set the Can I use…? ID",
  })
  .option("spec", {
    demandOption: true,
    default: "",
    describe: "A specification URL",
  }).argv;

async function main() {
  const { dryRun, featureIdentifier, caniuse, spec } = argv;

  const destination = identifierToPath(featureIdentifier);
  const content = {
    spec: spec,
    caniuse,
    compat_features: [""],
  };

  const yamlText = stringify(content);
  const formatted = await format(destination, yamlText);

  if (dryRun) {
    console.log(formatted);
    process.exit(0);
  }
  await fs.writeFile(destination, formatted);
}

async function format(featurePath: string, text: string): Promise<string> {
  const configPath = fileURLToPath(new URL("../.prettierrc", import.meta.url));
  const options = await prettier.resolveConfig(configPath);
  options.filepath = featurePath;
  return prettier.format(text, options);
}

function identifierToPath(identifier: string): string {
  return fileURLToPath(
    new URL(`../feature-group-definitions/${identifier}.yml`, import.meta.url),
  );
}

await main();
