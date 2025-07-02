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
    ...nL, '/signIn'
]



export const linkRoutes: ROUTE_CONFIG = {
    'Home': '/',
    SignIn: '/signIn',
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