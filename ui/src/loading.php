  <div
    x-show="$store.load.n > 0"
    class="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50"
    x-transition.opacity
    style="display:none"
  >
    <div class="flex items-center gap-3 text-gray-700">
      <svg class="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity=".25"/>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4"/>
      </svg>
      <span class="font-medium">Loading…</span>
    </div>
  </div>
