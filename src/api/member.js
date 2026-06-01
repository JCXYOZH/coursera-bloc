import { get } from '@/utils/request'

export default {
  checkMobile: mobile => get(`/api/student/user/checkMobile/${mobile}`)
}
