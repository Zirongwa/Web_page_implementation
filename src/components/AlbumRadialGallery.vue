<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  works: { type: Array, required: true },
})

// ★ 環裡有幾張卡片 = works 陣列裡有幾筆資料。
//   要增減卡片，就到 App.vue 的 works 陣列加 / 刪一段 { ... } 即可。
const N = computed(() => props.works.length)

// 環的半徑：卡片越多環越大，才不會擠在一起
const radius = computed(() => Math.max(340, (N.value * 250) / (2 * Math.PI)))

// ★★ 想調整「點擊後卡片抬起」的效果，改這三個數字 ★★
const LIFT_FORWARD = 170 // 往前移多少（越大 = 越靠近你、看起來越大張）
const LIFT_UP = -55 // 往上移多少（負數 = 往上）
const LIFT_SCALE = 1.12 // 放大倍率
// （移動的「速度快慢」是在下面 CSS 的 .card 那行 transition: transform 0.7s，
//   想更慢就把 0.7s 調大、更快就調小。）

const selected = ref(null) // 目前被選中（抬起）的卡片 index；null = 沒有
const ring = ref(null)
const stage = ref(null)

// 每張卡片在環上的位置；被選中的那張會往前 + 往上 + 放大
function cardTransform(i) {
  const angle = (360 / N.value) * i
  if (i === selected.value) {
    return `rotateY(${angle}deg) translateZ(${radius.value + LIFT_FORWARD}px) translateY(${LIFT_UP}px) scale(${LIFT_SCALE})`
  }
  return `rotateY(${angle}deg) translateZ(${radius.value}px)`
}

// === 旋轉狀態 ===
let curY = 0
let curX = -6
let tgtX = -6
let dragVel = 0
const autoSpin = 0.12
let raf = 0

let dragging = false
let lastX = 0
let moved = false

function loop() {
  // 有卡片被選中、或正在拖曳時，停止自動旋轉，讓抬起的卡片停在原地
  if (selected.value === null && !dragging) {
    curY += autoSpin + dragVel
    dragVel *= 0.92
  }
  curX += (tgtX - curX) * 0.08
  if (ring.value) {
    ring.value.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`
  }
  raf = requestAnimationFrame(loop)
}

function onDown(e) {
  dragging = true
  moved = false
  lastX = e.clientX
  dragVel = 0
}
function onMove(e) {
  const r = stage.value.getBoundingClientRect()
  const cy = r.top + r.height / 2
  tgtX = -6 + ((e.clientY - cy) / (r.height / 2)) * -12
  if (dragging) {
    const dx = e.clientX - lastX
    if (Math.abs(dx) > 3) moved = true
    curY += dx * 0.3
    dragVel = dx * 0.3
    lastX = e.clientX
  }
}
function onUp() {
  dragging = false
}

// 點卡片：點同一張 → 收回；點別張 → 換成那張抬起
function onCard(i) {
  if (moved) {
    moved = false
    return
  }
  selected.value = selected.value === i ? null : i
}
// 點空白處 → 收回
function onStageClick() {
  selected.value = null
}
function onKey(e) {
  if (e.key === 'Escape') selected.value = null
}

onMounted(() => {
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('keydown', onKey)
  loop()
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('keydown', onKey)
  cancelAnimationFrame(raf)
})

const isVideo = (item) => item?.type === 'video'
const current = computed(() => (selected.value === null ? null : props.works[selected.value]))
</script>

<template>
  <div class="gallery">
    <div ref="stage" class="stage" @pointerdown="onDown" @click.self="onStageClick">
      <div ref="ring" class="ring">
        <button
          v-for="(item, i) in works"
          :key="item.id"
          class="card"
          :class="{ lifted: i === selected }"
          :style="{ transform: cardTransform(i) }"
          @click="onCard(i)"
        >
          <img :src="item.image" :alt="item.title" draggable="false" />
          <span v-if="isVideo(item)" class="play">▶</span>
        </button>
      </div>
    </div>

    <!-- 被選中時，下方淡入顯示作品標題 -->
    <transition name="fade">
      <div v-if="current" class="caption">
        <h2>{{ current.title }}</h2>
        <p>{{ current.subtitle }}</p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.gallery {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stage {
  flex: 1;
  min-height: 56vh;
  perspective: 1700px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
  overflow: hidden;
}
.stage:active {
  cursor: grabbing;
}

.ring {
  position: relative;
  transform-style: preserve-3d;
  width: 0;
  height: 0;
  will-change: transform;
}

.card {
  position: absolute;
  left: -110px; /* = 寬度一半 */
  top: -150px; /* = 高度一半 */
  width: 220px;
  height: 300px;
  border: none;
  padding: 0;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  background: #e7e3da;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.22);
  /* ↓ 這行讓「抬起」的動作緩慢平滑；想更慢把 0.7s 調大 */
  transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s;
}
.card.lifted {
  box-shadow: 0 50px 90px rgba(0, 0, 0, 0.4);
  z-index: 10;
}
.card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
.card .play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
}

.caption {
  text-align: center;
  padding: 8px 20px 4px;
}
.caption h2 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: clamp(20px, 3vw, 30px);
}
.caption p {
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .stage {
    min-height: 48vh;
    perspective: 1100px;
  }
  .card {
    width: 160px;
    height: 220px;
    left: -80px;
    top: -110px;
  }
}
</style>
