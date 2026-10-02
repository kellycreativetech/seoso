import { defineQuery } from "next-sanity";

const IMAGE = /* groq */ `
  asset->{ _id, metadata { lqip, dimensions { width, height } } },
  alt,
  hotspot,
  crop
`;

// Resolves a `link` (or `navItem`) to an href. Keep in sync with the routes in src/app.
const LINK = /* groq */ `
  _key,
  label,
  "href": select(
    linkType == "internal" && internal->_type == "post" => "/news/" + internal->slug.current,
    linkType == "internal" && internal->_type == "event" => "/events/" + internal->slug.current,
    linkType == "internal" && internal._ref == *[_id == "settings"][0].homePage._ref => "/",
    linkType == "internal" => "/" + internal->slug.current,
    url
  )
`;

const SEO = /* groq */ `
  seo { title, description, noIndex, image { ${IMAGE} } }
`;

const EVENT_SUMMARY = /* groq */ `
  _id,
  title,
  isNamedProgram,
  "slug": slug.current,
  start,
  end,
  summary,
  admission,
  venue->{ name, city }
`;

const POST_SUMMARY = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  summary,
  facts[]{ _key, label, value }
`;

export const SETTINGS_QUERY = defineQuery(`
  *[_id == "settings"][0]{
    title,
    organizationName,
    tagline,
    description,
    logo { ${IMAGE} },
    defaultSeoImage { ${IMAGE} },
    navigation[]{ ${LINK}, children[]{ ${LINK} } },
    donateLink { ${LINK} },
    footerNavigation[]{ ${LINK} },
    mailingAddress,
    email,
    socialLinks[]{ _key, platform, url }
  }
`);

const PAGE_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  ${SEO},
  content[]{
    _key,
    _type,
    _type == "hero" => {
      eyebrow,
      heading,
      lead,
      actions[]{ ${LINK} },
      image { ${IMAGE} }
    },
    _type == "eventsSection" => {
      eyebrow,
      heading,
      note,
      scope,
      limit,
      footerLink { ${LINK} },
      disclaimer,
      anchorId
    },
    _type == "highlightBand" => { figure, eyebrow, heading, body, actions[]{ ${LINK} } },
    _type == "newsSection" => { eyebrow, heading, limit, footerLink { ${LINK} }, anchorId },
    _type == "textSection" => { eyebrow, heading, body, anchorId },
    _type == "peopleSection" => {
      eyebrow,
      heading,
      intro,
      people[]{ _key, name, role, email },
      anchorId
    },
    _type == "contactSection" => {
      eyebrow,
      heading,
      intro,
      contacts[]{ _key, purpose, name, email, phone },
      anchorId
    },
    _type == "venuesSection" => {
      eyebrow,
      heading,
      intro,
      venues[]->{ _id, name, city, address, directions, website, image { ${IMAGE} } },
      anchorId
    },
    _type == "gallerySection" => {
      eyebrow,
      heading,
      intro,
      images[]{ _key, caption, ${IMAGE} },
      anchorId
    },
    _type == "videoSection" => {
      eyebrow,
      heading,
      videos[]{ _key, title, description, youtubeId },
      anchorId
    }
  }
`;

export const HOME_PAGE_QUERY = defineQuery(`
  *[_id == "settings"][0].homePage->{ ${PAGE_FIELDS} }
`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    ${PAGE_FIELDS},
    "isHomePage": _id == *[_id == "settings"][0].homePage._ref
  }
`);

// Excludes the home page and the listing pages, which have their own routes.
export const PAGE_SLUGS_QUERY = defineQuery(`
  *[
    _type == "page"
    && defined(slug.current)
    && !(slug.current in ["events", "news"])
    && _id != *[_id == "settings"][0].homePage._ref
  ]{ "slug": slug.current }
`);

export const UPCOMING_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && start >= $now] | order(start asc)[0...$limit]{ ${EVENT_SUMMARY} }
`);

export const PAST_EVENTS_QUERY = defineQuery(`
  *[_type == "event" && start < $now] | order(start desc)[0...$limit]{ ${EVENT_SUMMARY} }
`);

export const EVENT_QUERY = defineQuery(`
  *[_type == "event" && slug.current == $slug][0]{
    ${EVENT_SUMMARY},
    ticketUrl,
    body,
    image { ${IMAGE} },
    "venueDetails": venue->{ name, city, address, directions, website },
    ${SEO}
  }
`);

export const EVENT_SLUGS_QUERY = defineQuery(`
  *[_type == "event" && defined(slug.current)]{ "slug": slug.current }
`);

export const LATEST_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...$limit]{ ${POST_SUMMARY} }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    ${POST_SUMMARY},
    mainImage { ${IMAGE} },
    body,
    author->{ name, role },
    categories[]->{ _id, title },
    ${SEO}
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`);
