import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

export const linkFields = [
  defineField({
    name: 'label',
    type: 'string',
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: 'linkType',
    title: 'Link type',
    type: 'string',
    initialValue: 'internal',
    options: {
      list: [
        {title: 'Internal', value: 'internal'},
        {title: 'External or path', value: 'external'},
      ],
      layout: 'radio',
      direction: 'horizontal',
    },
  }),
  defineField({
    name: 'internal',
    title: 'Page, post or event',
    type: 'reference',
    to: [{type: 'page'}, {type: 'post'}, {type: 'event'}],
    hidden: ({parent}) => parent?.linkType !== 'internal',
  }),
  defineField({
    name: 'url',
    title: 'URL',
    type: 'url',
    description: 'Full URL, a site path like /events, or an anchor like #season.',
    hidden: ({parent}) => parent?.linkType !== 'external',
    validation: (rule) =>
      rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
  }),
]

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: linkFields,
  preview: {
    select: {title: 'label', url: 'url', internal: 'internal.title'},
    prepare({title, url, internal}) {
      return {title: title || 'Untitled link', subtitle: internal || url}
    },
  },
})
