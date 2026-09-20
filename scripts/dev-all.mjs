/**
 * Starts the Vite frontend and the appointment API together:
 *   npm run dev:all
 * Ctrl+C stops both.
 */
import { spawn } from 'node:child_process'

// Single command string per process (no arg escaping through the shell).
const run = (script) => spawn(`npm run ${script}`, { stdio: 'inherit', shell: true, env: process.env })

// API first so the Vite proxy has a target as soon as the page loads.
const procs = [run('dev:api'), run('dev')]

const stopAll = () => {
  for (const p of procs) if (!p.killed) p.kill()
}

for (const p of procs) {
  p.on('exit', (code) => {
    stopAll()
    process.exit(code ?? 0)
  })
}
process.on('SIGINT', stopAll)
process.on('SIGTERM', stopAll)
