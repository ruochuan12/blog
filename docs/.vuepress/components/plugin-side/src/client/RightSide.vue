<template>
  <div class="ruochuan12-side">
    <img class="ruochuan12-side-image" src="./images/ruochuan02.jpg"/>
	<div class="text-center">
    <!-- <vue-typed-js :loop="true"
        :typeSpeed="100"
      :backSpeed="20"
      :strings="['欢迎扫码加我微信']">
      <span class="typing"></span>
    </vue-typed-js> -->
    <span>欢迎扫码加我微信</span><br>
	<span>拉你进源码共读群</span><br>
	<span>一起学习源码</span><br>
	</div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
	name: 'RightSide',
});
</script>

<style lang="scss" scoped>
.text-center{
	text-align: center;
}
.ruochuan12-side {
//   background: #fff;
  padding: 10px;
  cursor: pointer;
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
  color: var(--theme-color);
  z-index: 2000;
  margin: 0 auto;
  text-align: center;
}
.ruochuan12-side-image{
	width: 120px;
	height: 120px;
	padding-left: 10px;
	display: block;
}

.ruochuan12-side:hover {
//   color: lighten(var(--theme-color), 30%);
//   color: lighten(var(--theme-color), 30%);
   font-weight: bold;
}
// 959px
@media (max-width: 1200px) {
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
