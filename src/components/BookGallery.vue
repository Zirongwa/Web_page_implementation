<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  works: { type: Array, required: true },
})

// ★ 頁面數量 = works 陣列筆數（到 works.js 加 / 刪）。頁面越多，越像密集的書本燈。
const N = computed(() => props.works.length)

// ★★ 滑鼠移到頁面上時的效果 ★★
const LIFT_UP = -55 // 升起多少（負數＝往上）
const LIFT_FORWARD = 70 // 往前多少
const LIFT_SCALE = 1.08 // 放大倍率
const SPREAD = 10 // 前後頁面展開的角度（越大開越多）
// （速度在下面 CSS 的 .card → transition: transform 0.5s）

const hovered = ref(null)
const album = ref(null)
const ring = ref(null)
const stage = ref(null)

// ★ 中空圓柱的「半徑」：數字越大，中間的洞越大、圓越大
//   想更空就調大、想更密就調小
const RADIUS = 280

// 頁面排在半徑 RADIUS 的外圈上，面向外 → 中心留空，形成中空圓柱
function cardTransform(i) {
  const base = (360 / N.value) * i
  let extra = 0
  let ty = 0
  let tz = 0
  let sc = 1
  if (hovered.value !== null) {
    const d = i - hovered.value
    if (d === 0) {
      ty = LIFT_UP
      tz = LIFT_FORWARD
      sc = LIFT_SCALE
    } else {
      const dir = d > 0 ? 1 : -1
      const falloff = Math.max(0, 1 - (Math.abs(d) - 1) * 0.4)
      extra = dir * SPREAD * falloff
    }
  }
  return `rotateY(${base + extra}deg) translateZ(${RADIUS + tz}px) translateY(${ty}px) scale(${sc})`
}

// === 旋轉狀態 ===
let curY = 0
let curX = -8
let tgtX = -8
let dragVel = 0
const autoSpin = 0.1
let raf = 0

let dragging = false
let lastX = 0
let moved = false

function loop() {
  if (album.value === null && hovered.value === null && !dragging) {
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
  tgtX = -8 + ((e.clientY - cy) / (r.height / 2)) * -10
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

function onEnter(i) {
  if (!dragging) hovered.value = i
}
function onLeave() {
  hovered.value = null
}
function onCard(i) {
  if (moved) {
    moved = false
    return
  }
  album.value = props.works[i]
}
function closeAlbum() {
  album.value = null
}
function onKey(e) {
  if (e.key === 'Escape') closeAlbum()
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
const isMp4 = (src) => typeof src === 'string' && src.endsWith('.mp4')
</script>

<template>
  <div class="gallery">
    <div ref="stage" class="stage" @pointerdown="onDown">
      <div ref="ring" class="ring">
        <button
          v-for="(item, i) in works"
          :key="item.id"
          class="card"
          :class="{ hovered: i === hovered }"
          :style="{ transform: cardTransform(i), zIndex: i === hovered ? 20 : 1 }"
          @mouseenter="onEnter(i)"
          @mouseleave="onLeave"
          @click="onCard(i)"
        >
          <img :src="item.image" :alt="item.title" draggable="false" />
          <span v-if="isVideo(item)" class="play">▶</span>
        </button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="album" class="overlay" @click.self="closeAlbum">
        <button class="close" @click="closeAlbum" aria-label="關閉">✕</button>
        <div class="album">
          <div class="media" :class="{ wide: isVideo(album) }">
            <template v-if="isVideo(album)">
              <video v-if="isMp4(album.video)" :src="album.video" controls autoplay playsinline></video>
              <iframe v-else :src="album.video" allow="autoplay; fullscreen" allowfullscreen></iframe>
            </template>
            <img v-else :src="album.image" :alt="album.title" />
          </div>
          <div class="meta">
            <p class="year">{{ album.year }}</p>
            <h3>{{ album.title }}</h3>
            <p class="role">{{ album.subtitle }}</p>
            <p class="desc">{{ album.description }}</p>
          </div>
        </div>
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
  perspective: 1100px;
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
  left: -80px; /* = 寬度一半，讓頁面置中 */
  top: -120px; /* = 高度一半 */
  width: 160px;
  height: 240px;
  border: none;
  padding: 0;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  background: #e7e3da;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.22);
  /* ↓ 控制升起 / 展開的速度，想更慢把 0.5s 調大 */
  transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s;
}
.card.hovered {
  box-shadow: 0 44px 80px rgba(0, 0, 0, 0.4);
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
  font-size: 26px;
  color: #fff;
  background: rgba(0, 0, 0, 0.25);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(20, 19, 15, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  backdrop-filter: blur(6px);
}
.close {
  position: absolute;
  top: 24px;
  right: 28px;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}
.album {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
  max-width: 1000px;
  width: 100%;
  align-items: center;
  color: var(--paper);
}
.media {
  aspect-ratio: 3 / 4;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
  background: #000;
}
.media.wide {
  aspect-ratio: 16 / 9;
}
.media img,
.media video,
.media iframe {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  display: block;
}
.meta .year {
  color: var(--accent);
  letter-spacing: 0.2em;
  font-size: 13px;
}
.meta h3 {
  font-family: 'Fraunces', serif;
  font-weight: 400;
  font-size: 40px;
  margin: 10px 0;
}
.meta .role {
  color: #c9c3b8;
  margin-bottom: 18px;
  letter-spacing: 0.04em;
}
.meta .desc {
  line-height: 1.7;
  color: #e7e2d8;
  font-size: 15px;
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
    perspective: 800px;
  }
  .card {
    width: 120px;
    height: 180px;
    top: -90px;
  }
  .album {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .media {
    aspect-ratio: 16 / 10;
  }
  .overlay {
    padding: 20px;
  }
}
</style>
