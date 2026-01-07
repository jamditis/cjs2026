import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://summit.collaborativejournalism.org'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`

// JSON-LD structured data for the main event
const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: '2026 Collaborative Journalism Summit',
  description: 'The 10th anniversary Collaborative Journalism Summit brings together journalists, media leaders, funders, and academics to explore how to work together in the public interest.',
  startDate: '2026-06-15T09:00:00-04:00',
  endDate: '2026-06-16T17:00:00-04:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Pittsburgh, PA',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pittsburgh',
      addressRegion: 'PA',
      addressCountry: 'US'
    }
  },
  image: [DEFAULT_IMAGE],
  organizer: {
    '@type': 'Organization',
    name: 'Center for Cooperative Media',
    url: 'https://centerforcooperativemedia.org',
    logo: `${SITE_URL}/ccm-logo.png`
  },
  offers: {
    '@type': 'Offer',
    url: SITE_URL,
    availability: 'https://schema.org/InStock',
    priceCurrency: 'USD'
  },
  performer: {
    '@type': 'Organization',
    name: 'Center for Cooperative Media at Montclair State University'
  }
}

// Organization JSON-LD
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Center for Cooperative Media',
  url: 'https://centerforcooperativemedia.org',
  logo: `${SITE_URL}/ccm-logo.png`,
  sameAs: [
    'https://twitter.com/CenterCoopMedia',
    'https://collaborativejournalism.org'
  ]
}

// Website JSON-LD for sitelinks search box potential
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '2026 Collaborative Journalism Summit',
  url: SITE_URL
}

export default function SEO({
  title,
  description,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noIndex = false,
  jsonLd = null
}) {
  const url = `${SITE_URL}${path}`
  const fullTitle = title
    ? `${title} | 2026 Collaborative Journalism Summit`
    : '2026 Collaborative Journalism Summit | June 15-16, Pittsburgh, PA'
  const metaDescription = description ||
    'Join us for the 10th anniversary Collaborative Journalism Summit. June 15-16, 2026 in Pittsburgh, PA. A decade of bringing journalists together to work in the public interest.'

  // Combine all JSON-LD schemas
  const allJsonLd = [eventJsonLd, organizationJsonLd, websiteJsonLd]
  if (jsonLd) {
    allJsonLd.push(jsonLd)
  }

  return (
    <Helmet>
      {/* Primary meta tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Collaborative Journalism Summit" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@CenterCoopMedia" />

      {/* JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify(allJsonLd)}
      </script>
    </Helmet>
  )
}

// Pre-configured SEO for specific pages
export function HomeSEO() {
  return <SEO path="/" />
}

export function ScheduleSEO() {
  return (
    <SEO
      title="Schedule"
      description="Browse the full schedule for the 2026 Collaborative Journalism Summit. Sessions, workshops, and networking events on June 15-16 in Pittsburgh, PA."
      path="/schedule"
    />
  )
}

export function SponsorsSEO() {
  return (
    <SEO
      title="Sponsors"
      description="Meet the sponsors and partners making the 10th anniversary Collaborative Journalism Summit possible. Learn about sponsorship opportunities."
      path="/sponsors"
    />
  )
}

export function FAQSEO() {
  return (
    <SEO
      title="FAQ"
      description="Frequently asked questions about the 2026 Collaborative Journalism Summit including registration, venue, accommodations, and what to expect."
      path="/faq"
    />
  )
}

export function ContactSEO() {
  return (
    <SEO
      title="Contact"
      description="Get in touch with the Collaborative Journalism Summit team. Questions about registration, sponsorship, speaking opportunities, and more."
      path="/contact"
    />
  )
}

export function CodeOfConductSEO() {
  return (
    <SEO
      title="Code of conduct"
      description="The Collaborative Journalism Summit is committed to providing a welcoming and harassment-free experience for everyone."
      path="/code-of-conduct"
    />
  )
}

export function PrivacySEO() {
  return (
    <SEO
      title="Privacy policy"
      description="Privacy policy for the Collaborative Journalism Summit website and registration."
      path="/privacy"
      noIndex={true}
    />
  )
}
