export default {
  logo: <span style={{ fontWeight: 600 }}>Sonner</span>,
  project: {
    link: 'https://github.com/emilkowalski/sonner',
  },
  docsRepositoryBase: 'https://github.com/emilkowalski/sonner',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Sonner',
    };
  },
  // ... other theme options
};
