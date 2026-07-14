import PillNav from './reactbits/PillNav'
import { identity } from '../data/content'

const items = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Agent Lab', href: '#agent-lab' },
  { label: 'Beyond', href: '#beyond' },
  { label: 'Contact', href: '#contact' },
  { label: 'Resume', href: identity.resume },
]

export default function Nav() {
  return (
    <PillNav
      logo={identity.monogram}
      logoAlt="Harshith Vijayan — home"
      items={items}
      baseColor="#0C1322"
      hoverColor="#E63946"
      pillColor="#060A14"
      hoveredPillTextColor="#F2F4F8"
      pillTextColor="#8A94A8"
    />
  )
}
