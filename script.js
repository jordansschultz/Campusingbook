// Carousel + Gallery script
document.addEventListener('DOMContentLoaded', function(){
  // HERO CAROUSEL
  const heroSlidesEl = document.getElementById('heroSlides');
  const heroDotsEl = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const overlay = document.getElementById('heroOverlay');

  // default hero images (existing uploads)
  // Hero images: use the newly added A730 photos only (exclude cover.jpg)
  const defaultHero = [
    'images/A7304461.jpeg',
    'images/A7304511.jpeg',
    'images/A7304597.jpeg',
    'images/A7304921-Enhanced-NR-2.jpeg'
  ];

  // also try numbered hero files (optional): hero-1..hero-6
  const extraHero = [];
  for(let i=1;i<=6;i++){
    extraHero.push(`images/hero-${i}.jpg`);
  }

  const candidates = defaultHero.concat(extraHero);
  const slides = [];

  function preloadImages(list, cb){
    let loaded = 0;
    list.forEach((src, idx)=>{
      const img = new Image();
      img.onload = ()=>{
        slides.push(src);
        loaded++;
        if(loaded === list.length){
          cb();
        }
      };
      img.onerror = ()=>{
        loaded++;
        if(loaded === list.length){
          cb();
        }
      };
      img.src = src;
    });
  }

  function buildCarousel(){
    if(slides.length === 0) return;
    slides.forEach((src, i)=>{
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Slide ${i+1}`;
      if(i===0) img.classList.add('active');
      heroSlidesEl.appendChild(img);

      const dot = document.createElement('button');
      dot.dataset.index = i;
      if(i===0) dot.classList.add('active');
      dot.addEventListener('click', ()=>{ goTo(i); resetAutoplay(); });
      heroDotsEl.appendChild(dot);
    });
  }

  let current = 0;
  let autoplayTimer = null;
  function show(index){
    const imgs = heroSlidesEl.querySelectorAll('img');
    const dots = heroDotsEl.querySelectorAll('button');
    if(!imgs.length) return;
    imgs.forEach((im, i)=> im.classList.toggle('active', i===index));
    dots.forEach((d,i)=> d.classList.toggle('active', i===index));
    current = index;
  }
  function goTo(index){
    const n = slides.length;
    index = ((index%n)+n)%n;
    show(index);
  }
  function prev(){ goTo(current-1); }
  function next(){ goTo(current+1); }

  prevBtn.addEventListener('click', ()=>{ prev(); resetAutoplay(); });
  nextBtn.addEventListener('click', ()=>{ next(); resetAutoplay(); });

  function startAutoplay(){
    stopAutoplay();
    autoplayTimer = setInterval(()=>{ next(); }, 4500);
  }
  function stopAutoplay(){ if(autoplayTimer) clearInterval(autoplayTimer); }
  function resetAutoplay(){ stopAutoplay(); startAutoplay(); }

  preloadImages(candidates, ()=>{
    // slides array filled in load order
    buildCarousel();
    startAutoplay();
  });

  // Pause on hover
  const heroEl = document.querySelector('.hero-carousel');
  if(heroEl){
    heroEl.addEventListener('mouseenter', ()=> stopAutoplay());
    heroEl.addEventListener('mouseleave', ()=> startAutoplay());
  }

  // GALLERY (buildering today) - tries gallery-1..gallery-50 and also includes buildering.jpg, author.jpg, cover.jpg
  const galleryEl = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');

  const galleryList = ['images/buildering.jpg','images/author.jpg','images/A7304921-Enhanced-NR-2.jpeg','images/cover.jpg'];
  const numbered = [];
  for(let i=1;i<=50;i++){
    numbered.push(`images/gallery-${i}.jpg`);
    numbered.push(`images/gallery-${i}.jpeg`);
  }

  function preloadGallery(list, cb){
    let loaded=0;
    list.forEach((src)=>{
      const img = new Image();
      img.onload = ()=>{ galleryList.push(src); loaded++; if(loaded===list.length) cb(); };
      img.onerror = ()=>{ loaded++; if(loaded===list.length) cb(); };
      img.src = src;
    });
  }

  // Pagination variables
  let currentPage = 0;
  const imagesPerPage = 9;
  
  function sortGalleryNewestFirst(){
    // Reverse the array so newest (highest numbered) images appear first
    galleryList.reverse();
  }
  
  function buildGallery(){
    const startIdx = currentPage * imagesPerPage;
    const endIdx = startIdx + imagesPerPage;
    const pageImages = galleryList.slice(startIdx, endIdx);
    
    galleryEl.innerHTML='';
    pageImages.forEach((src,i)=>{
      const actualIndex = startIdx + i;
      const img = document.createElement('img');
      img.src = src;
      img.alt = `Gallery image ${actualIndex+1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.dataset.index = actualIndex;
      img.addEventListener('click', ()=> openLightbox(actualIndex));
      galleryEl.appendChild(img);
    });
    
    updatePaginationControls();
  }
  
  function updatePaginationControls(){
    const totalPages = Math.ceil(galleryList.length / imagesPerPage);
    let paginationEl = document.getElementById('galleryPagination');
    
    if(!paginationEl){
      paginationEl = document.createElement('div');
      paginationEl.id = 'galleryPagination';
      paginationEl.className = 'gallery-pagination';
      galleryEl.parentElement.appendChild(paginationEl);
    }
    
    if(totalPages <= 1){
      paginationEl.style.display = 'none';
      return;
    }
    
    paginationEl.style.display = 'flex';
    paginationEl.innerHTML = `
      <button class="pagination-btn" id="galleryPrevPage" ${currentPage === 0 ? 'disabled' : ''}>‹ Previous</button>
      <span class="pagination-info">Page ${currentPage + 1} of ${totalPages}</span>
      <button class="pagination-btn" id="galleryNextPage" ${currentPage === totalPages - 1 ? 'disabled' : ''}>Next ›</button>
    `;
    
    document.getElementById('galleryPrevPage').addEventListener('click', ()=>{
      if(currentPage > 0){
        currentPage--;
        buildGallery();
        galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    
    document.getElementById('galleryNextPage').addEventListener('click', ()=>{
      if(currentPage < totalPages - 1){
        currentPage++;
        buildGallery();
        galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  let lbIndex = 0;
  function openLightbox(i){
    lbIndex = i;
    lbImg.src = galleryList[i];
    lightbox.setAttribute('aria-hidden','false');
  }
  function closeLightbox(){ lightbox.setAttribute('aria-hidden','true'); lbImg.src=''; }
  function lbPrevFn(){ lbIndex = (lbIndex-1+galleryList.length)%galleryList.length; lbImg.src=galleryList[lbIndex]; }
  function lbNextFn(){ lbIndex = (lbIndex+1)%galleryList.length; lbImg.src=galleryList[lbIndex]; }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', lbPrevFn);
  lbNext.addEventListener('click', lbNextFn);
  lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLightbox(); });

  preloadGallery(numbered, ()=>{
    sortGalleryNewestFirst();
    buildGallery();
  });

  // MOBILE MENU TOGGLE
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  
  if(menuToggle && mainNav){
    menuToggle.addEventListener('click', function(){
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
    
    // Close menu when clicking on a nav link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(){
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('active');
      });
    });
  }
});
