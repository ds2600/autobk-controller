
<div class="flex justify-between items-center pb-4">
  <!-- Left -->
  <div class="flex">
    <button
      class="text-slate-800 hover:text-slate-500 focus:outline-none flex items-center mr-4"
      @click="load()"
    >
      <i class="fa-solid fa-arrows-rotate w-6 fill-current"></i>
      <span class="ml-2">Refresh</span>
    </button>
    <button 
      class="text-slate-800 hover:text-slate-500 focus:outline-none flex items-center mr-4"
      @click="toggleCreateForm()"
    >
      <i class="fa-solid fa-plus w-6 fill-current"></i>
      <span class="ml-2">Add Device</span>
    </button>
  </div>

</div>

