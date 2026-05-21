import { createContext, useCallback, useContext, useMemo, useReducer } from 'react'

const GestureContext = createContext(null)
let externalDispatch = null

const initialState = {
  selectedIndex: 0,
  currency: 'USD',
  refreshTrigger: Date.now(),
  lastGesture: null,
  lastGestureAt: null,
  coinOrder: [],
  connectionStatus: 'idle',
  lastUpdated: null,
}

function clampIndex(index, count) {
  if (count <= 0) return 0
  return Math.min(Math.max(index, 0), count - 1)
}

function reducer(state, action) {
  switch (action.type) {
    case 'SCROLL_UP':
      return {
        ...state,
        selectedIndex: clampIndex(state.selectedIndex - 1, state.coinOrder.length),
        lastGesture: action.type,
        lastGestureAt: Date.now(),
      }
    case 'SCROLL_DOWN':
      return {
        ...state,
        selectedIndex: clampIndex(state.selectedIndex + 1, state.coinOrder.length),
        lastGesture: action.type,
        lastGestureAt: Date.now(),
      }
    case 'REFRESH':
      return {
        ...state,
        refreshTrigger: Date.now(),
        lastGesture: action.type,
        lastGestureAt: Date.now(),
      }
    case 'TOGGLE_CURRENCY':
      return {
        ...state,
        currency: state.currency === 'USD' ? 'NGN' : 'USD',
        lastGesture: action.type,
        lastGestureAt: Date.now(),
      }
    case 'FAVORITE': {
      const selectedCoin = state.coinOrder[state.selectedIndex]
      if (!selectedCoin) return state
      const coinOrder = [selectedCoin, ...state.coinOrder.filter((id) => id !== selectedCoin)]
      return {
        ...state,
        coinOrder,
        selectedIndex: 0,
        lastGesture: action.type,
        lastGestureAt: Date.now(),
      }
    }
    case 'SET_COIN_IDS': {
      const incoming = action.coinIds ?? []
      const known = state.coinOrder.filter((id) => incoming.includes(id))
      const next = [...known, ...incoming.filter((id) => !known.includes(id))]
      return {
        ...state,
        coinOrder: next,
        selectedIndex: clampIndex(state.selectedIndex, next.length),
      }
    }
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.status }
    case 'DATA_UPDATED':
      return { ...state, lastUpdated: action.at ?? Date.now() }
    default:
      return state
  }
}

export function GestureProvider({ children }) {
  const [gestureState, dispatch] = useReducer(reducer, initialState)

  const dispatchGesture = useCallback((action) => {
    if (!action) return
    dispatch(typeof action === 'string' ? { type: action } : action)
  }, [])

  externalDispatch = dispatchGesture

  const value = useMemo(
    () => ({ gestureState, dispatchGesture }),
    [gestureState, dispatchGesture],
  )

  return <GestureContext.Provider value={value}>{children}</GestureContext.Provider>
}

export function useGesture() {
  const context = useContext(GestureContext)
  if (!context) throw new Error('useGesture must be used inside GestureProvider')
  return context
}

export function dispatchGesture(action) {
  if (!externalDispatch) return
  externalDispatch(action)
}
