const PORTFOLIO_ITEMS = [
  {
    id: "numeriq-global",
    title: "Numeriq Global",
    subtitle: "Portfolio Website + SEO",
    services: ["UI/UX Design", "Web Design", "Web Development", "SEO"],
    description: "A performance-first portfolio site built for a global consulting brand, paired with on-page SEO to get them found.",
    category: "web",
    type: "project",
    liveUrl: "https://numeriqglobal.org",
    thumbnail: "/assets/numeriq-global-hero.png",
    heroImage: "/assets/numeriq-global-hero.webp",
    gallery: [
      "/assets/numeriq-global-hero.png",
      "/assets/aurelia-hero.png",
      "/assets/driftwork-hero.png",
      "/assets/logo.png",
      "/assets/numeriq-global-hero.png",
      "/assets/numeriq-global-hero.png",
      "/assets/numeriq-global-hero.png"
    ],
    link: "#"
  },
  {
    id: "aurelia-branding",
    title: "Aurelia",
    subtitle: "Brand Identity + Packaging",
    services: ["UI/UX Design", "Web Design", "Web Development", "SEO"],
    description: "A full visual identity system, from logo mark to packaging, for a boutique skincare label.",
    category: "graphics",
    type: "project",
    thumbnail: "/assets/aurelia-hero.png",
    heroImage: "/assets/aurelia-hero.png",
    gallery: [
      "assets/portfolio/aurelia-1.jpg",
      "assets/portfolio/aurelia-2.jpg"
    ],
    link: "#"
  },
  {
    id: "driftwork-app",
    title: "Driftwork",
    subtitle: "Product Website + UI",
    services: ["UI/UX Design", "Web Design", "Web Development", "SEO"],
    description: "Marketing site and UI kit for a remote-work SaaS product, built for fast onboarding conversion.",
    category: "web",
    type: "project",
    thumbnail: "/assets/driftwork-hero.png",
    heroImage: "/assets/driftwork-hero.png",
    gallery: [
      "assets/portfolio/driftwork-1.jpg",
      "assets/portfolio/driftwork-2.jpg"
    ],
    link: "#"
  }
];

/* =========================================================
   Social media posters — single-image pieces. Clicking the
   card opens a fullscreen lightbox instead of a detail page.
   ========================================================= */
const SOCIAL_POSTERS = [
  {
    id: "poster-01",
    title: "Launch Day Promo",
    subtitle: "Instagram Post",
    category: "graphics",
    type: "poster",
    thumbnail: "/assets/logo.png",
    fullImage: "/assets/logo.png"
  },
  {
    id: "poster-02",
    title: "Weekend Sale",
    subtitle: "Instagram Story",
    category: "graphics",
    type: "poster",
    thumbnail: "/assets/posters/poster-02.jpg",
    fullImage: "/assets/posters/poster-02.jpg"
  },
  {
    id: "poster-03",
    title: "New Collection",
    subtitle: "Facebook Post",
    category: "graphics",
    type: "poster",
    thumbnail: "/assets/posters/poster-03.jpg",
    fullImage: "/assets/posters/poster-03.jpg"
  }
];

const ALL_PORTFOLIO_ITEMS = [...PORTFOLIO_ITEMS, ...SOCIAL_POSTERS];