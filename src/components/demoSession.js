export const DEMO_SESSION_CODE = 'JACOBS-26'

export const normalizeSessionCode = (sessionCode) => sessionCode.trim().toUpperCase()

export const isValidDemoSessionCode = (sessionCode) => (
  normalizeSessionCode(sessionCode) === DEMO_SESSION_CODE
)