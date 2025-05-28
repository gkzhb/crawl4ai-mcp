import ky from 'ky'

export interface CreateRequestOptions {
  authorization?: string
  baseUrl: string
}
export function createRequest(options: CreateRequestOptions) {
  return ky.create({
    prefixUrl: options.baseUrl,
    headers: options.authorization
      ? {
          Authorization: `Bearer ${options.authorization}`,
        }
      : undefined,
  })
}
