import {defineArrayMember, defineType} from 'sanity'

// A single-line heading where editors can italicize words (rendered in the serif italic).
export const headingText = defineType({
  name: 'headingText',
  title: 'Heading',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [{title: 'Italic', value: 'em'}],
        annotations: [],
      },
    }),
  ],
  validation: (rule) => rule.max(1).error('Headings are a single line'),
})
