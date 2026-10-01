import {defineField, defineType} from 'sanity'
import {TextIcon} from '@sanity/icons/Text'
import {anchorField, headingPreview, sectionHeaderFields} from './shared'

export const textSection = defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  fields: [...sectionHeaderFields, defineField({name: 'body', type: 'blockContent'}), anchorField],
  preview: {
    select: {heading: 'heading'},
    prepare({heading}) {
      return {title: headingPreview(heading) || 'Text', subtitle: 'Text', media: TextIcon}
    },
  },
})
