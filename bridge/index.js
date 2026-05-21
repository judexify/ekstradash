import { createSerialStream } from './serial.js'
import { createGestureInterpreter } from './gestures.js'
import { createEkstraClient } from './ekstra.js'
import { createEkstraCloudProbe } from './ekstra-cloud-ws.js'
import { createGestureSocket } from './ws.js'

const serial = createSerialStream()
const ekstra = await createEkstraClient()
createEkstraCloudProbe()
const ws = createGestureSocket()
const gestures = createGestureInterpreter(async (gesture, raw) => {
  console.log(`[gesture] ${gesture} ax=${raw.ax} ay=${raw.ay} shake=${raw.shake}`)
  ws.broadcast(gesture)
  await ekstra.signAndIngest(gesture, raw)
})

serial.on('sample', (sample) => {
  void ekstra.postPhoneImuSample(sample)
  gestures.ingest(sample)
})
