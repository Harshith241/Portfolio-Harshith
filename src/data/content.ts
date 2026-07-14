// Single source of truth for every string on the site. From PLAN.md §Content — do not paraphrase numbers.

export const identity = {
  name: 'Harshith Vijayan',
  monogram: 'hv.',
  location: 'PHOENIX, AZ — CS @ ASU ’28',
  status: 'OPEN TO SWE INTERNSHIPS',
  roles: ['Software Engineer', 'AI Agent Builder', 'Founder @ Chairside', 'Full-Stack Developer'],
  tagline: 'I build agents that answer phones, book calendars, and ship to production.',
  email: 'hvijayan@asu.edu',
  github: 'https://github.com/Harshith241',
  linkedin: 'https://www.linkedin.com/in/harshithvijayan/',
  resume: '/resume.pdf',
}

export const about = {
  paragraphs: [
    'I’m a CS sophomore at ASU who’d rather ship than speculate. I founded Chairside, a voice-AI platform that answers missed calls for dental practices and books appointments on its own — 3 paying clients and counting.',
    'My lane is AI agents that touch the real world: MCP servers, tool-calling pipelines, LangChain reasoning layers, and the unglamorous production work (idempotency, timezones, caller-ID truth) that makes them reliable.',
    'Before that: full-stack work at Publicis Sapient, an AR navigation app used by 500+ botanical-garden visitors, and an SWE internship at Tekplanit building calendar MCP tooling and an AI sales agent.',
  ],
  stats: [
    { value: 4.0, label: 'GPA', decimals: 1 },
    { value: 3, label: 'clients on my SaaS' },
    { value: 300, label: 'hackathon participants engaged', suffix: '+' },
    { value: 500, label: 'top hackathon prize', prefix: '$' },
  ],
}

export const experience = [
  {
    company: 'Tekplanit',
    role: 'Software Engineering Intern',
    where: 'Remote',
    when: 'Dec 2025 — Feb 2026',
    bullets: [
      'Built a dynamic MCP server with FastMCP exposing Google Calendar tools — scheduling, rescheduling, cancellations, availability.',
      'Architected an AI sales-calling agent with LangChain: tool-driven reasoning, conversational memory, separated LLM reasoning/execution layers.',
      'Designed agent workflows for meeting orchestration and follow-ups; explored AWS (EC2/S3) containerized deployment.',
    ],
    chips: ['FastMCP', 'LangChain', 'Python', 'AWS', 'Next.js'],
  },
  {
    company: 'ACM at ASU',
    role: 'Industry Coordinator',
    where: 'Tempe, AZ',
    when: 'Jan 2026 — Present',
    bullets: [
      'Intern → Contributor → Coordinator in 3 months, running end-to-end industry outreach.',
      'Contributed to GlobeHack (300+ participants); secured 5+ industry speakers and sponsors.',
    ],
    chips: ['Outreach', 'Leadership', 'Events'],
  },
  {
    company: 'Publicis Sapient (GCA)',
    role: 'Full-Stack Developer',
    where: 'Remote',
    when: 'Mar 2025 — May 2025',
    bullets: [
      'Developed personalized booking flows for 3 user archetypes with Vanilla JS, Bootstrap 5, and OpenLayers — reducing first-click friction for 65% of undecided travelers.',
      'Converted wireframes into reusable JS modules with a 100% unit-test pass rate, cutting prototyping time by 50%.',
    ],
    chips: ['JavaScript', 'Bootstrap', 'OpenLayers', 'Testing'],
  },
]

export const flagship = {
  name: 'Chairside',
  subtitle: 'AI Missed-Call Recovery & Booking SaaS',
  when: 'Jun 2026 — Present',
  badge: 'LIVE / IN PRODUCTION',
  description:
    'Multi-tenant voice-AI platform for dental practices: a Retell AI voice agent checks real availability via Cal.com, books the appointment, and confirms over Twilio SMS — per-client isolation on a single deployment.',
  warStory:
    'Production war stories included: a UTC↔Phoenix timezone bug fixed across the booking flow, idempotent booking so retries never double-book, and caller ID as the source of truth over transcription.',
  metrics: [
    { value: '$297', label: 'MRR per client' },
    { value: '3', label: 'practices onboarded' },
    { value: 'E2E', label: 'voice-AI booking' },
  ],
  chips: ['FastAPI', 'Retell AI', 'Twilio', 'Supabase', 'n8n', 'Railway'],
  link: 'https://github.com/Harshith241/Chairside-API',
}

export const projects = [
  {
    name: 'Google Calendar MCP',
    description:
      'FastMCP server connecting Claude to Google Calendar: natural-language scheduling, free-slot detection, Meet links, OAuth 2.0, Dockerized.',
    chips: ['MCP', 'FastMCP', 'Docker', 'OAuth'],
    link: 'https://github.com/Harshith241/google-calendar-mcp',
  },
  {
    name: 'AI Sales Calling Agent',
    description:
      'LangChain agent with tool-driven reasoning and conversational memory for outbound sales calls, built at Tekplanit.',
    chips: ['LangChain', 'Python', 'Tool Calling'],
    link: 'https://github.com/Harshith241',
  },
  {
    name: 'EPICS-AR Garden Navigator',
    description:
      'Flutter AR app for 500+ visitors of Kebun Raya Balikpapan — offline GPS navigation that cut wayfinding errors by 30%. Built with an 8-person international Agile team.',
    chips: ['Flutter', 'Dart', 'GPS/AR'],
    link: 'https://github.com/Harshith241/EPICS-AR',
  },
  {
    name: 'GoHealthy',
    description:
      'Computer-vision model that predicts BMI from a photo and recommends a diet plan for weight gain, loss, or maintenance.',
    chips: ['Python', 'Computer Vision'],
    link: 'https://github.com/Harshith241/GoHealthy--AI-capstone-project',
  },
]

export const agentLab = {
  positioning:
    'Agents are only impressive when they survive production. Here’s what mine do while I sleep:',
  terminal: [
    '~/agents $ chairside handle-call --from (480) 555-0198',
    '[agent]  missed call detected → dialing back with voice agent',
    '[tool]   calendar.check_availability(date="tomorrow")  ✓ 3 slots',
    '[agent]  "I can do 10:30, 1:00, or 3:15 — what works?"',
    '[tool]   booking.create(slot="10:30", patient="+1480••••0198")  ✓ confirmed',
    '[tool]   sms.send(confirmation)  ✓ delivered',
    '~/agents $ █   // this happens ~40×/month without me',
  ],
  stack: ['MCP', 'LangChain', 'FastMCP', 'Claude', 'Retell', 'n8n', 'Twilio', 'Supabase', 'FastAPI'],
}

export const skills = {
  languages: ['Python', 'Java', 'TypeScript', 'JavaScript', 'C++', 'C#', 'Swift', 'Kotlin', 'Dart', 'SQL'],
  frameworks: ['React', 'LangChain', 'Node.js', 'FastAPI', '.NET', 'Angular', 'Flutter'],
  tools: ['MCP', 'Supabase', 'Twilio', 'n8n', 'Docker', 'AWS', 'Railway', 'Git', 'Linux'],
}

export const honors = [
  { title: 'Kiro Spark AI Challenge', detail: 'Track Winner', prize: 500, when: 'Apr 2026' },
  { title: 'Principled Innovation Hack', detail: 'Winner', prize: 250, when: 'Apr 2025' },
  { title: 'DevHacks × Strategy', detail: '“Best Beginner Hack”', when: 'Mar 2025' },
  { title: 'Dean’s List', detail: '4× — 4.0 cumulative GPA', when: 'ASU' },
]

export const beyondCode = {
  title: 'When the laptop closes.',
  cards: {
    hiking: { caption: 'happiest above 2,000ft — or 15ft up a wall.', image: '/images/hiking.jpg' },
    guitar: { caption: 'currently torturing my neighbors with riffs.' },
    movies: { caption: 'will defend the Spider-Verse movies in any argument.' },
    gym: { caption: 'hours debugging : hours lifting — 10 : 1, working on it.' },
  },
}

export const contact = {
  heading: ['Let’s build', 'something.'],
  blurb: 'Internship, collaboration, or a rabbit hole about agents — my inbox is open.',
  footer: 'Handcrafted with React, GSAP & an unhealthy number of web threads.',
}
