import {defineArrayMember, defineField, defineType} from 'sanity'

// Short paragraphs (leads, notes) with bold, italic and links — no headings or media.
export const inlineRichText = defineType({
  name: 'inlineRichText',
  title: 'Short text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                validation: (rule) =>
                  rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
