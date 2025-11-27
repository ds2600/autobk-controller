
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

  <!-- Right -->
  <div class="flex items-center gap-2">
    <button
        class="text-gray-500 hover:text-gray-700"
        @click="searchTerm=''; page=1; load();"
        x-show="searchTerm"
    > ✕ </button>
    <input
        type="text"
        placeholder="Search..."
        class="border rounded px-2 py-1 mr-4 w-56"
        x-model="searchTerm"
        @input="debouncedSearch()"
    >
    
    <button
      class="px-2 py-1 rounded text-slate-700 hover:text-slate-500 disabled:hover:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      @click="prevPage()" 
      :disabled="page<=1"
    >
      <i class="fa-solid fa-chevron-left w-6 fill-current"></i>
      <span class="mr-2">Previous</span>
    </button>

    <span>Page <span x-text="page"></span> / <span x-text="pages"></span></span>

    <button
      class="px-2 py-1 rounded text-slate-700 hover:text-slate-500 disabled:hover:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      @click="nextPage()" 
      :disabled="page>=pages"
    >
      <span class="ml-2">Next</span>
      <i class="fa-solid fa-chevron-right w-6 fill-current"></i>
    </button>

    <select
      class="ml-4 border rounded px-2 py-1"
      x-model.number="pageSize"
      @change="changePageSize(pageSize)"
    >
      <option value="5">5 per page</option>
      <option value="10">10 per page</option>
      <option value="25">25 per page</option>
      <option value="50">50 per page</option>
    </select>
  </div>
</div>

