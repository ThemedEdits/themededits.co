/* =========================================================
   Reusable portfolio data source — every project card /
   hero slide anywhere on the site reads from this array.
   Edit here, it reflects everywhere.
   ========================================================= */
const PORTFOLIO_ITEMS = [
  {
    id: "numeriq-global",
    title: "Numeriq Global",
    subtitle: "Portfolio Website + SEO",
    services: ["UI/UX Design", "Web Design", "Web Development", "SEO"],
    description: "A performance-first portfolio site built for a global consulting brand, paired with on-page SEO to get them found.",
    category: "web", // "web" | "graphics"
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
    thumbnail: "/assets/driftwork-hero.png",
    heroImage: "/assets/driftwork-hero.png",
    gallery: [
      "assets/portfolio/driftwork-1.jpg",
      "assets/portfolio/driftwork-2.jpg"
    ],
    link: "#"
  }
];