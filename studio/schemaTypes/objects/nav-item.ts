import {defineArrayMember, defineField, defineType} from 'sanity'
import {MenuIcon} from '@sanity/icons/Menu'
import {linkFields} from './link'

export const navItem = defineType({
  name: 'navItem',
  title: 'Navigation item',
  type: 'object',
  icon: MenuIcon,
  fields: [
    ...linkFields,
    defineField({
      name: 'children',
      title: 'Dropdown links',
      type: 'array',
      description: 'Optional. Shown in a dropdown under this item.',
      of: [defineArrayMember({type: 'link'})],
    }),
  ],
  preview: {
    select: {title: 'label', url: 'url', internal: 'internal.title', children: 'children'},
    prepare({title, url, internal, children}) {
      const count = children?.length ? ` · ${children.length} dropdown links` : ''
      return {title: title || 'Untitled', subtitle: `${internal || url || ''}${count}`}
    },
  },
})
