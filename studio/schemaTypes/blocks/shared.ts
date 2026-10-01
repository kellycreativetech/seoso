import {defineField} from 'sanity'

// Fields every page section shares: a small label, a heading, and an optional anchor.
export const sectionHeaderFields = [
  defineField({
    name: 'eyebrow',
    type: 'string',
    description: 'Small uppercase label above the heading.',
  }),
  defineField({
    name: 'heading',
    type: 'headingText',
    description: 'Select words and press ⌘I to set them in italics.',
  }),
]

export const anchorField = defineField({
  name: 'anchorId',
  title: 'Anchor ID',
  type: 'string',
  description: 'Optional. Lets links jump to this section, e.g. "season" for #season.',
  validation: (rule) =>
    rule.regex(/^[a-z0-9-]+$/, {name: 'lowercase letters, numbers and hyphens'}),
})

// Plain-text version of a headingText value for Studio previews.
export function headingPreview(heading?: {children?: {text?: string}[]}[]) {
  return heading?.[0]?.children?.map((child) => child.text).join('') || undefined
}
