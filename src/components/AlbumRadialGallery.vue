<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  works: { type: Array, required: true },
})

const N = computed(() => props.works.length)
// 環的半徑：作品越多，環越大，才不會擠在一起
const radius = computed(() => Math.max(360, (N.value * 250) / (2 * Math.PI)))

const album = ref(null) // 目前打開的作品
const ring = ref(null) // 環的 DOM
const stage = ref(null)

// 每張卡片固定在環上的位置（平均分布一圈）
function cardTransform(i) {
  const angle = (360 / N.value) * i
  return `rotateY(${angle}deg) translateZ(${radius.value}px)`
}

// === 旋轉狀態 ===
let curY = 0 // 目前的水平旋轉角
let curX = -6 // 目前的傾斜角
let tgtX = -6 // 目標傾斜角（隨滑鼠上下變動）
let dragVel = 0 // 拖曳後的慣性速度
const autoSpin = 0.12 // 平常自動旋轉的速度
let raf = 0

// 拖曳狀態
let dragging = false
let lastX = 0
let moved = false

function loop() {
  if (!album.value && !dragging) {
    curY += autoSpin + dragVel
    dragVel *= 0.92 // 慣性衰減
  } else if (dragging) {
    // 拖曳時不自動轉，由 onMove 直接帶動
  }
  curX += (tgtX - curX) * 0.08 // 平滑趨近目標傾斜
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
  // 不論有沒有拖曳，滑鼠上下都會讓環傾斜
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

function onCard(i) {
  if (moved) {
    moved = false // 剛剛是在拖曳，不算點擊
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
          :style="{ transform: cardTransform(i) }"
          @click="onCard(i)"
        >
          <img :src="item.image" :alt="item.title" draggable="false" />
          <span v-if="isVideo(item)" class="play">▶</span>
        </button>
      </div>
    </div>

    <!-- 點開後的「專輯」展開頁 -->
    <transition name="fade">
      <div v-if="album" class="overlay" @click.self="closeAlbum">
        <button class="close" @click="closeAlbum" aria-label="關閉">✕</button>
        <div class="album">
          <div class="media" :class="{ wide: isVideo(album) }">
            <template v-if="isVideo(album)">
              <video
                v-if="isMp4(album.video)"
                :src="album.video"
                controls
                autoplay
                playsinline
              ></video>
              <iframe
                v-else
                :src="album.video"
                allow="autoplay; fullscreen"
                allowfullscreen
              ></iframe>
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
  min-height: 520px;
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
  left: -120px; /* = 寬度一半 */
  top: -160px; /* = 高度一半 */
  width: 240px;
  height: 320px;
  border: none;
  padding: 0;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
  background: #e7e3da;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.22);
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

/* 展開的專輯頁（和輪盤版相同） */
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
    min-height: 420px;
    perspective: 800px;
  }
  .card {
    width: 170px;
    height: 230px;
    left: -85px;
    top: -115px;
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
