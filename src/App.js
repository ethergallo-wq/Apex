import React, { Suspense, lazy } from 'react';
import ApexBootLoader from './ApexBootLoader';
import './App.css';

const Animaldex = lazy(() => import('./Animaldex_sora'));

const LEGAL_UPDATED_AT = 'June 5, 2026';

const legalCopy = {
  terms: {
    title:'Terms of Service',
    intro:'These Terms of Service ("Terms") govern access to and use of Apex Content Studio and related Apexdex services (collectively, the "Service"). The Service is operated by Apexdex ("Apexdex," "we," "us," or "our"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.',
    sections:[
      ['1. Service Overview', 'Apex Content Studio is a content management tool that helps users prepare, review, and submit educational animal discovery content to TikTok and other supported channels. The Service may include content planning, post previews, caption editing, media preparation, account connection, and user-approved content submission features.'],
      ['2. User Control And Approval', 'The Service is designed to keep users in control of content submitted through connected third-party platforms. Before content is sent to TikTok through Apex Content Studio, the user must review the content, confirm the connected account, and approve the submission. Apexdex does not intend for the Service to publish or upload content without user awareness and confirmation.'],
      ['3. TikTok Integration', 'If you connect a TikTok account, the Service may use TikTok Login Kit and TikTok\'s Content Posting API to support content submission. TikTok may require you to authorize access and may show the permissions requested by Apex Content Studio.\n\nThe Service may use TikTok permissions only for the purposes disclosed in the user interface and in our Privacy Policy. TikTok content submission may be subject to TikTok\'s own terms, policies, community guidelines, music usage rules, branded content rules, technical limits, review processes, and API restrictions.\n\nYou are responsible for ensuring that any content you submit through the Service complies with TikTok\'s requirements and all applicable laws.'],
      ['4. Account Connection', 'You are responsible for maintaining control of your connected accounts. You should only connect accounts that you are authorized to use. You may disconnect third-party platform access through the relevant platform settings or by contacting us.'],
      ['5. Content Responsibility', 'You retain responsibility for content that you create, upload, approve, or submit through the Service. You represent and warrant that you have all rights, permissions, and licenses necessary to use and submit such content, including any images, videos, captions, music, trademarks, names, likenesses, and other materials included in the content.\n\nYou must not use the Service to submit content that is unlawful, misleading, infringing, harmful, abusive, adult, discriminatory, deceptive, spam-like, or otherwise violates applicable platform policies.'],
      ['6. No Unauthorized Automation', 'You must not use the Service to spam, mass-post abusive content, impersonate others, manipulate engagement, evade platform limits, or publish content without proper user authorization. Apexdex may limit, suspend, or disable access where use appears unsafe, abusive, or non-compliant.'],
      ['7. Third-Party Services', 'The Service may interoperate with third-party services such as TikTok. Apexdex does not control third-party services and is not responsible for their availability, functionality, decisions, review outcomes, restrictions, account actions, or policy changes.'],
      ['8. Intellectual Property', 'The Service, including software, interface design, workflows, branding, and documentation, is owned by Apexdex or its licensors. Subject to these Terms, Apexdex grants you a limited, non-exclusive, non-transferable right to use the Service for its intended purpose.\n\nYou retain ownership of content you provide, but you grant Apexdex a limited license to host, process, display, transmit, and otherwise use that content as necessary to operate the Service.'],
      ['9. Privacy', 'Our Privacy Policy explains how we collect, use, and protect information. By using the Service, you acknowledge our Privacy Policy.'],
      ['10. Service Changes', 'We may update, suspend, modify, or discontinue parts of the Service at any time, including to comply with third-party platform requirements or legal obligations.'],
      ['11. Disclaimers', 'The Service is provided on an "as is" and "as available" basis. Apexdex does not guarantee that content submissions will be accepted, published, displayed, monetized, or remain available on any third-party platform.'],
      ['12. Limitation Of Liability', 'To the maximum extent permitted by law, Apexdex will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, data, goodwill, content, account access, or platform availability arising from use of the Service.'],
      ['13. Termination', 'We may suspend or terminate access to the Service if we believe a user has violated these Terms, applicable law, platform requirements, or security standards.'],
      ['14. Updates To These Terms', 'We may update these Terms from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of the Service after updates means you accept the updated Terms.'],
      ['15. Contact', 'For questions about these Terms, contact us at support@apexdex.app or visit https://apexdex.app.'],
    ],
  },
  privacy: {
    title:'Privacy Policy',
    intro:'This Privacy Policy explains how Apexdex ("Apexdex," "we," "us," or "our") collects, uses, shares, and protects information when users access Apex Content Studio and related Apexdex services (collectively, the "Service").',
    sections:[
      ['1. Information We Collect', 'We collect information needed to operate the Service, provide content management features, and support user-approved integrations with third-party platforms such as TikTok.\n\nInformation may include account information, TikTok account information provided through TikTok Login Kit, authorization information where needed to operate connected platform features, captions, post text, media URLs, images, videos, post previews, selected privacy settings, approval status, submission history, IP address, browser type, device information, logs, error events, timestamps, usage activity, and communications sent to support.'],
      ['2. How We Use Information', 'We use information to provide and operate the Service, allow users to connect a TikTok account, display the connected TikTok account, prepare and preview content, edit captions, submit user-approved content, send approved content to TikTok through TikTok\'s Content Posting API, maintain security, prevent abuse, troubleshoot errors, enforce limits, improve the Service, and comply with legal, security, and platform requirements.'],
      ['3. TikTok Integration', 'When a user connects TikTok, TikTok may provide authorized account information and tokens to the Service. We use this information only to support the connected TikTok workflow shown to the user.\n\nFor the initial Content Posting API flow, Apex Content Studio may use video.upload to send approved content to TikTok as a draft/inbox upload. If Direct Post is later enabled and approved, the Service may use additional TikTok publishing permissions only after the user reviews and approves the content.\n\nThe Service is designed so users can review content and approve submission before content is sent to TikTok.'],
      ['4. How We Share Information', 'We may share information with TikTok when necessary to authenticate a user or submit user-approved content through TikTok APIs; with service providers that help us host, secure, monitor, or operate the Service; if required by law, legal process, security obligations, or enforceable governmental request; and in connection with a business transaction, such as merger, acquisition, financing, or sale of assets.\n\nWe do not sell personal information.'],
      ['5. Data Retention', 'We retain information only for as long as reasonably necessary to provide the Service, maintain security, troubleshoot issues, comply with legal or platform requirements, and support legitimate business needs.\n\nAuthorization tokens are retained only as needed to operate connected account features. Users may disconnect third-party platform access through the platform\'s settings or by contacting us.'],
      ['6. User Choices And Controls', 'Users may review content before submission, choose not to approve a content submission, disconnect TikTok access through TikTok account settings, and request support regarding access, deletion, or correction of account information, subject to legal and technical limitations.'],
      ['7. Security', 'We use reasonable technical and organizational measures designed to protect information. However, no online service is completely secure, and we cannot guarantee absolute security.'],
      ['8. Children\'s Privacy', 'The Service is not intended for children under the age required by applicable law to use the Service. We do not knowingly collect personal information from children in violation of applicable law.'],
      ['9. International Data', 'Information may be processed in countries other than the user\'s country of residence. Where required, we use appropriate safeguards for international data transfers.'],
      ['10. Third-Party Services', 'The Service may link to or integrate with third-party services such as TikTok. Their privacy practices are governed by their own policies. Users should review those policies before using connected features.'],
      ['11. Changes To This Privacy Policy', 'We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of the Service after updates means the updated policy applies.'],
      ['12. Contact', 'For privacy questions or requests, contact us at privacy@apexdex.app or visit https://apexdex.app.'],
    ],
  },
};

function LegalPage({ type }) {
  const copy = legalCopy[type] || legalCopy.terms;
  const other = type === 'privacy' ? 'terms' : 'privacy';
  return (
    <main style={{ height:'var(--animaldex-app-height, 100dvh)', minHeight:0, overflowY:'auto', WebkitOverflowScrolling:'touch', background:'#F7F2EA', color:'#201614', fontFamily:'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', padding:'0 16px calc(72px + env(safe-area-inset-bottom, 0px))', boxSizing:'border-box' }}>
      <header style={{ position:'sticky', top:0, zIndex:2, margin:'0 -16px', padding:'calc(12px + env(safe-area-inset-top, 0px)) 16px 12px', background:'rgba(247,242,234,.94)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(80,42,22,.10)' }}>
        <nav style={{ width:'100%', maxWidth:820, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <a href="/" style={{ color:'#B84D3A', fontSize:14, fontWeight:900, textDecoration:'none' }}>Apex Content Studio</a>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'flex-end' }}>
            <a href="/terms" style={{ color:type === 'terms' ? '#201614' : '#B84D3A', fontSize:13, fontWeight:900 }}>Terms</a>
            <a href="/privacy" style={{ color:type === 'privacy' ? '#201614' : '#B84D3A', fontSize:13, fontWeight:900 }}>Privacy</a>
          </div>
        </nav>
      </header>
      <article style={{ width:'100%', maxWidth:820, margin:'26px auto 0', background:'#FFFDF8', border:'1px solid rgba(80,42,22,.12)', borderRadius:18, padding:'28px min(5vw, 46px)', boxShadow:'0 18px 50px rgba(70,38,18,.10)' }}>
        <div style={{ color:'#B84D3A', fontSize:12, fontWeight:900, textTransform:'uppercase', letterSpacing:.8 }}>Apexdex legal</div>
        <h1 style={{ fontSize:'clamp(32px, 6vw, 50px)', lineHeight:1.04, margin:'10px 0 10px', letterSpacing:0 }}>{copy.title}</h1>
        <p style={{ margin:'0 0 22px', color:'rgba(32,22,20,.68)', fontSize:14, lineHeight:1.6 }}>Last updated: {LEGAL_UPDATED_AT}</p>
        <p style={{ fontSize:17, lineHeight:1.72, margin:'0 0 26px' }}>{copy.intro}</p>
        {copy.sections.map(([heading, body]) => (
          <section key={heading} style={{ borderTop:'1px solid rgba(80,42,22,.10)', paddingTop:18, marginTop:18 }}>
            <h2 style={{ fontSize:20, lineHeight:1.25, margin:'0 0 8px' }}>{heading}</h2>
            {String(body).split('\n\n').map((paragraph, index) => (
              <p key={index} style={{ fontSize:15, lineHeight:1.7, margin:index ? '10px 0 0' : 0, color:'rgba(32,22,20,.78)' }}>{paragraph}</p>
            ))}
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

function hardReloadApp() {
  const target = `${window.location.pathname}${window.location.search}${window.location.hash || ''}` || '/';
  try {
    window.location.replace(target);
    return;
  } catch {}
  try {
    window.location.assign(target);
    return;
  } catch {}
  window.location.reload();
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
          <button type="button" onClick={hardReloadApp} style={{ height:44, border:'none', borderRadius:14, background:'#B84D3A', color:'white', fontWeight:900, padding:'0 18px', cursor:'pointer' }}>Ricarica</button>
        </div>
      </div>
    );
  }
}

function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') : '';
  if (path === '/terms') return <LegalPage type="terms" />;
  if (path === '/privacy') return <LegalPage type="privacy" />;
  return (
    <AppErrorBoundary>
      <Suspense fallback={<ApexBootLoader />}>
        <Animaldex />
      </Suspense>
    </AppErrorBoundary>
  );
}

export default App;
