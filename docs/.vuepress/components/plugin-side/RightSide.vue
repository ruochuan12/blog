<template>
  <div class="ruochuan12-side">
    <img class="ruochuan12-side-image" src="./lxchuan12-qrcode.jpg"/>
	<div class="text-center">
		<span>扫码加我微信</span><br>
		<span>拉你进源码共读群</span><br>
		<span>一起学习源码</span><br>
	</div>
  </div>
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  name: 'RightSide',

  props: {
    threshold: {
      type: Number,
      default: 300
    }
  },

  data () {
    return {
      scrollTop: null
    }
  },

  computed: {
    show () {
      return this.scrollTop > this.threshold
    }
  },

  mounted () {
    this.scrollTop = this.getScrollTop()
    window.addEventListener('scroll', debounce(() => {
      this.scrollTop = this.getScrollTop()
    }, 100))
  },

  methods: {
    getScrollTop () {
      return window.pageYOffset
        || document.documentElement.scrollTop
        || document.body.scrollTop || 0
    },

    scrollToTop () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.scrollTop = 0
    }
  }
}
</script>

<style lang='stylus' scoped>
.text-center{
	text-align: center;
}
.ruochuan12-side {
  cursor: pointer;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: 1rem;
  color: $accentColor;
  z-index: 1;
}
.ruochuan12-side-image{
	width: 120px;
	height: 120px;
}

.ruochuan12-side:hover {
  color: lighten($accentColor, 30%);
}

@media (max-width: 959px) {
  .ruochuan12-side {
    display: none;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
