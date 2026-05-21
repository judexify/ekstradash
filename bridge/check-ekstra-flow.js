import dotenv from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { EKSTRA_PHONE_IMU_HEALTH_URL } from './config.js'

const bridgeDir = dirname(fileURLToPath(import.meta.url))
const rootEnv = resolve(bridgeDir, '..', '.env')
const bridgeEnv = resolve(bridgeDir, '.env')

dotenv.config({ path: existsSync(bridgeEnv) ? bridgeEnv : rootEnv, quiet: true })

async function readHealth() {
  const response = await fetch(EKSTRA_PHONE_IMU_HEALTH_URL)
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`)
  }
  return response.json()
}

try {
  const before = await readHealth()
  console.log('[ekstra-health] before', before)
  console.log('[ekstra-health] wait 5 seconds while bridge is posting samples...')
  await new Promise((resolveWait) => setTimeout(resolveWait, 5000))
  const after = await readHealth()
  console.log('[ekstra-health] after', after)

  const beforeCount = Number(before.ingest_count ?? 0)
  const afterCount = Number(after.ingest_count ?? 0)

  if (afterCount > beforeCount) {
    console.log(`[ekstra-health] flow confirmed: ingest_count ${beforeCount} -> ${afterCount}`)
  } else {
    console.log(`[ekstra-health] no count change observed: ingest_count ${beforeCount} -> ${afterCount}`)
  }
} catch (error) {
  console.log(`[ekstra-health] failed: ${error.message}`)
}
