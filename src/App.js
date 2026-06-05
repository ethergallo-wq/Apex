import React from 'react';
import Animaldex from './Animaldex_sora';
import './App.css';

const LEGAL_UPDATED_AT = 'June 5, 2026';

const legalCopy = {
  terms: {
    title:'Terms of Service',
    intro:'These Terms of Service govern access to and use of Apex, also referred to as Animaldex, a web application for exploring animal species, recording sightings, managing a personal collection, and creating related educational or social content.',
    sections:[
      ['Use of the service', 'You may use Apex for personal, educational, informational, and content creation purposes. You agree not to misuse the service, attempt to disrupt it, scrape it at unreasonable scale, reverse engineer private systems, or use it for unlawful activity.'],
      ['Accounts and user content', 'Some features may require an account. You are responsible for the information you provide and for any photos, sightings, notes, or other content you submit. You must have the rights and permissions needed to upload or share any content.'],
      ['TikTok and third-party integrations', 'If Apex connects to TikTok or another third-party platform, that connection is used only for the features you explicitly request, such as publishing or managing content. Your use of those platforms is also governed by their own terms and policies.'],
      ['Educational information', 'Animal data, taxonomy, conservation notes, locations, and generated suggestions are provided for informational purposes. Apex does not provide professional scientific, veterinary, legal, travel, or safety advice.'],
      ['Intellectual property', 'The Apex interface, design, branding, and original content are owned by or licensed to the app owner. Third-party assets, platform names, APIs, and trademarks remain the property of their respective owners.'],
      ['Availability and changes', 'Apex may change, suspend, or discontinue features at any time. The service is provided as is and as available, without a guarantee that it will be uninterrupted or error-free.'],
      ['Limitation of liability', 'To the maximum extent permitted by law, Apex is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service.'],
      ['Contact', 'For questions about these terms, contact the app owner through the support channel or account information provided in the TikTok Developer application for Apex.'],
    ],
  },
  privacy: {
    title:'Privacy Policy',
    intro:'This Privacy Policy explains how Apex, also referred to as Animaldex, handles information when you use the web application and related integrations, including any TikTok developer features enabled by the app owner.',
    sections:[
      ['Information we collect', 'Apex may collect account information such as username, email address, profile preferences, visited countries, animal sightings, captured animals, badges, photos you choose to upload, and app usage events needed to operate the service.'],
      ['TikTok integration data', 'If you connect TikTok, Apex may receive the permissions and data you authorize through TikTok, such as account identity or content publishing permissions. Apex uses this information only to provide the connected feature you requested.'],
      ['How information is used', 'Information is used to provide the app, save your progress, personalize your experience, show badges and collection status, operate social or content features, improve reliability, and comply with platform or legal requirements.'],
      ['Storage and service providers', 'Apex may store app data using managed cloud services such as Supabase and hosting providers such as Vercel. These providers process data only as needed to operate and secure the service.'],
      ['Sharing', 'Apex does not sell personal information. Data may be shared with third-party platforms only when you choose to use an integration, when necessary to operate the service, or when required by law.'],
      ['Photos and user content', 'If you upload photos or other content, that content may be stored and associated with your account or animal collection. Do not upload content you do not have permission to use.'],
      ['Retention and deletion', 'Apex keeps information for as long as needed to provide the service, maintain records, resolve issues, or comply with obligations. You may request deletion of your account data through the app owner or support channel.'],
      ['Security', 'Apex uses reasonable technical and organizational measures to protect information, but no internet service can be guaranteed to be completely secure.'],
      ['Children', 'Apex is not intended for children under the age required by applicable law or by connected platform policies. Users should only use the service if they are allowed to do so in their location.'],
      ['Contact', 'For privacy questions or deletion requests, contact the app owner through the support channel or account information provided in the TikTok Developer application for Apex.'],
    ],
  },
};

function LegalPage({ type }) {
  const copy = legalCopy[type] || legalCopy.terms;
  const other = type === 'privacy' ? 'terms' : 'privacy';
  return (
    <main style={{ minHeight:'100vh', background:'#F7F2EA', color:'#201614', fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', padding:'42px 18px 56px', boxSizing:'border-box' }}>
      <article style={{ width:'100%', maxWidth:760, margin:'0 auto', background:'#FFFDF8', border:'1px solid rgba(80,42,22,.12)', borderRadius:18, padding:'28px min(5vw, 42px)', boxShadow:'0 18px 50px rgba(70,38,18,.10)' }}>
        <a href="/" style={{ color:'#B84D3A', fontSize:13, fontWeight:800, textDecoration:'none' }}>Apex</a>
        <h1 style={{ fontSize:'clamp(32px, 6vw, 48px)', lineHeight:1.04, margin:'14px 0 10px', letterSpacing:0 }}>{copy.title}</h1>
        <p style={{ margin:'0 0 22px', color:'rgba(32,22,20,.68)', fontSize:14, lineHeight:1.6 }}>Last updated: {LEGAL_UPDATED_AT}</p>
        <p style={{ fontSize:17, lineHeight:1.72, margin:'0 0 26px' }}>{copy.intro}</p>
        {copy.sections.map(([heading, body]) => (
          <section key={heading} style={{ borderTop:'1px solid rgba(80,42,22,.10)', paddingTop:18, marginTop:18 }}>
            <h2 style={{ fontSize:20, lineHeight:1.25, margin:'0 0 8px' }}>{heading}</h2>
            <p style={{ fontSize:15, lineHeight:1.7, margin:0, color:'rgba(32,22,20,.78)' }}>{body}</p>
          </section>
        ))}
        <nav style={{ borderTop:'1px solid rgba(80,42,22,.10)', marginTop:24, paddingTop:18, display:'flex', gap:12, flexWrap:'wrap' }}>
          <a href={`/${other}`} style={{ color:'#B84D3A', fontSize:14, fontWeight:800 }}>{legalCopy[other].title}</a>
          <a href="/" style={{ color:'#B84D3A', fontSize:14, fontWeight:800 }}>Back to Apex</a>
        </nav>
      </article>
    </main>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError:false };
  }

  static getDerivedStateFromError() {
    return { hasError:true };
  }

  componentDidCatch(error) {
    console.warn('[Apex] App fallback:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight:'100vh', background:'#1C1C1E', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:24, boxSizing:'border-box', fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', textAlign:'center' }}>
        <div>
          <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>Apex si sta ricaricando</div>
          <div style={{ color:'rgba(255,255,255,.68)', fontSize:14, lineHeight:1.45, marginBottom:16 }}>Chiudi e riapri l'app dalla schermata Home. Se continua, aprila una volta da Safari.</div>
          <button onClick={() => window.location.reload()} style={{ height:44, border:'none', borderRadius:14, background:'#B84D3A', color:'white', fontWeight:900, padding:'0 18px' }}>Ricarica</button>
        </div>
      </div>
    );
  }
}

function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : '';
  if (path === '/terms') return <LegalPage type="terms" />;
  if (path === '/privacy') return <LegalPage type="privacy" />;
  return <AppErrorBoundary><Animaldex /></AppErrorBoundary>;
}

export default App;
