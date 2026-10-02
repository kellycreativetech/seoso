import {defineDocuments, defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

// Mirrors the routes in web/src/app (and the LINK fragment in web/src/sanity/queries.ts).
const HOME_PAGE_FILTER = `_id == *[_id == "settings"][0].homePage._ref`

export const resolve: PresentationPluginOptions['resolve'] = {
  // Which document to open when the preview navigates to a route
  mainDocuments: defineDocuments([
    {route: '/', filter: `_type == "page" && ${HOME_PAGE_FILTER}`},
    {route: '/events', filter: `_type == "page" && slug.current == "events"`},
    {route: '/news', filter: `_type == "page" && slug.current == "news"`},
    {route: '/events/:slug', filter: `_type == "event" && slug.current == $slug`},
    {route: '/news/:slug', filter: `_type == "post" && slug.current == $slug`},
    {route: '/:slug', filter: `_type == "page" && slug.current == $slug`},
  ]),

  // Where each document appears on the site, shown in the document editor
  locations: {
    settings: defineLocations({
      message: 'Site Settings are used on every page (header, navigation and footer)',
      tone: 'positive',
      locations: [{title: 'Home', href: '/'}],
    }),
    page: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => {
        if (!doc?.slug) return null
        // The home page's own slug 308-redirects to `/`, so every page can use /<slug>
        return {locations: [{title: doc.title || 'Untitled', href: `/${doc.slug}`}]}
      },
    }),
    event: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{title: doc.title || 'Untitled', href: `/events/${doc.slug}`}] : []),
          {title: 'Events', href: '/events'},
          {title: 'Home (season schedule)', href: '/'},
        ],
      }),
    }),
    venue: defineLocations({
      select: {title: 'name'},
      resolve: () => ({
        locations: [
          {title: 'Events', href: '/events'},
          {title: 'Venues & directions', href: '/directions'},
        ],
      }),
    }),
    post: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{title: doc.title || 'Untitled', href: `/news/${doc.slug}`}] : []),
          {title: 'News', href: '/news'},
          {title: 'Home (latest news)', href: '/'},
        ],
      }),
    }),
  },
}
