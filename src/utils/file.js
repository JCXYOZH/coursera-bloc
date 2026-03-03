const BASE_FILE_URL = 'http://98730b7.r16.vip.cpolar.cn'
// const BASE_FILE_URL = 'http://localhost:8170'

export function getFileUrl(path) {
  if (!path) return ''

  if (path.startsWith('http')) {
    return path
  }

  if (path.startsWith('/')) {
    path = path.substring(1)
  }

  return BASE_FILE_URL + '/' + path
}
