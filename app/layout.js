import './globals.css';

export const metadata = {
  title: 'EcoPulse Stadium — GenAI Sustainability & Operations Engine · FIFA World Cup',
  description: 'EcoPulse Stadium is a GenAI-powered real-time sustainability and operations reasoning engine for FIFA World Cup stadiums.',
  openGraph: {
    title: 'EcoPulse Stadium · FIFA World Cup',
    description: 'GenAI reasoning engine for stadium sustainability and operations. Safety-first. Sense → Reason → Act.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
