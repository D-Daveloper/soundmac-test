import { LOCATION_TREE_ASSIGNOR, ROUTE_CONFIG } from "../type"


export const navigationLinks = [
    { name: 'Home', link: '/' },
    { name: 'Pricing', link: '/pricing' },
    { name: 'Promotion', link: '/promotion' },
    { name: 'Blog', link: '/blog' },
    { name: 'Convert', link: '/convert' },
]

const nL = navigationLinks.map(n => n.link)
export const rootScreenLinks = [
    ...nL,
]



export const linkRoutes: ROUTE_CONFIG = {
    'Home': '/',
    SignIn: '/login',
    SignUp: '/register',
    artists: {
        user: '/user/artists/create-artist',
        admin: '/admin/dashboard',
    },
}



export const USER_PORTAL_NAVIGATION_LINKS = {
    Artists: [
        { name: 'create artists', link: `/user/artists/create-artist` },
        { name: 'manage artists', link: `/user/artists/manage-artist` },
        { name: 'artist\'s insight', link: `/user/artists/insight` },
    ],

    Songs: [
        { name: 'upload songs', link: `/user/songs/upload-songs` },
        { name: 'manage songs', link: `/user/songs/manage-songs` },
    ],

    Albums: [
        { name: 'upload albums', link: `/user/songs/upload-albums` },
        { name: 'manage albums', link: `/user/songs/manage-albums` },
    ],

    '': [
        { name: 'sales report', link: `/user/sales/report` },
        { name: 'promotions', link: `/user/promotions/` },
        { name: 'advance', link: `/user/advance/` },
    ],
}


export const ADMIN_PORTAL_NAVIGATION_LINKS = {
    Artists: [
        { name: 'create artists', link: `/user/artists/create-artist` },
        { name: 'manage artists', link: `/user/artists/manage-artist` },
        { name: 'artist\'s insight', link: `/user/artists/insight` },
    ],

    Songs: [
        { name: 'upload songs', link: `/user/songs/upload-songs` },
        { name: 'manage songs', link: `/user/songs/manage-songs` },
    ],

    Albums: [
        { name: 'upload albums', link: `/user/songs/upload-albums` },
        { name: 'manage albums', link: `/user/songs/manage-albums` },
    ],

    '': [
        { name: 'sales report', link: `/user/sales/report` },
        { name: 'promotions', link: `/user/promotions/` },
        { name: 'advance', link: `/user/advance/` },
    ],
}

export const LOCATION_TREE: LOCATION_TREE_ASSIGNOR = {
    user: USER_PORTAL_NAVIGATION_LINKS,
    admin: ADMIN_PORTAL_NAVIGATION_LINKS
}



export const portalScreens = [
    ...Object.values(USER_PORTAL_NAVIGATION_LINKS).flatMap(section =>
      section.map(linkObj => linkObj.link)
    )
  ];
  export const genreList = [
  "African",
  "Afro-Beat",
  "Afro-Pop",
  "Alternative",
  "Alternative/Experimental",
  " Alternative/Gothic",
  "Alternative/Grunge",
  " Alternative/Indie Pop",
  "Alternative/Indie Rock",
  "Alternative/Rock",
  " Ambient/New Age",
  "Ambient/New Age/Meditation",
  "Blues",
  "Blues/Contemporary Blues",
  "Blues/New Orleans Blues",
  "Blues/Traditional Blues",
  "Children’s Music",
  "Children’s Music/Classic",
  "Children’s Music/Holiday",
  "Children’s Music/Stories",
  "Classical",
  "Classical/Antique",
  "Classical/Baroque",
  " Classical/Chamber",
  "Classical/Concert",
  "Classical/Modern Compositions",
  "Classical/Opera",
  "Classical/Orchestral",
  "Classical/Piano",
  "Classical/Romantic",
  "Comedy",
  "Country",
  "Country/Bluegrass",
  "Country/Contemporary",
  "Country/Honky Tonk",
  "Country/Nashville",
  "Country/Pop",
  "Country/Square Dance",
  "Easy Listening",
  "Easy Listening/Bar Jazz/Cocktail",
  "Easy Listening/Bossa Nova",
  "Easy Listening/Lounge",
  "Easy Listening/Traditional",
  "Electronic",
  "Electronic/Acid House",
  "Electronic/Breaks",
  "Electronic/Broken beat",
  "Electronic/Chill Out",
  "Electronic/DJ Tools/Sample Packs",
  "Electronic/Dance",
  "Electronic/Deep House",
  "Electronic/Downtempo – experimental",
  "Electronic/Drum & Bass",
  "Electronic/Dub/Reggae/Dancehall",
  "Electronic/Dubstep/Grime",
  "Electronic/Electro House",
  "Electronic/Glitch Hop",
  "Electronic/Hard Dance",
  "Electronic/Hard Techno",
  "Electronic/Hardcore",
  "Electronic/Hardstyle",
  "Electronic/House",
  "Electronic/Indie Dance/Nu Disco",
  "Electronic/Jazz",
  "Electronic/Minimal",
  "Electronic/Pop Trance",
  "Electronic/Progressive House",
  "Electronic/Psy-Trance",
  "Electronic/Tech House",
  "Electronic/Techno",
  "Electronic/Trance",
  "Electronic/Trip Hop",
  "Experimental",
  "Fitness&Workout",
  "Flamenco",
  "Folk",
  "Funk/R&B",
  "Hip-Hop/Rap",
  "Hip-Hop/Rap/Gangsta & Hardcore",
  "Holiday/Christmas",
  "Inspirational",
  "Jazz",
  "Jazz/Bebop",
  "Jazz/Big Band",
  "Jazz/Brazilian Jazz",
  "Jazz/Classic",
  "Jazz/Contemporary",
  "Jazz/Dixie/Rag Time",
  "Jazz/Free Jazz",
  "Jazz/Fusion",
  "Jazz/Jazz Funk",
  "Jazz/Latin Jazz",
  "Jazz/Nu Jazz/Acid Jazz",
  "Jazz/Smooth Jazz",
  "Jazz/Swing",
  "Jazz/Traditional",
  "Jazz/World",
  "Karaoke",
  "Latin",
  "Latin/Bachata",
  "Latin/Banda",
  "Latin/Big Band",
  "Latin/Bolero",
  "Latin/Bossa Nova",
  "Latin/Brasil/Tropical",
  "Latin/Christian",
  "Latin/Conjunto",
  "Latin/Corridos",
  "Latin/Cuban",
  "Latin/Cumbia",
  "Latin/Duranguense",
  "Latin/Electronica",
  "Latin/Grupero",
  "Latin/Hip Hop",
  "Latin/Latin Rap",
  "Latin/Mambo",
  "Latin/Mariachi",
  "Latin/Norteño",
  "Latin/Pop",
  "Latin/Ranchera",
  "Latin/Reggaeton",
  "Latin/Regional Mexicano",
  "Latin/Rock en Español",
  " Latin/Salsa",
  "Latin/Salsa/Merengue",
  "Latin/Sierreño",
  "Latin/Sonidero",
  "Latin/Tango",
  "Latin/Tejano",
  "Latin/Tierra Caliente",
  "Latin/Traditional Mexican",
  "Latin/Vallenato",
  "New Age",
  "Pop",
  "Pop/Contemporary/Adult",
  "Pop/J-Pop",
  "Pop/K-Pop",
  "Pop/Mandopop",
  "Pop/Singer Songwriter",
  "Punk",
  "R&B",
  "Reggae",
  "Rock",
  "Rock/Brit-Pop",
  "Rock/Classic",
  "Rock/Glam Rock",
  " Rock/Hard Rock/Heavy Metal",
  "Rock/Heavy Metal",
  "Rock/Progressive",
  "Rock/Rock ‘n’ Roll",
  "Rock/Singer/Songwriter",
  "Ska",
  "Soul",
  "Soundtrack",
  "Soundtrack/Anime",
  "Soundtrack/Musical",
  "Soundtrack/TV",
  "Spiritual",
  "Spiritual/Christian",
  "Spiritual/Gospel",
  "Spiritual/Gregorian",
  "Spiritual/India",
  "Spiritual/Judaica",
  "Spiritual/World",
  "Spoken Word/Speeches",
  "Trap",
  "Trap/Future Bass",
  "Trap/Future Bass/Twerk",
  "Vocal/Nostalgia",
  "World",
  "World/African",
  "World/Afro-Beat",
  "World/Afro-Pop",
  "World/Americas/Argentina",
  "World/Americas/Brazilian",
  "World/Americas/Brazilian/Axé",
  "World/Americas/Brazilian/Black Music",
  "World/Americas/Brazilian/Bossa Nova",
  "World/Americas/Brazilian/Chorinho",
  "World/Americas/Brazilian/Folk",
  "World/Americas/Brazilian/Funk Carioca",
  "World/Americas/Brazilian/MPB",
  "World/Americas/Brazilian/Marchinha",
  "World/Americas/Brazilian/Pagode",
  "World/Americas/Brazilian/Samba",
  "World/Americas/Brazilian/Samba-Rock",
  "World/Americas/Brazilian/Samba-de-Raiz",
  "World/Americas/Brazilian/Samba-enredo",
  "World/Americas/Brazilian/Sambalanço",
  "World/Americas/Cajun-Creole",
  "World/Americas/Calypso",
  "World/Americas/Colombia",
  "World/Americas/Cuba-Caribbean",
  "World/Americas/Mexican",
  "World/Americas/North-American",
  "World/Americas/Panama",
  "World/Americas/Peru",
  "World/Americas/South-American",
  "World/Arabic",
  "World/Asian/Central Asia",
  "World/Asian/China",
  "World/Asian/India",
  "World/Asian/India-Bollywood",
  "World/Asian/Japan",
  "World/Asian/South Asia",
  "World/Australian/Pacific",
  "World/Ethnic",
  "World/Europe/Eastern",
  "World/Europe/French",
  "World/Europe/German",
  "World/Europe/Northern",
  "World/Europe/Southern",
  "World/Europe/Spain",
  "World/Europe/Western",
  "World/Mediterranean/Greece",
  "World/Mediterranean/Italy",
  "World/Mediterranean/Spain",
  "World/Russian",
  "World/Worldbeat",
];

export const territories = [
    { label: "Nigeria", value: "ng" },
    { label: "Ghana", value: "gh" },
    { label: "South Africa", value: "za" },
    { label: "Kenya", value: "ke" },
    { label: "USA", value: "us" },
    { label: "UK", value: "uk" },
  ];


 // utils/debounce.ts
// export function debounce<F extends (...args: any[]) => void>(func: F, delay: number) {
//   let timer: ReturnType<typeof setTimeout>;

//   return (...args: Parameters<F>) => {
//     if (timer) clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// }
