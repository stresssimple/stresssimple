import * as path from 'path';
import * as fs from 'fs/promises';

export async function copyAsyncRecursive(
  fromFolder: string,
  toFolder: string,
): Promise<void> {
  try {
    await fs.mkdir(toFolder, { recursive: true });
    const items = await fs.readdir(fromFolder);

    for (const item of items) {
      const fromPath = path.join(fromFolder, item);
      const toPath = path.join(toFolder, item);
      const stats = await fs.stat(fromPath);

      if (stats.isFile()) {
        await fs.copyFile(fromPath, toPath);
      } else if (stats.isDirectory()) {
        await copyAsyncRecursive(fromPath, toPath);
      }
    }
  } catch (error) {
    console.error(`Error copying from ${fromFolder} to ${toFolder}:`, error);
    throw error;
  }
}
