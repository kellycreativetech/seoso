import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'details',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isNamedProgram',
      title: 'Title is a named program',
      type: 'boolean',
      group: 'details',
      description: 'Named concerts like "Home for the Holidays" are set in italics.',
      initialValue: false,
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'details',
      options: {
        source: (doc) => `${doc.title ?? ''} ${typeof doc.start === 'string' ? doc.start.slice(0, 10) : ''}`,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'start',
      title: 'Starts',
      type: 'datetime',
      group: 'details',
      description: 'Entered and shown in Eastern Time.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'end',
      title: 'Ends',
      type: 'datetime',
      group: 'details',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = context.document?.start
          if (end && typeof start === 'string' && end < start) return 'End must be after start'
          return true
        }),
    }),
    defineField({
      name: 'venue',
      type: 'reference',
      group: 'details',
      to: [{type: 'venue'}],
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      group: 'details',
      description: 'One or two lines for event listings, e.g. featured soloists.',
    }),
    defineField({
      name: 'admission',
      type: 'string',
      group: 'details',
      description: 'e.g. "Free" or "$20 · kids and students free"',
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Ticket link',
      type: 'url',
      group: 'details',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({name: 'body', type: 'blockContent', group: 'content'}),
    defineField({
      name: 'image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [
    {title: 'Date, newest first', name: 'startDesc', by: [{field: 'start', direction: 'desc'}]},
    {title: 'Date, oldest first', name: 'startAsc', by: [{field: 'start', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', start: 'start', venue: 'venue.name'},
    prepare({title, start, venue}) {
      const date = start
        ? new Date(start).toLocaleDateString('en-US', {
            dateStyle: 'medium',
            timeZone: 'America/New_York',
          })
        : 'No date'
      return {title, subtitle: [date, venue].filter(Boolean).join(' · ')}
    },
  },
})
