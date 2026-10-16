import {defineArrayMember, defineType} from 'sanity'

type Decorator = {title: string; value: string}

const italic: Decorator = {title: 'Italic', value: 'em'}
const strike: Decorator = {title: 'Strikethrough', value: 'strike-through'}

// One block with the given inline marks; no styles, lists or links.
function headingBlock(decorators: Decorator[]) {
  return defineArrayMember({
    type: 'block',
    styles: [{title: 'Normal', value: 'normal'}],
    lists: [],
    marks: {decorators, annotations: []},
  })
}

// A single-line heading where editors can italicize words (rendered in the serif italic).
export const headingText = defineType({
  name: 'headingText',
  title: 'Heading',
  type: 'array',
  of: [headingBlock([italic])],
  validation: (rule) => rule.max(1).error('Headings are a single line'),
})

// headingText plus strikethrough, for crossed-out words (e.g. "I'm with the ~~band~~ Symphony").
export const headingTextWithStrike = defineType({
  name: 'headingTextWithStrike',
  title: 'Heading',
  type: 'array',
  of: [headingBlock([italic, strike])],
  validation: (rule) => rule.max(1).error('Headings are a single line'),
})
