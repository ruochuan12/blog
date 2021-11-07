import Typed from './Typed.vue'
import VueTypedJs from 'vue-typed-js'

export default ({ Vue }) => {
  // eslint-disable-next-line vue/match-component-file-name
  Vue.component('Typed', Typed)
  Vue.use(VueTypedJs)
}
