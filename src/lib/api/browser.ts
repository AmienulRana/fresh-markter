import { buildInit, parseResponse, toQueryString, type Requester } from './request'

export const browserRequest: Requester = async (path, options = {}) => {
  const url = `/api/gateway${path}${toQueryString(options.query)}`
  const response = await fetch(url, { ...buildInit(options), credentials: 'same-origin' })
  return parseResponse(response)
}
