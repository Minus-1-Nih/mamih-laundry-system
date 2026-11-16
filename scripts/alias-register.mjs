// Registers the "@/..." resolver for `node --test`.
// Import this via --import or NODE_OPTIONS, not from test files.
import { register } from "node:module";

register("./alias-hook.mjs", import.meta.url);
