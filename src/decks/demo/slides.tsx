import type { Slide } from '../../engine/types.ts'
import { parsePresenterNotes } from '../../engine/parsePresenterNotes.ts'
import {
  BulletBoard, ClosingSlide, DataTable, ImageSlide, QuoteSlide,
  ScreenshotPairSlide, SectionSlide, StatBoard, StatementSlide,
  TerminalSlide, TimelineSlide, TitleSlide, TwoColumn,
} from '../../kit/index.ts'
import { InteractiveDemo } from './InteractiveDemo'
import { notesConfig } from './notes.config.ts'
import notesSource from './notes.md?raw'
import detail from './assets/screen-detail.svg'
import list from './assets/screen-list.svg'
import steps from './assets/screen-steps.svg'
import repoQr from './assets/repo-qr.svg'
import linkedinQr from './assets/linkedin-qr.svg'

// The living reference: every kit layout, with sample content. Copy from here
// when building a new deck. Nothing on these slides is real product evidence.
const slideDefinitions: Slide[] = [
  { id: 'title', element: <TitleSlide kicker="slide kit / demo" title="a place for your story." subtitle="every layout in the kit, filled with sample content. open the presenter view to see timed notes." date="september 2026" /> },
  { id: 'section', element: <SectionSlide number="01" title="start with one idea." /> },
  { id: 'statement', element: <StatementSlide kicker="statement layout">one clear sentence.<br /><em>give it room.</em></StatementSlide> },
  { id: 'bullets', element: <BulletBoard kicker="bullet board" title="how a deck gets made." items={[
    { lead: 'chat', body: 'the agent asks a few questions about audience, length and message.' },
    { lead: 'outline', body: 'you agree on one line per slide before anything is built.' },
    { lead: 'build', body: 'slides are composed from the kit, with timed speaker notes.' },
    { lead: 'check', body: 'lint, tests and build pass, then you walk the deck in a browser.' },
  ]} /> },
  { id: 'bullets-state', element: <BulletBoard kicker="status labels" title="say what the data means." items={[
    { lead: 'live', state: 'live', body: 'a current update.' },
    { lead: 'scheduled', state: 'scheduled', body: 'a planned value, not a measured one.' },
    { lead: 'stale', state: 'stale', body: 'an older update, shown with its limits.' },
  ]} /> },
  { id: 'two-column', element: <TwoColumn kicker="two-column layout" title="a short story, with context." ratio={[3, 2]}
    left={<p>use the wide column for the story you will tell out loud. keep it to two or three sentences.</p>}
    right={<p>use the narrow column for context: a caveat, a source or a follow-up.</p>} /> },
  { id: 'timeline', element: <TimelineSlide kicker="milestones / sample sequence" title="show where the work is heading." stops={[
    { date: 'start', label: 'find the problem', detail: 'sample stop', state: 'past' },
    { date: 'build', label: 'make a prototype', detail: 'sample stop', state: 'past' },
    { date: 'now', label: 'test with people', detail: 'current focus', state: 'current' },
    { date: 'next', label: 'launch', detail: 'planned next step', state: 'future' },
  ]} /> },
  { id: 'table', element: <DataTable kicker="layout reference" title="choose the shape of the story." columns={['content', 'layout', 'use it for']} accentCol={1} rows={[
    ['one idea', 'statement', 'a clear takeaway'],
    ['a list', 'bullet board', 'three to five points'],
    ['product', 'screenshot pair', 'large, readable screens'],
    ['journey', 'timeline', 'milestones and next steps'],
    ['interaction', 'shadcn/ui', 'working React controls'],
  ]} /> },
  { id: 'stats', element: <StatBoard kicker="numbers / this canvas" title="use numbers you can support." stats={[
    { value: '1280', label: 'canvas width / px' },
    { value: '720', label: 'canvas height / px' },
    { value: '16:9', label: 'slide aspect ratio' },
  ]} /> },
  { id: 'terminal', element: <TerminalSlide kicker="authoring" title="build it in React." header="local workflow / commands to run" lines={[
    { kind: 'cmd', text: 'npm install' },
    { kind: 'cmd', text: 'npm run dev' },
    { kind: 'note', text: 'Compose kit layouts in src/decks/<slug>/slides.tsx.' },
    { kind: 'cmd', text: 'npm run check' },
    { kind: 'note', text: 'Walk every slide and test the presenter window before presenting.' },
  ]} /> },
  { id: 'quote', element: <QuoteSlide kicker="quote layout" quote="a short line someone actually said." attribution="placeholder attribution / replace with a real source" /> },
  { id: 'image', element: <ImageSlide kicker="single image" title="let one picture do the talking." src={list} caption="sample screen / replace with your own" /> },
  { id: 'screenshot-pair', element: <ScreenshotPairSlide kicker="two screenshots" title="from overview to detail." left={{ label: 'overview', src: list, alt: 'Sample overview screen' }} right={{ label: 'detail', src: detail, alt: 'Sample detail screen' }} /> },
  { id: 'screenshot-pair-aside', element: <ScreenshotPairSlide kicker="screens with context" title="give phone screens the full height." lead="short supporting copy on the left. two phone screens on the right, sized by their aspect ratio." left={{ label: 'detail', src: detail, alt: 'Sample detail screen', aspect: '1206 / 2622' }} right={{ label: 'progress', src: steps, alt: 'Sample progress screen', aspect: '1206 / 2622' }} /> },
  { id: 'interactive', element: <InteractiveDemo /> },
  { id: 'closing', element: <ClosingSlide kicker="the ask" title="thanks for listening." contact={['your name / your role', 'example.com']} cta="let’s talk." /> },
  { id: 'closing-codes', element: <ClosingSlide kicker="links" title="make your own." cta="scan to open" codes={[
    { src: repoQr, label: 'source code', caption: 'github.com/immanuel-lam/slide-decks', tag: 'open source', alt: 'QR code for the slide-decks repository on GitHub' },
    { src: linkedinQr, label: 'say hi', caption: 'linkedin.com/in/addimmanuellam', alt: 'QR code for Immanuel Lam on LinkedIn' },
  ]} /> },
]

const presenterNotes = parsePresenterNotes(notesSource, notesConfig)

export const slides: Slide[] = slideDefinitions.map((definition, index) => ({
  ...definition,
  presenter: presenterNotes[index],
}))
