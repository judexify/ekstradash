import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
} from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  EKSTRA_API_KEY,
  EKSTRA_BASE_URL,
  EKSTRA_PHONE_IMU_ENABLED,
  EKSTRA_PHONE_IMU_INGEST_URL,
} from './config.js'

const bridgeDir = dirname(fileURLToPath(import.meta.url))
const keypairPath = resolve(bridgeDir, 'keypair.json')
const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base64UrlToBuffer(value) {
  const padded = `${value}${'='.repeat((4 - (value.length % 4)) % 4)}`
  return Buffer.from(padded.replaceAll('-', '+').replaceAll('_', '/'), 'base64')
}

function base58(buffer) {
  let digits = [0]
  for (const byte of buffer) {
    let carry = byte
    for (let i = 0; i < digits.length; i += 1) {
      const value = digits[i] * 256 + carry
      digits[i] = value % 58
      carry = Math.floor(value / 58)
    }
    while (carry) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
    }
  }

  let output = ''
  for (const byte of buffer) {
    if (byte === 0) output += alphabet[0]
    else break
  }

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    output += alphabet[digits[i]]
  }

  return output
}

function canonicalStringify(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function loadOrCreateKeypair() {
  if (existsSync(keypairPath)) {
    const keypair = JSON.parse(readFileSync(keypairPath, 'utf8'))
    console.log('[ekstra] keypair loaded')
    return keypair
  }

  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const publicJwk = publicKey.export({ format: 'jwk' })
  const privateJwk = privateKey.export({ format: 'jwk' })
  const publicKeyRaw = base64UrlToBuffer(publicJwk.x)
  const keypair = {
    publicJwk,
    privateJwk,
    publicKeyHex: publicKeyRaw.toString('hex'),
    motionAddress: `ekst1${base58(publicKeyRaw)}`,
    createdAt: new Date().toISOString(),
  }

  writeFileSync(keypairPath, `${JSON.stringify(keypair, null, 2)}\n`)
  console.log('[ekstra] keypair loaded')
  return keypair
}

async function postJson(path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (EKSTRA_API_KEY) headers['X-Operator-Key'] = EKSTRA_API_KEY

  const response = await fetch(`${EKSTRA_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${response.status} ${text}`)
  }

  return response.json()
}

export async function createEkstraClient() {
  // EKSTRA_INTEGRATION_POINT
  const keypair = loadOrCreateKeypair()
  const privateKey = createPrivateKey({ key: keypair.privateJwk, format: 'jwk' })
  const publicKey = createPublicKey({ key: keypair.publicJwk, format: 'jwk' })
  let nonce = 0
  let phoneImuPosting = false
  let phoneImuSuccessLogged = false
  let lastPhoneImuErrorAt = 0

  async function registerDevice() {
    if (!EKSTRA_API_KEY) {
      console.log('[ekstra] EKSTRA_API_KEY missing; signed packets will not be posted')
      return
    }

    try {
      await postJson('/api/v1/devices/register', {
        motion_address: keypair.motionAddress,
        public_key_hex: keypair.publicKeyHex,
        device_type: 'custom_imu',
        role: 'input',
        name: 'EkstraDash Arduino MPU-6050',
      })
      console.log('[ekstra] device registration checked')
    } catch (error) {
      console.log(`[ekstra] registration skipped: ${error.message}`)
    }
  }

  await registerDevice()

  return {
    motionAddress: keypair.motionAddress,
    publicKey,
    async postPhoneImuSample(raw) {
      if (!EKSTRA_PHONE_IMU_ENABLED || phoneImuPosting) return

      phoneImuPosting = true

      try {
        const response = await fetch(EKSTRA_PHONE_IMU_INGEST_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_timestamp_ms: Date.now(),
            alpha: 0,
            beta: 0,
            gamma: 0,
            accel_x: raw.ax,
            accel_y: raw.ay,
            accel_z: raw.az,
            gyro_x: raw.gx,
            gyro_y: raw.gy,
            gyro_z: raw.gz,
            confidence: raw.shake ? 0.96 : 0.9,
          }),
        })

        if (!response.ok) {
          throw new Error(`${response.status} ${await response.text()}`)
        }

        if (!phoneImuSuccessLogged) {
          console.log('[ekstra] phone IMU ingest active')
          phoneImuSuccessLogged = true
        }
      } catch (error) {
        const now = Date.now()
        if (now - lastPhoneImuErrorAt > 5000) {
          console.log(`[ekstra] phone IMU ingest failed: ${error.message}`)
          lastPhoneImuErrorAt = now
        }
      } finally {
        phoneImuPosting = false
      }
    },
    async signAndIngest(gesture, raw) {
      const packet = {
        v: 1,
        src: keypair.motionAddress,
        ts: Date.now(),
        nonce: `${Date.now()}-${nonce += 1}`,
        schema: 'motion.primitive',
        payload: {
          primitive: gesture,
          confidence: raw.shake ? 0.96 : 0.88,
          source: 'ekstra-crypto-dash',
        },
      }

      const canonical = canonicalStringify(packet)
      const signature = sign(null, Buffer.from(canonical), privateKey)
      const signedPacket = { ...packet, sig: signature.toString('hex') }

      if (!EKSTRA_API_KEY) return signedPacket

      try {
        await postJson('/api/v1/runtime/packets/ingest', signedPacket)
        console.log(`[ekstra] packet ingested ${gesture}`)
      } catch (error) {
        console.log(`[ekstra] ingest failed: ${error.message}`)
      }

      return signedPacket
    },
  }
}
