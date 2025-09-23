// ===========================
// IMAGES PLACEHOLDER POUR LES SECTIONS MANQUANTES
// ===========================

// Utilisation d'images placeholder en attendant les vraies images
const PLACEHOLDER_BASE = 'https://via.placeholder.com';

export const placeholderImages = {
  // Testimonials
  testimonials: {
    background: `${PLACEHOLDER_BASE}/1920x800/f8f9fa/6c757d?text=Testimonials+Background`,
    gallery: [
      `${PLACEHOLDER_BASE}/150x150/007bff/ffffff?text=T1`,
      `${PLACEHOLDER_BASE}/150x150/28a745/ffffff?text=T2`,
      `${PLACEHOLDER_BASE}/150x150/dc3545/ffffff?text=T3`,
      `${PLACEHOLDER_BASE}/150x150/ffc107/000000?text=T4`,
      `${PLACEHOLDER_BASE}/150x150/6f42c1/ffffff?text=T5`
    ]
  },
  
  // Gallery
  gallery: [
    `${PLACEHOLDER_BASE}/400x300/007bff/ffffff?text=Gallery+1`,
    `${PLACEHOLDER_BASE}/400x300/28a745/ffffff?text=Gallery+2`,
    `${PLACEHOLDER_BASE}/400x300/dc3545/ffffff?text=Gallery+3`,
    `${PLACEHOLDER_BASE}/400x300/ffc107/000000?text=Gallery+4`,
    `${PLACEHOLDER_BASE}/400x300/6f42c1/ffffff?text=Gallery+5`
  ],
  
  // Video
  video: {
    background: `${PLACEHOLDER_BASE}/800x600/343a40/ffffff?text=Video+Background`
  },
  
  // Sponsors
  sponsors: [
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+1`,
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+2`,
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+3`,
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+4`,
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+5`,
    `${PLACEHOLDER_BASE}/200x100/f8f9fa/6c757d?text=Sponsor+6`
  ],
  
  // Funfact
  funfact: {
    background: `${PLACEHOLDER_BASE}/1920x600/007bff/ffffff?text=Statistics+Background`
  },
  
  // Blog
  blog: [
    `${PLACEHOLDER_BASE}/400x250/007bff/ffffff?text=Blog+Post+1`,
    `${PLACEHOLDER_BASE}/400x250/28a745/ffffff?text=Blog+Post+2`,
    `${PLACEHOLDER_BASE}/400x250/dc3545/ffffff?text=Blog+Post+3`
  ],
  
  // Newsletter
  newsletter: {
    background: `${PLACEHOLDER_BASE}/1920x400/343a40/ffffff?text=Newsletter+Background`
  }
};

export default placeholderImages;
