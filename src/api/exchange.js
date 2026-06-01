import { post } from '@/utils/request'
export default {
  list: () => post('/api/student/exchange/list'),
  exchange: (itemId) => post('/api/student/exchange/do/' + itemId)
}
