<!-- src/components/PrimingScreen.vue -->
<template>
  <div class="priming-screen">
    <div class="priming-content">
      <h1>You are about to see Earth as astronauts see it.</h1>

      <p class="priming-text">
        Many who witness this view report a profound shift in perspective—
        a sense of awe, interconnectedness, and responsibility for our shared home.
      </p>

      <p class="priming-instruction">
        Take a deep breath.<br>
        Allow yourself to be fully present.<br>
        What you're about to witness may change how you see our world.
      </p>

      <button
        class="begin-journey"
        @click="handleReady"
        aria-label="Begin the journey"
      >
        I'm Ready
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['ready'])

const handleReady = () => {
  emit('ready')
}
</script>

<style scoped>
.priming-screen {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #000000, #0a0a1a);
  color: #e0e0e0;
  animation: fadeIn 2s ease-in;
}

.priming-content {
  max-width: 600px;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 2rem;
  line-height: 1.3;
}

.priming-text {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.priming-instruction {
  font-size: 1rem;
  line-height: 2;
  margin-bottom: 3rem;
  opacity: 0.8;
  font-style: italic;
}

.begin-journey {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.begin-journey:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
