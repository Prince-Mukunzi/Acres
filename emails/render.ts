import { render } from "@react-email/render";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import WelcomeTenant from "./templates/WelcomeTenant";
import WelcomeLandlord from "./templates/WelcomeLandlord";
import RentReminder from "./templates/RentReminder";
import GeneralCommunication from "./templates/GeneralCommunication";
import MaintenanceUpdate from "./templates/MaintenanceUpdate";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "dist");

// Each entry maps a template name to its default-props React element.
// Default props use {{PLACEHOLDER}} strings so the Python backend
// can do a simple string replace at send-time.
const templates: Record<string, React.ReactElement> = {
  WelcomeTenant: WelcomeTenant({}),
  WelcomeLandlord: WelcomeLandlord({}),
  RentReminder: RentReminder({}),
  GeneralCommunication: GeneralCommunication({}),
  MaintenanceUpdate: MaintenanceUpdate({}),
};

async function main() {
  mkdirSync(outDir, { recursive: true });

  for (const [name, element] of Object.entries(templates)) {
    const html = await render(element);
    const outPath = join(outDir, `${name}.html`);
    writeFileSync(outPath, html, "utf-8");
    console.log(`Compiled: ${name}.html`);
  }

  console.log(`\nAll templates compiled to ${outDir}`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
