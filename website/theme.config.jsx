export default {
  logo: <span style={{ fontWeight: 600 }}>Sonner</span>,
  project: {
    link: 'https://github.com/emilkowalski/sonner',
  },
  docsRepositoryBase: 'https://github.com/emilkowalski/sonner/tree/main',
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Sonner',
    };
  },
  feedback: {
    content: null,
  },
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{' '}
        <a href="https://sonner.emilkowal.ski" target="_blank">
          Sonner
        </a>
        .
      </span>
    ),
  },
  // ... other theme options
};
