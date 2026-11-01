// Field definitions for every list-style content type in the admin.
// type: text (default) | textarea | url | number | checkbox | image | file
const order = { name: 'sort_order', label: 'Sort Order', type: 'number', help: 'Lower numbers show first.', col: 4 };

export const RESOURCES = [
  {
    key: 'experiences', label: 'Experience', singular: 'Experience',
    title: (r) => r.role, subtitle: (r) => [r.company, [r.start_date, r.end_date].filter(Boolean).join(' — ')].filter(Boolean).join(' · '),
    thumb: 'logo_url',
    fields: [
      { name: 'role', label: 'Role', required: true, col: 6 },
      { name: 'company', label: 'Company', col: 6 },
      { name: 'location', label: 'Location', col: 6 },
      { name: 'employment_type', label: 'Type', placeholder: 'Full-time, Internship...', col: 6 },
      { name: 'start_date', label: 'Start', placeholder: 'May 2026', col: 6 },
      { name: 'end_date', label: 'End', placeholder: 'Present', col: 6 },
      { name: 'description', label: 'Highlights', type: 'textarea', help: 'One bullet point per line.', rows: 6 },
      { name: 'tech', label: 'Tech', help: 'Comma-separated, e.g. Python, Next.js, PostgreSQL' },
      { name: 'logo_url', label: 'Company Logo', type: 'image' },
      order,
    ],
  },
  {
    key: 'projects', label: 'Projects', singular: 'Project',
    title: (r) => r.title, subtitle: (r) => r.summary, thumb: 'image_url', badge: (r) => (r.featured ? 'Featured' : ''),
    fields: [
      { name: 'title', label: 'Title', required: true, col: 6 },
      { name: 'role', label: 'Your Role', col: 6 },
      { name: 'summary', label: 'Summary', help: 'One sentence shown on the project card.' },
      { name: 'description', label: 'Details', type: 'textarea', help: 'One bullet point per line. Shown when someone opens the project.', rows: 6 },
      { name: 'tech', label: 'Tech', help: 'Comma-separated' },
      { name: 'start_date', label: 'Start', col: 6 },
      { name: 'end_date', label: 'End', col: 6 },
      { name: 'live_url', label: 'Live URL', type: 'url', col: 6 },
      { name: 'repo_url', label: 'Code URL', type: 'url', col: 6 },
      { name: 'image_url', label: 'Cover Image', type: 'image' },
      { name: 'featured', label: 'Featured project', type: 'checkbox', col: 8 },
      order,
    ],
  },
  {
    key: 'education', label: 'Education', singular: 'Education',
    title: (r) => r.school, subtitle: (r) => r.degree, thumb: 'logo_url',
    fields: [
      { name: 'school', label: 'School', required: true },
      { name: 'degree', label: 'Degree', col: 8 },
      { name: 'gpa', label: 'GPA', col: 4 },
      { name: 'location', label: 'Location', col: 4 },
      { name: 'start_date', label: 'Start', col: 4 },
      { name: 'end_date', label: 'End', col: 4 },
      { name: 'details', label: 'Details', type: 'textarea', help: 'Coursework, activities. One per line.' },
      { name: 'logo_url', label: 'Logo', type: 'image' },
      order,
    ],
  },
  {
    key: 'skills', label: 'Skills', singular: 'Skill', groupBy: 'category',
    title: (r) => r.name, subtitle: () => '',
    fields: [
      { name: 'name', label: 'Skill', required: true, col: 6 },
      { name: 'category', label: 'Category', placeholder: 'Languages, Web, Cloud...', col: 6, help: 'Skills with the same category are grouped.' },
      order,
    ],
  },
  {
    key: 'languages', label: 'Languages', singular: 'Language',
    title: (r) => r.name, subtitle: (r) => r.proficiency,
    fields: [
      { name: 'name', label: 'Language', required: true, col: 6 },
      { name: 'proficiency', label: 'Proficiency', placeholder: 'Native, IELTS 6.5...', col: 6 },
      order,
    ],
  },
  {
    key: 'certifications', label: 'Certifications', singular: 'Certification',
    title: (r) => r.name, subtitle: (r) => [r.issuer, r.issued_date].filter(Boolean).join(' · '), thumb: 'image_url',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'issuer', label: 'Issuer', col: 6 },
      { name: 'issued_date', label: 'Issued', col: 6 },
      { name: 'credential_url', label: 'Credential URL', type: 'url' },
      { name: 'image_url', label: 'Certificate Image', type: 'image' },
      order,
    ],
  },
  {
    key: 'awards', label: 'Awards', singular: 'Award',
    title: (r) => r.title, subtitle: (r) => [r.issuer, r.year].filter(Boolean).join(' · '),
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'issuer', label: 'Issuer', col: 8 },
      { name: 'year', label: 'Year', col: 4 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      order,
    ],
  },
  {
    key: 'leadership', label: 'Leadership', singular: 'Leadership Role',
    title: (r) => r.role, subtitle: (r) => r.organization,
    fields: [
      { name: 'role', label: 'Role', required: true },
      { name: 'organization', label: 'Organization' },
      { name: 'start_date', label: 'Start', col: 6 },
      { name: 'end_date', label: 'End', col: 6 },
      { name: 'description', label: 'Description', type: 'textarea', help: 'One bullet point per line.' },
      order,
    ],
  },
];
