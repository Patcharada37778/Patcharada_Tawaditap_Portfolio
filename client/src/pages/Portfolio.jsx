import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import { api, lines, csv, range } from '../api.js';
import ThemeToggle from '../components/ThemeToggle.jsx';

const pad = (n) => String(n).padStart(2, '0');

function useReveal(deps) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return undefined; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="section-head reveal">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="section-title">{title}</h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  );
}

function Chips({ text }) {
  const items = csv(text);
  if (!items.length) return null;
  return <div className="chips">{items.map((t) => <span key={t} className="chip">{t}</span>)}</div>;
}

function Bullets({ text }) {
  const items = lines(text);
  if (!items.length) return null;
  return <ul>{items.map((l, i) => <li key={i}>{l}</li>)}</ul>;
}

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  if (!email) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { window.location.href = `mailto:${email}`; }
  };
  return (
    <button type="button" className="copy-chip" onClick={copy} aria-label={`Copy email address ${email}`}>
      {email}<span className="hint">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState({ status: 'idle', error: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ status: 'sending', error: '' });
    try {
      await api('/messages', { method: 'POST', body: form });
      setForm({ name: '', email: '', message: '' });
      setState({ status: 'sent', error: '' });
    } catch (err) {
      setState({ status: 'idle', error: err.message });
    }
  };

  if (state.status === 'sent') {
    return (
      <div className="card-x" style={{ padding: 24 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Message sent</div>
        <p className="mb-3">Thanks for reaching out. I'll reply by email.</p>
        <Button variant="line" onClick={() => setState({ status: 'idle', error: '' })}>Send Another Message</Button>
      </div>
    );
  }

  return (
    <Form onSubmit={submit} className="card-x" style={{ padding: 24 }}>
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <Row className="g-3">
        <Col sm={6}>
          <Form.Label htmlFor="c-name">Name</Form.Label>
          <Form.Control id="c-name" required value={form.name} onChange={set('name')} autoComplete="name" />
        </Col>
        <Col sm={6}>
          <Form.Label htmlFor="c-email">Email</Form.Label>
          <Form.Control id="c-email" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
        </Col>
        <Col xs={12}>
          <Form.Label htmlFor="c-msg">Message</Form.Label>
          <Form.Control id="c-msg" as="textarea" rows={5} required value={form.message} onChange={set('message')} />
        </Col>
        <Col xs={12}>
          <Button type="submit" variant="ink" disabled={state.status === 'sending'}>
            {state.status === 'sending' ? 'Sending...' : 'Send Message'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openProject, setOpenProject] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    api('/portfolio').then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (data?.profile?.full_name) document.title = data.profile.full_name;
  }, [data]);

  useReveal([data]);

  if (error) return <div className="page-loading">Couldn't load the portfolio. Check the API server is running, then refresh.</div>;
  if (!data) return <div className="page-loading">Loading...</div>;

  const { profile: p, experiences, projects, education, skills, languages, certifications, awards, leadership } = data;
  const firstName = (p.full_name || '').split(' ')[0];
  const skillGroups = skills.reduce((acc, s) => { (acc[s.category || 'General'] ||= []).push(s); return acc; }, {});
  const year = new Date().getFullYear();

  const nav = [
    experiences.length && ['experience', 'Experience'],
    projects.length && ['projects', 'Projects'],
    (skills.length || languages.length) && ['skills', 'Skills'],
    (awards.length || certifications.length) && ['awards', 'Awards'],
    ['contact', 'Contact'],
  ].filter(Boolean);

  return (
    <>
      <header className="site-nav">
        <div className="site-nav-inner">
          <a href="#top" className="wordmark">{(p.full_name || 'portfolio').toLowerCase().replace(/\s+/g, '.')}</a>
          <nav className="nav-links" aria-label="Sections">
            {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
          </nav>
          <div className="nav-right">
            <ThemeToggle />
            {p.resume_url && <Button as="a" href={p.resume_url} target="_blank" rel="noopener" variant="ink" size="sm">Resume</Button>}
          </div>
        </div>
      </header>

      <main id="top" className="frame">
        {/* Hero */}
        <section className="hero frame-pad">
          <Row className="align-items-center g-4 g-lg-5">
            <Col lg={p.photo_url ? 7 : 12}>
              <div className="eyebrow reveal">Portfolio{p.location ? ` — ${p.location}` : ''}</div>
              <h1 className="hero-title reveal">{p.full_name || 'Your Name'}</h1>
              {p.headline && <p className="hero-headline reveal">{p.headline}</p>}
              {p.tagline && <p className="hero-tagline reveal">{p.tagline}</p>}
              <div className="d-flex flex-wrap gap-2 mt-4 reveal">
                <Button as="a" href="#contact" variant="ink" size="lg">Get in Touch</Button>
                {p.resume_url && <Button as="a" href={p.resume_url} target="_blank" rel="noopener" variant="line" size="lg">Download Resume</Button>}
                <CopyEmail email={p.email} />
              </div>
              <div className="hero-meta reveal">
                {p.availability && <span><span className="status-dot" />{p.availability}</span>}
                <span>{pad(experiences.length)} roles</span>
                <span>{pad(projects.length)} projects</span>
                <span>{pad(awards.length)} awards</span>
              </div>
            </Col>
            {p.photo_url && (
              <Col lg={5} className="reveal">
                <figure className="portrait mx-auto mb-0" style={{ maxWidth: 380 }}>
                  <img src={p.photo_url} alt={`Portrait of ${p.full_name}`} />
                  <figcaption className="portrait-caption"><span>{firstName}</span><span>{year}</span></figcaption>
                </figure>
              </Col>
            )}
          </Row>
        </section>

        {/* About */}
        {p.bio && (
          <section className="section frame-pad" id="about">
            <Row className="g-4">
              <Col md={4}><div className="eyebrow reveal">About</div></Col>
              <Col md={8}>
                <p className="reveal" style={{ fontSize: 'clamp(1.15rem, 2vw, 1.45rem)', letterSpacing: '-0.02em', lineHeight: 1.45, marginBottom: 0 }}>{p.bio}</p>
              </Col>
            </Row>
          </section>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <section className="section frame-pad" id="experience">
            <SectionHead eyebrow="Experience" title="Where I've worked" sub="Roles across AI engineering, product design and teaching." />
            <div className="stack reveal">
              {experiences.map((x) => (
                <article className="stack-row" key={x.id}>
                  <div className="when">{range(x.start_date, x.end_date)}{x.employment_type && <small>{x.employment_type}</small>}</div>
                  <div>
                    <div className="d-flex gap-3 align-items-start">
                      {x.logo_url && <img src={x.logo_url} alt="" className="row-logo" />}
                      <div>
                        <h3>{x.role}</h3>
                        <div className="org">{[x.company, x.location].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                    <Bullets text={x.description} />
                    <Chips text={x.tech} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="section frame-pad" id="projects">
            <SectionHead eyebrow="Projects" title="Selected work" sub="Things I've built, shipped and researched. Select one for details." />
            <div className="cap-grid reveal">
              {projects.map((pr, i) => (
                <button type="button" className="cap-card" key={pr.id} onClick={() => setOpenProject(pr)}>
                  <span className="cap-num"><span>{pad(i + 1)}</span>{pr.featured && <span>Featured</span>}</span>
                  {pr.image_url && <img src={pr.image_url} alt="" className="cap-thumb" />}
                  <h3>{pr.title}</h3>
                  <p>{pr.summary}</p>
                  <Chips text={csv(pr.tech).slice(0, 4).join(', ')} />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="section frame-pad" id="education">
            <SectionHead eyebrow="Education" title="Education" />
            <div className="stack reveal">
              {education.map((ed) => (
                <article className="stack-row" key={ed.id}>
                  <div className="when">{range(ed.start_date, ed.end_date)}{ed.gpa && <small>GPA {ed.gpa}</small>}</div>
                  <div>
                    <div className="d-flex gap-3 align-items-start">
                      {ed.logo_url && <img src={ed.logo_url} alt="" className="row-logo" />}
                      <div>
                        <h3>{ed.school}</h3>
                        <div className="org">{[ed.degree, ed.location].filter(Boolean).join(' · ')}</div>
                      </div>
                    </div>
                    <Bullets text={ed.details} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills + Languages */}
        {(skills.length > 0 || languages.length > 0) && (
          <section className="section frame-pad" id="skills">
            <SectionHead eyebrow="Skills" title="Toolkit" sub="Languages, frameworks and tools I work with." />
            {skills.length > 0 && (
              <div className="stack reveal mb-4">
                {Object.entries(skillGroups).map(([cat, list]) => (
                  <div className="kv-row" key={cat}>
                    <div className="k">{cat}</div>
                    <div className="chips">{list.map((s) => <span key={s.id} className="chip chip-solid">{s.name}</span>)}</div>
                  </div>
                ))}
              </div>
            )}
            {languages.length > 0 && (
              <>
                <div className="eyebrow mt-5 reveal">Spoken Languages</div>
                <div className="stack reveal">
                  {languages.map((l) => (
                    <div className="kv-row" key={l.id}>
                      <div className="k">{l.name}</div>
                      <div className="mono" style={{ fontSize: 13 }}>{l.proficiency}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Awards, certifications, leadership */}
        {(awards.length > 0 || certifications.length > 0 || leadership.length > 0) && (
          <section className="section frame-pad" id="awards">
            <SectionHead eyebrow="Recognition" title="Awards & certifications" />
            {awards.length > 0 && (
              <div className="stack reveal mb-5">
                {awards.map((a) => (
                  <div className="award-row" key={a.id}>
                    <span className="yr">{a.year || '—'}</span>
                    <span className="t">{a.title}{a.description && <span className="d-block text-muted-fg" style={{ fontWeight: 400, fontSize: 14 }}>{a.description}</span>}</span>
                    <span className="iss">{a.issuer}</span>
                  </div>
                ))}
              </div>
            )}
            {certifications.length > 0 && (
              <>
                <div className="eyebrow reveal">Certifications</div>
                <Row className="g-3 mb-5">
                  {certifications.map((c) => {
                    const href = c.credential_url || c.image_url;
                    const Tag = href ? 'a' : 'div';
                    return (
                      <Col sm={6} lg={4} key={c.id} className="reveal">
                        <Tag className="cert-card" {...(href ? { href, target: '_blank', rel: 'noopener' } : {})}>
                          {c.image_url && <img src={c.image_url} alt={`${c.name} certificate`} loading="lazy" />}
                          <div className="body">
                            <h3>{c.name}</h3>
                            <div className="mono text-muted-fg" style={{ fontSize: 12 }}>{[c.issuer, c.issued_date].filter(Boolean).join(' · ')}</div>
                          </div>
                        </Tag>
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
            {leadership.length > 0 && (
              <>
                <div className="eyebrow reveal">Leadership</div>
                <div className="stack reveal">
                  {leadership.map((l) => (
                    <article className="stack-row" key={l.id}>
                      <div className="when">{range(l.start_date, l.end_date)}</div>
                      <div>
                        <h3>{l.role}</h3>
                        <div className="org">{l.organization}</div>
                        <Bullets text={l.description} />
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Contact */}
        <section className="section frame-pad" id="contact">
          <Row className="g-4 g-lg-5">
            <Col lg={5}>
              <SectionHead eyebrow="Contact" title="Let's talk" sub="Have a role, project or question? Send a message or reach me directly." />
              <div className="reveal">
                {p.email && <a className="contact-link" href={`mailto:${p.email}`}><span><span className="k d-block">Email</span>{p.email}</span><span className="arrow">↗</span></a>}
                {p.linkedin_url && <a className="contact-link" href={p.linkedin_url} target="_blank" rel="noopener"><span><span className="k d-block">LinkedIn</span>{p.linkedin_url.replace(/^https?:\/\/(www\.)?/, '')}</span><span className="arrow">↗</span></a>}
                {p.github_url && <a className="contact-link" href={p.github_url} target="_blank" rel="noopener"><span><span className="k d-block">GitHub</span>{p.github_url.replace(/^https?:\/\/(www\.)?/, '')}</span><span className="arrow">↗</span></a>}
                {p.website_url && <a className="contact-link" href={p.website_url} target="_blank" rel="noopener"><span><span className="k d-block">Website</span>{p.website_url.replace(/^https?:\/\/(www\.)?/, '')}</span><span className="arrow">↗</span></a>}
                {p.phone && <a className="contact-link" href={`tel:${p.phone.replace(/\s/g, '')}`}><span><span className="k d-block">Phone</span>{p.phone}</span><span className="arrow">↗</span></a>}
              </div>
            </Col>
            <Col lg={7} className="reveal"><ContactForm /></Col>
          </Row>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>© {year} {p.full_name}</span>
          <span><a href="#top">Back to Top ↑</a></span>
        </div>
      </footer>

      <Modal show={!!openProject} onHide={() => setOpenProject(null)} centered size="lg">
        {openProject && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{openProject.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {openProject.image_url && <img src={openProject.image_url} alt="" className="cap-thumb" />}
              <div className="mono text-muted-fg mb-3" style={{ fontSize: 12 }}>
                {[openProject.role, range(openProject.start_date, openProject.end_date)].filter(Boolean).join(' · ')}
              </div>
              {openProject.summary && <p style={{ fontSize: 16 }}>{openProject.summary}</p>}
              <div className="stack-row p-0 d-block border-0"><Bullets text={openProject.description} /></div>
              <Chips text={openProject.tech} />
            </Modal.Body>
            {(openProject.live_url || openProject.repo_url) && (
              <Modal.Footer>
                {openProject.repo_url && <Button as="a" href={openProject.repo_url} target="_blank" rel="noopener" variant="line">View Code ↗</Button>}
                {openProject.live_url && <Button as="a" href={openProject.live_url} target="_blank" rel="noopener" variant="ink">Visit Site ↗</Button>}
              </Modal.Footer>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
