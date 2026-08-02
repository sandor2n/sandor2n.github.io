/**
 * Pixel Art Gallery App
 */

// Initial image list mapping all images in the `images` directory
const INITIAL_IMAGES = [
  { path: 'images/amiga/elf_amiga.png', name: 'Elf', category: 'amiga', system: 'Amiga' },
  { path: 'images/amiga/female_knight_amiga.png', name: 'Female knight', category: 'amiga', system: 'Amiga' },
  { path: 'images/amiga/monster_amiga.png', name: 'Monster', category: 'amiga', system: 'Amiga' },
  { path: 'images/amiga/orc2_amiga.png', name: 'Orc 2', category: 'amiga', system: 'Amiga' },
  { path: 'images/amiga/orc_amiga.png', name: 'Orc', category: 'amiga', system: 'Amiga' },
  { path: 'images/c64/delorean_c64.png', name: 'DeLorean C64', category: 'c64', system: 'C64' },
  { path: 'images/c64/seattle_c64.png', name: 'Seattle C64', category: 'c64', system: 'C64' },
  { path: 'images/c64/orc_c64.png', name: 'Orc', category: 'c64', system: 'C64' },
  { path: 'images/c64/space_c64.png', name: 'Space C64', category: 'c64', system: 'C64' },
  { path: 'images/c64/monster_c64_2.png', name: 'Monster', category: 'c64', system: 'C64' },
  { path: 'images/cga/delorean_cga.png', name: 'DeLorean CGA', category: 'cga', system: 'CGA' },
  { path: 'images/cga/parrot_cga.png', name: 'Parrot CGA', category: 'cga', system: 'CGA' },
  { path: 'images/cga/space_cga.png', name: 'Space CGA', category: 'cga', system: 'CGA' },
  { path: 'images/cga/woman.png', name: 'Woman', category: 'cga', system: 'CGA' },
  { path: 'images/ega/delorean_ega.png', name: 'DeLorean EGA', category: 'ega', system: 'EGA' },
  { path: 'images/ega/seattle_ega.png', name: 'Seattle EGA', category: 'ega', system: 'EGA' },
  { path: 'images/ega/space_ega.png', name: 'Space EGA', category: 'ega', system: 'EGA' },
  { path: 'images/zx/dungeon_zx_1 (1).png', name: 'Dungeon ZX #1', category: 'zx', system: 'ZX Spectrum' },
  { path: 'images/zx/dungeon_zx_2.png', name: 'Dungeon ZX #2', category: 'zx', system: 'ZX Spectrum' },
  { path: 'images/zx/dungeon_zx_3.png', name: 'Dungeon ZX #3', category: 'zx', system: 'ZX Spectrum' }
];

class GalleryApp {
  constructor() {
    this.images = [...INITIAL_IMAGES];
    this.filteredImages = [...INITIAL_IMAGES];
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.currentIndex = 0;
    this.pixelated = true;

    this.initElements();
    this.initEventListeners();
    this.updateCategoryCounts();
    this.render();
  }

  initElements() {
    this.gridContainer = document.getElementById('galleryGrid');
    this.filterTabs = document.getElementById('filterTabs');
    this.searchInput = document.getElementById('searchInput');
    this.pixelToggleBtn = document.getElementById('pixelToggleBtn');
    this.gridDensityBtns = document.querySelectorAll('.grid-density-btn');
    
    // Modal elements
    this.modal = document.getElementById('lightboxModal');
    this.modalImg = document.getElementById('modalImage');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalSystem = document.getElementById('modalSystem');
    this.modalPath = document.getElementById('modalPath');
    this.modalCloseBtn = document.getElementById('modalClose');
    this.modalPrevBtn = document.getElementById('modalPrev');
    this.modalNextBtn = document.getElementById('modalNext');
    this.modalDownloadBtn = document.getElementById('modalDownload');
  }

  initEventListeners() {
    // Filter Tabs
    this.filterTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      this.filterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.currentCategory = btn.dataset.category;
      this.filterImages();
    });

    // Search Input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.filterImages();
    });

    // Pixel Rendering Toggle
    this.pixelToggleBtn.addEventListener('click', () => {
      this.pixelated = !this.pixelated;
      document.body.classList.toggle('pixelated', this.pixelated);
      this.pixelToggleBtn.classList.toggle('active', this.pixelated);
      this.pixelToggleBtn.title = this.pixelated ? 'Pixel Crisp: ON' : 'Pixel Crisp: OFF';
    });

    // Grid Density Controls
    this.gridDensityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.gridDensityBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const mode = btn.dataset.density;
        this.gridContainer.className = `gallery-grid grid-${mode}`;
      });
    });

    // Modal Controls
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalPrevBtn.addEventListener('click', () => this.navigateModal(-1));
    this.modalNextBtn.addEventListener('click', () => this.navigateModal(1));

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (!this.modal.classList.contains('open')) return;
      if (e.key === 'Escape') this.closeModal();
      if (e.key === 'ArrowLeft') this.navigateModal(-1);
      if (e.key === 'ArrowRight') this.navigateModal(1);
    });
  }

  updateCategoryCounts() {
    const counts = { all: this.images.length };
    this.images.forEach(img => {
      counts[img.category] = (counts[img.category] || 0) + 1;
    });

    Object.keys(counts).forEach(cat => {
      const badge = document.getElementById(`count-${cat}`);
      if (badge) badge.textContent = counts[cat];
    });
  }

  filterImages() {
    this.filteredImages = this.images.filter(img => {
      const matchesCategory = (this.currentCategory === 'all') || (img.category === this.currentCategory);
      const matchesSearch = !this.searchQuery || 
        img.name.toLowerCase().includes(this.searchQuery) ||
        img.system.toLowerCase().includes(this.searchQuery) ||
        img.path.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });

    this.render();
  }

  render() {
    if (this.filteredImages.length === 0) {
      this.gridContainer.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3>No matching artwork found</h3>
          <p>Try clearing your search or selecting a different category filter.</p>
        </div>
      `;
      return;
    }

    this.gridContainer.innerHTML = this.filteredImages.map((img, index) => {
      const fileExt = img.path.split('.').pop();
      return `
        <article class="tile-card" data-index="${index}">
          <div class="tile-image-wrapper">
            <span class="sys-tag sys-${img.category}">${img.system}</span>
            <img class="tile-image" src="${img.path}" alt="${img.name}" loading="lazy">
          </div>
          <div class="tile-info">
            <h3 class="tile-title" title="${img.name}">${img.name}</h3>
            <span class="tile-ext">${fileExt}</span>
          </div>
        </article>
      `;
    }).join('');

    // Attach click handlers to tiles
    this.gridContainer.querySelectorAll('.tile-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index, 10);
        this.openModal(index);
      });
    });
  }

  openModal(index) {
    this.currentIndex = index;
    const imgData = this.filteredImages[this.currentIndex];
    if (!imgData) return;

    this.modalImg.src = imgData.path;
    this.modalImg.alt = imgData.name;
    this.modalTitle.textContent = imgData.name;
    
    this.modalSystem.textContent = imgData.system;
    this.modalSystem.className = `sys-tag sys-${imgData.category}`;
    this.modalPath.textContent = imgData.path;
    
    if (this.modalDownloadBtn) {
      this.modalDownloadBtn.href = imgData.path;
      this.modalDownloadBtn.download = imgData.name;
    }

    this.modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  navigateModal(direction) {
    if (this.filteredImages.length === 0) return;
    this.currentIndex = (this.currentIndex + direction + this.filteredImages.length) % this.filteredImages.length;
    this.openModal(this.currentIndex);
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('pixelated');
  window.galleryApp = new GalleryApp();
});
