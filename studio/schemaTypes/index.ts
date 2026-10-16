import {blockContent} from './objects/block-content'
import {headingText, headingTextWithStrike} from './objects/heading-text'
import {inlineRichText} from './objects/inline-rich-text'
import {link} from './objects/link'
import {navItem} from './objects/nav-item'
import {seo} from './objects/seo'
import {contactSection} from './blocks/contact-section'
import {eventsSection} from './blocks/events-section'
import {gallerySection} from './blocks/gallery-section'
import {hero} from './blocks/hero'
import {highlightBand} from './blocks/highlight-band'
import {newsSection} from './blocks/news-section'
import {pageBuilder} from './blocks/page-builder'
import {peopleSection} from './blocks/people-section'
import {textSection} from './blocks/text-section'
import {venuesSection} from './blocks/venues-section'
import {videoSection} from './blocks/video-section'
import {author} from './documents/author'
import {category} from './documents/category'
import {event} from './documents/event'
import {page} from './documents/page'
import {post} from './documents/post'
import {settings} from './documents/settings'
import {venue} from './documents/venue'

export const schemaTypes = [
  // Documents
  settings,
  page,
  event,
  venue,
  post,
  author,
  category,
  // Page sections
  pageBuilder,
  hero,
  eventsSection,
  highlightBand,
  newsSection,
  textSection,
  peopleSection,
  contactSection,
  venuesSection,
  gallerySection,
  videoSection,
  // Objects
  blockContent,
  headingText,
  headingTextWithStrike,
  inlineRichText,
  link,
  navItem,
  seo,
]
