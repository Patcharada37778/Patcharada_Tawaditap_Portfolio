// List-style content types the admin can create, edit and delete.
// Only the fields listed here can be written, so this doubles as an allowlist.
export const resources = {
  experiences: {
    fields: ['role', 'company', 'location', 'employment_type', 'start_date', 'end_date', 'description', 'tech', 'logo_url', 'sort_order'],
    required: ['role'],
  },
  projects: {
    fields: ['title', 'summary', 'description', 'role', 'tech', 'start_date', 'end_date', 'image_url', 'live_url', 'repo_url', 'featured', 'sort_order'],
    required: ['title'],
  },
  education: {
    fields: ['school', 'degree', 'location', 'start_date', 'end_date', 'gpa', 'details', 'logo_url', 'sort_order'],
    required: ['school'],
  },
  skills: {
    fields: ['category', 'name', 'sort_order'],
    required: ['name'],
  },
  languages: {
    fields: ['name', 'proficiency', 'sort_order'],
    required: ['name'],
  },
  certifications: {
    fields: ['name', 'issuer', 'issued_date', 'credential_url', 'image_url', 'sort_order'],
    required: ['name'],
  },
  awards: {
    fields: ['title', 'issuer', 'year', 'description', 'sort_order'],
    required: ['title'],
  },
  leadership: {
    fields: ['role', 'organization', 'start_date', 'end_date', 'description', 'sort_order'],
    required: ['role'],
  },
};

export const profileFields = [
  'full_name', 'headline', 'tagline', 'bio', 'location', 'availability', 'email', 'phone',
  'linkedin_url', 'github_url', 'website_url', 'photo_url', 'resume_url',
];

// Turn a request body into column values: drop unknown keys and coerce types.
export function pickFields(body, fields) {
  const out = {};
  for (const f of fields) {
    if (!(f in body)) continue;
    let v = body[f];
    if (f === 'sort_order') v = Number.parseInt(v, 10) || 0;
    else if (f === 'featured') v = v === true || v === 'true';
    else v = v == null ? '' : String(v);
    out[f] = v;
  }
  return out;
}
