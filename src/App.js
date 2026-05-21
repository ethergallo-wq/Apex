import React from 'react';
import Animaldex from './Animaldex_sora';
import './App.css';

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
  return <AppErrorBoundary><Animaldex /></AppErrorBoundary>;
}

export default App;
