<template>
  <div class="ruochuan12-side">
    <img class="ruochuan12-side-image" src="./ruochuan12-qrcode.png"/>
	<div class="text-center">
    <vue-typed-js :loop="true" 
        :typeSpeed="100"    
      :backSpeed="20"
      :strings="['欢迎扫码加我微信']">
      <span class="typing"></span>
    </vue-typed-js>
    <!-- <span>欢迎扫码加我微信</span><br> -->
		<span>拉你进源码共读群</span><br>
		<span>一起学习源码</span><br>
	</div>
  </div>
</template>

<script>

export default {
  name: 'RightSide',

  props: {
  },

  data () {
    return {
    }
  },

  computed: {
  },

  mounted () {
  },

  methods: {
  }
}
</script>

<style lang='stylus' scoped>
.text-center{
	text-align: center;
}
.ruochuan12-side {
  background: #fff;
  padding: 10px;
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
