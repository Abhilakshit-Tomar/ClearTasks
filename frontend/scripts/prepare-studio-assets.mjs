import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "../docs/design-assets/campus-garden-source.png");
const prompt = (
  await readFile(
    path.join(root, "../docs/design-assets/campus-garden.prompt.txt"),
    "utf8",
  )
).trim();
for (const width of [480, 960]) {
  const output = path.join(root, `src/assets/campus-garden-${width}.webp`);
  const info = await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78 })
    .withExif({
      IFD0: {
        ImageDescription: prompt,
        Software:
          "ClearTasks responsive asset pipeline; source produced by built-in ImageGen",
      },
    })
    .toFile(output);
  console.log(`${width}px garden: ${(info.size / 1024).toFixed(1)} KB`);
}
