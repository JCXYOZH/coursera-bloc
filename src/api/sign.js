import { post, postWithLoadTip } from '@/utils/request'

export default {
  sign: () => post('/api/student/sign/do'),
  getSignInfo: () => post('/api/student/sign/info'),
  invite: (mobile) => post('/api/student/sign/invite?mobile=' + mobile)
}
