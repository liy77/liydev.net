import fs from 'fs/promises'
import path from 'path'

const ASSETS = [
  { src: '/Volumes/MCUDevDisk/copper-lang/assets/copperlang.png', dest: 'copper-lang.png' },
  { src: '/Volumes/MCUDevDisk/mocida/mocida/assets/banner.svg', dest: 'mocida.svg' },
  { src: '/Volumes/MCUDevDisk/OndaEngine/assets/onda-logo.png', dest: 'ondaengine.png' },
]

async function copy() {
  const uploadDir = path.join(process.cwd(), 'public/uploads')
  await fs.mkdir(uploadDir, { recursive: true })

  for (const asset of ASSETS) {
    try {
      await fs.copyFile(asset.src, path.join(uploadDir, asset.dest))
      console.log(`Copied ${asset.dest}`)
    } catch (err) {
      console.warn(`Failed to copy ${asset.dest}:`, err)
    }
  }
}

copy().catch(console.error)
