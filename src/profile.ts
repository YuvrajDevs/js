import fs from "node:fs"; import YAML from "yaml";
export const profile = () => YAML.parse(fs.readFileSync("profile/profile.yml", "utf8"));
