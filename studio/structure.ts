import type {StructureResolver} from 'sanity/structure'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const SINGLETONS = ['settings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('settings').title('Site Settings')),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.listItem()
        .title('Events')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Events')
            .items([
              S.listItem()
                .title('Upcoming')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .title('Upcoming events')
                    .schemaType('event')
                    .filter('_type == "event" && start >= now()')
                    .defaultOrdering([{field: 'start', direction: 'asc'}]),
                ),
              S.listItem()
                .title('Past')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .title('Past events')
                    .schemaType('event')
                    .filter('_type == "event" && start < now()')
                    .defaultOrdering([{field: 'start', direction: 'desc'}]),
                ),
              S.divider(),
              S.documentTypeListItem('event').title('All events'),
              S.documentTypeListItem('venue').title('Venues'),
            ]),
        ),
      S.listItem()
        .title('News')
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title('News')
            .items([
              S.documentTypeListItem('post').title('Posts'),
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('category').title('Categories'),
            ]),
        ),
    ])
