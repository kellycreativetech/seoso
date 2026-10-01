import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const eventsSection = defineType({
  name: 'eventsSection',
  title: 'Events list',
  type: 'object',
  icon: CalendarIcon,
  fields: [
    ...sectionHeaderFields,
    defineField({name: 'note', type: 'inlineRichText', description: 'Shown beside the heading.'}),
    defineField({
      name: 'scope',
      type: 'string',
      initialValue: 'upcoming',
      options: {
        list: [
          {title: 'Upcoming events', value: 'upcoming'},
          {title: 'Past events', value: 'past'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'limit',
      type: 'number',
      description: 'Maximum number of events. Leave empty to show all.',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({name: 'footerLink', title: 'Footer link', type: 'link'}),
    defineField({
      name: 'disclaimer',
      type: 'string',
      description: 'Small print under the list, e.g. "Dates, times and programs subject to change."',
    }),
    anchorField,
  ],
  preview: {
    select: {heading: 'heading', scope: 'scope'},
    prepare({heading, scope}) {
      return {
        title: headingPreview(heading) || 'Events',
        subtitle: `Events list · ${scope === 'past' ? 'past' : 'upcoming'}`,
        media: CalendarIcon,
      }
    },
  },
})
