import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Public landing pages ──
    {
      url: 'https://soundmac.co',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://soundmac.co/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://soundmac.co/promotion',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://soundmac.co/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // ── Auth pages ──
    {
      url: 'https://soundmac.co/login',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://soundmac.co/register',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://soundmac.co/forgot-password',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}

// export default function sitemap(): MetadataRoute.Sitemap {
//   return [
//     // ── Public landing pages ──
//     {
//       url: "https://soundmac.co",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 1,
//     },
//     // {
//     //   url: "https://soundmac.co/features",
//     //   lastModified: new Date(),
//     //   changeFrequency: "monthly",
//     //   priority: 0.8,
//     // },
//     // {
//     //   url: "https://soundmac.co/pricing",
//     //   lastModified: new Date(),
//     //   changeFrequency: "monthly",
//     //   priority: 0.8,
//     // },
//     {
//       url: "https://soundmac.co/blog",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     // {
//     //   url: "https://soundmac.co/convert",
//     //   lastModified: new Date(),
//     //   changeFrequency: "weekly",
//     //   priority: 0.7,
//     // },

//     // {
//     //   url: "https://soundmac.co/promotion",
//     //   lastModified: new Date(),
//     //   changeFrequency: "weekly",
//     //   priority: 0.7,
//     // },
//     // __ Contact __
//     // {
//     //   url: "https://mail.google.com/mail/?view=cm&fs=1&to=Support@soundmac.co",
//     //   lastModified: new Date(),
//     //   changeFrequency: "weekly",
//     //   priority: 0.7,
//     // },

//     {
//       url: "https://wa.me/15558284080",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     // --- Streaming Platforms
//     // {
//     //   url: "https://www.instagram.com/soundmac.co?igsh=NHR4aGQzbmgxYWZ3",
//     //   lastModified: new Date(),
//     //   changeFrequency: "weekly",
//     //   priority: 0.7,
//     // },

//     // {
//     //   url: "https://x.com/soundmac_co?s=21&t=xue4BFErt0R6f5XgouoV-g",
//     //   lastModified: new Date(),
//     //   changeFrequency: "weekly",
//     //   priority: 0.7,
//     // },

//     {
//       url: "https://facebook.com/soundmac",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     {
//       url: "https://tiktok.com/@soundmac",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     {
//       url: "https://linkedin.com/company/soundmac",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     //--- legal

//     {
//       url: "https://sites.google.com/view/soundmac-legal/terms-condition",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     {
//       url: "https://sites.google.com/view/soundmac-privacy-policy/home",
//       lastModified: new Date(),
//       changeFrequency: "weekly",
//       priority: 0.7,
//     },

//     // ── Auth pages ──
//     {
//       url: "https://soundmac.co/login",
//       lastModified: new Date(),
//       changeFrequency: "yearly",
//       priority: 0.5,
//     },
//     {
//       url: "https://soundmac.co/register",
//       lastModified: new Date(),
//       changeFrequency: "yearly",
//       priority: 0.5,
//     },
//     {
//       url: "https://soundmac.co/forgot-password",
//       lastModified: new Date(),
//       changeFrequency: "yearly",
//       priority: 0.3,
//     },
//   ];
// }
