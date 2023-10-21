import NextHead from 'next/head';

const ogImage = 'https://sonner.emilkowal.ski/og.png';

const Head = () => (
  <NextHead>
    {/* Title */}
    <title>Sonner</title>
    <meta name="og:title" content="Sonner" />

    {/* Description */}
    <meta name="description" content="An opinionated toast component for React." />
    <meta name="og:description" content="An opinionated toast component for React." />

    {/* Image */}
    <meta name="twitter:image" content={ogImage} />
    <meta name="og:image" content={ogImage} />

    {/* URL */}
    <meta name="og:url" content="https://sonner.emilkowal.ski/" />

    {/* General */}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta httpEquiv="Content-Language" content="en" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@emilkowalski_" />
    <meta name="author" content="Emil Kowalski" />

    {/* Favicons */}
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="theme-color" content="#ffffff" />
    <link rel="shortcut icon" href="favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png" />
  </NextHead>
);

export default Head;
