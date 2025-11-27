<!-- Begin Toast -->
<div 
  x-data
  class="fixed inset-0 flex flex-col items-end justify-end px-4 py-6 pointer-events-none z-50"
>
  <template x-for="t in $store.toasts.list" :key="t.id">
    <div
      x-show="t.visible"
      x-transition.opacity.duration.200ms
      x-transition.scale.duration.200ms
      class="mb-3 w-full max-w-sm rounded-xl shadow-lg pointer-events-auto border"
      :class="{
        'bg-green-50 text-green-700 border-green-200': t.type === 'success',
        'bg-red-50 text-red-700 border-red-200': t.type === 'error',
        'bg-blue-50 text-blue-700 border-blue-200': t.type === 'info',
        'bg-amber-50 text-amber-700 border-amber-200': t.type === 'warning',
      }"
    >
      <div class="px-4 py-3 flex items-center gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0 text-2xl flex items-center justify-center">
          <template x-if="t.type === 'success'">
            <i class="fa-solid fa-circle-check"></i>
          </template>
          <template x-if="t.type === 'error'">
            <i class="fa-solid fa-circle-xmark"></i>
          </template>
          <template x-if="t.type === 'info'">
            <i class="fa-solid fa-circle-info"></i>
          </template>
          <template x-if="t.type === 'warning'">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </template>
        </div>

        <!-- Message -->
        <div class="flex-1 leading-snug">
          <p class="text-sm font-medium" x-text="t.message"></p>
        </div>

        <!-- Close button -->
        <button
          type="button"
          class="ml-2 text-slate-400 hover:text-slate-600 flex items-center justify-center text-lg"
          @click="$store.toasts.hide(t.id)"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </template>
</div>
<!-- End Toast -->
</body>
</html>
