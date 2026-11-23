/* Generates the PWA icon set (PNG) from the inline SVG brand mark.
 * Runs during npm run build so no binary assets need to live in git.
 * Requires the `sharp` dev dependency. */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUT_DIR = path.resolve(process.cwd(), 'public/icons')

const mark = (radius) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8f80ea"/>
      <stop offset="0.55" stop-color="#6d5cd9"/>
      <stop offset="1" stop-color="#4a3bb8"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.25" r="0.9">
      <stop offset="0" stop-color="#c7bffb" stop-opacity="0.9"/>
      <stop offset="0.5" stop-color="#ab9ff2" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#ab9ff2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#bg)"/>
  <rect width="512" height="512" rx="${radius}" fill="url(#glow)"/>
  <g transform="translate(256 268)">
    <path d="M0 -132 C 18 -60 46 -22 86 -2 C 46 18 18 60 0 132 C -18 60 -46 18 -86 -2 C -46 -22 -18 -60 0 -132 Z"
          fill="#ffffff" fill-opacity="0.97"/>
    <circle cx="96" cy="-92" r="26" fill="#ffffff" fill-opacity="0.85"/>
    <circle cx="-104" cy="66" r="15" fill="#ffffff" fill-opacity="0.6"/>
  </g>
</svg>`

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8f80ea"/><stop offset="1" stop-color="#4a3bb8"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="16" fill="url(#b)"/>
  <g transform="translate(32 34)">
    <path d="M0 -17 C 2.4 -8 6 -3 11 0 C 6 3 2.4 8 0 17 C -2.4 8 -6 3 -11 0 C -6 -3 -2.4 -8 0 -17 Z" fill="#fff"/>
    <circle cx="13" cy="-12" r="3.4" fill="#fff" fill-opacity=".85"/>
  </g>
</svg>`

const jobs = [
  { name: 'pwa-192.png', size: 192, radius: 100 },
  { name: 'pwa-512.png', size: 512, radius: 108 },
  { name: 'maskable-512.png', size: 512, radius: 0 },
  { name: 'apple-touch-icon.png', size: 180, radius: 90 },
]

await mkdir(OUT_DIR, { recursive: true })

for (const job of jobs) {
  const svg = Buffer.from(mark(job.radius))
  await sharp(svg)
    .resize(job.size, job.size)
    .png()
    .toFile(path.join(OUT_DIR, job.name))
  console.log(`generated ${job.name}`)
}

await writeFile(path.join(OUT_DIR, 'favicon.svg'), FAVICON.trim() + '\n')
console.log('generated favicon.svg')
