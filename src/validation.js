// Input rules shared by the React pages and the Express server.
// Each function returns an error message, or null when the value is fine.

export const SESSION_CODE_LENGTH = 6
export const USERNAME_MAX_LENGTH = 20
export const STORY_TITLE_MAX_LENGTH = 100
export const STORY_DESCRIPTION_MAX_LENGTH = 2000

export const validateSessionCode = (value) => {
  const code = typeof value === 'string' ? value.trim() : ''

  if (code === '') {
    return 'Please enter a session code.'
  }
  if (!/^\d+$/.test(code)) {
    return 'Session codes can only contain numbers.'
  }
  if (code.length !== SESSION_CODE_LENGTH) {
    return 'Session codes must be exactly 6 digits.'
  }
  return null
}

export const SESSION_NOT_FOUND_MESSAGE = "We couldn't find a session with that code."

// existingNames is optional; pass the names already in the room to check for duplicates.
export const validateUsername = (value, existingNames = []) => {
  const name = typeof value === 'string' ? value.trim() : ''

  if (name === '') {
    return 'Please enter a username.'
  }
  if (name.length > USERNAME_MAX_LENGTH) {
    return 'Username must be 20 characters or fewer.'
  }
  if (existingNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
    return 'That username is already being used in this session.'
  }
  return null
}

export const validateStoryTitle = (value) => (
  typeof value === 'string' && value.length > STORY_TITLE_MAX_LENGTH
    ? 'Story title must be 100 characters or fewer.'
    : null
)

export const validateStoryDescription = (value) => (
  typeof value === 'string' && value.length > STORY_DESCRIPTION_MAX_LENGTH
    ? 'Story description must be 2000 characters or fewer.'
    : null
)