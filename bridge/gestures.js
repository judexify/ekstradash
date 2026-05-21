import { DEBUG_GESTURES, THRESHOLDS } from './config.js'

export function createGestureInterpreter(onGesture) {
  let lastGestureAt = 0
  let gestureArmed = true
  let baseline = null
  let calibrationCount = 0
  let lastDebugAt = 0
  const calibrationTarget = 20
  const calibrationTotals = { ax: 0, ay: 0, az: 0 }

  function emitGesture(gesture, raw, debounce = THRESHOLDS.gestureCooldown) {
    const now = Date.now()
    if (now - lastGestureAt < debounce) return null
    lastGestureAt = now
    onGesture?.(gesture, raw)
    return gesture
  }

  return {
    ingest(raw) {
      if (!baseline) {
        calibrationTotals.ax += raw.ax
        calibrationTotals.ay += raw.ay
        calibrationTotals.az += raw.az
        calibrationCount += 1

        if (calibrationCount >= calibrationTarget) {
          baseline = {
            ax: calibrationTotals.ax / calibrationCount,
            ay: calibrationTotals.ay / calibrationCount,
            az: calibrationTotals.az / calibrationCount,
          }
          console.log(
            `[gesture] calibrated neutral ax=${baseline.ax.toFixed(2)} ay=${baseline.ay.toFixed(2)} az=${baseline.az.toFixed(2)}`,
          )
        }

        return null
      }

      const ax = raw.ax - baseline.ax
      const ay = raw.ay - baseline.ay
      const az = raw.az - baseline.az
      const absAx = Math.abs(ax)
      const absAy = Math.abs(ay)

      if (DEBUG_GESTURES && Date.now() - lastDebugAt > 250) {
        lastDebugAt = Date.now()
        console.log(
          `[gesture-debug] dx=${ax.toFixed(2)} dy=${ay.toFixed(2)} dz=${az.toFixed(2)} gx=${raw.gx.toFixed(2)} gy=${raw.gy.toFixed(2)} gz=${raw.gz.toFixed(2)}`,
        )
      }

      if (absAx <= THRESHOLDS.gestureNeutral && absAy <= THRESHOLDS.gestureNeutral) {
        gestureArmed = true
        return null
      }

      if (!gestureArmed) return null

      if (
        absAx >= THRESHOLDS.verticalGesture &&
        absAx >= absAy * THRESHOLDS.axisDominance
      ) {
        gestureArmed = false
        // Move the held board from top toward bottom of the screen.
        if (ax > 0) return emitGesture('SCROLL_DOWN', { ...raw, ax, ay })
        return emitGesture('SCROLL_UP', { ...raw, ax, ay })
      }

      if (
        absAy >= THRESHOLDS.horizontalGesture &&
        absAy >= absAx * THRESHOLDS.axisDominance
      ) {
        gestureArmed = false
        // Move the held board sideways to the right or left.
        if (ay > 0) return emitGesture('TOGGLE_CURRENCY', { ...raw, ax, ay })
        return emitGesture('REFRESH', { ...raw, ax, ay })
      }

      if (absAx >= THRESHOLDS.verticalGesture) {
        gestureArmed = false
        if (ax > 0) return emitGesture('SCROLL_DOWN', { ...raw, ax, ay })
        return emitGesture('SCROLL_UP', { ...raw, ax, ay })
      }

      if (absAy >= THRESHOLDS.horizontalGesture) {
        gestureArmed = false
        if (ay > 0) return emitGesture('TOGGLE_CURRENCY', { ...raw, ax, ay })
        return emitGesture('REFRESH', { ...raw, ax, ay })
      }

      return null
    },
  }
}
