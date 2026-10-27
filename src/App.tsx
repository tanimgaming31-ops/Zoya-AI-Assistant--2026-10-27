import{useEffect,useMemo,useState,type ChangeEvent}from'react';
import{AudioLines,Heart,KeyRound,Mic,Power,Settings2,ShieldCheck,X,ExternalLink}from'lucide-react';
import{LiveSession,type State}from'./LiveSession';
import{readSettings,saveSettings,type Settings}from'./settings';
const hints:Record<State,string>={disconnected:'Tap to start a live voice call',connecting:'Connecting to Gemini Live…',listening:'Zoya is listening. Speak naturally.',speaking:'Zoya is talking. You can interrupt her.'};
export default function App(){
 const[settings,setSettings]=useState<Settings>(readSettings);
 const[draft,setDraft]=useState<Settings>(readSettings);
 const[status,setStatus]=useState<State>('disconnected');
 const[level,setLevel]=useState(0);
 const[panel,setPanel]=useState(false);
 const[error,setError]=useState('');
 const[info,setInfo]=useState('');
 const[site,setSite]=useState('');
 const session=useMemo(()=>new LiveSession({onState:setStatus,onLevel:setLevel,onWebsite:setSite,onError:setError}),[]);
 useEffect(()=>()=>{void session.stop();},[session]);
 async function call(){setError('');setInfo('');
  if(status!=='disconnected'){await session.stop();return;}
  if(!settings.apiKey.trim()){setDraft(settings);setPanel(true);setError('Add your Gemini key first.');return;}
  try{await session.start(settings);}catch(e){setError(e instanceof Error?e.message:'Could not start call.');}
 }
 function save(){try{saveSettings(draft);setSettings(draft);setPanel(false);setError('');setInfo('Saved locally. Next call will use updated settings.');}catch{setError('Unable to save settings in this browser.');}}
 function removeKey(){const next={...draft,apiKey:''};setDraft(next);try{saveSettings({...settings,apiKey:''});setSettings(v=>({...v,apiKey:''}));setInfo('Saved key removed.');}catch{setError('Unable to remove saved key.');}}
 function exportAbout(){
  const blob=new Blob([JSON.stringify({app:'zoya',aboutMe:draft.aboutMe},null,2)],{type:'application/json'});
  const uri=URL.createObjectURL(blob),a=document.createElement('a');a.href=uri;a.download='zoya-about-me.json';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);
 }
 async function importAbout(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>128000)throw Error('File too large.');
   const result:unknown=JSON.parse(await file.text());
   if(!result||typeof result!=='object'||!('aboutMe'in result)||typeof result.aboutMe!=='string')throw Error('Invalid Zoya About Me JSON file.');
   setDraft(v=>({...v,aboutMe:result.aboutMe as string}));setInfo('About Me loaded. Tap Save Changes.');
  }catch(err){setError(err instanceof Error?err.message:'Import failed.');}
  e.target.value='';
 }
 const active=status==='listening'||status==='speaking';
 return <div className="zoya min-h-[100dvh] w-full overflow-x-hidden text-white">
  <div className="aura" aria-hidden="true"/>
  <main className="relative mx-auto flex min-h-[100dvh] max-w-xl flex-col px-6 pb-[max(22px,env(safe-area-inset-bottom))] pt-[max(24px,env(safe-area-inset-top))]">
   <header className="flex items-center justify-between"><div><div className="text-2xl font-semibold tracking-[.22em]">ZOYA <span className="text-fuchsia-300">✦</span></div><div className="text-[10px] uppercase tracking-[.28em] text-white/50">AI Voice Companion</div></div>
    <button aria-label="Open settings" className="glass rounded-2xl p-3" onClick={()=>{setDraft(settings);setPanel(true);}}><Settings2 size={22}/></button>
   </header>
   <section className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
    <div className="glass rounded-full px-5 py-2 text-[11px] font-semibold uppercase tracking-[.23em]"><span className={'dot '+(active?'active':'')}/> {status}</div>
    <div className={'orb '+(active?'awake':'')}><div className="orb-line"/><div className="orb-inner"/><span className="orb-letter">Z</span></div>
    <div className="flex h-12 items-center justify-center gap-1" aria-hidden="true">
     {Array.from({length:31},(_,i)=><span key={i} className={'wave '+(status==='speaking'?'speaking':'')} style={{height:Math.max(4,5+Math.abs(Math.sin(i*.83))*44*(status==='listening'?Math.min(1,level*8):status==='speaking'?.55:0))+'px',animationDelay:i*36+'ms'}}/>)}
    </div>
    <div><h1 className="text-3xl font-semibold">Hey, gorgeous <span className="text-pink-300">♥</span></h1><p className="mt-3 text-sm text-violet-100/65">{hints[status]}</p></div>
    <button aria-label={status==='disconnected'?'Start voice call':'End voice call'} className="power flex h-20 w-20 items-center justify-center rounded-full" onClick={()=>void call()}>{status==='disconnected'?<Mic size={33}/>:<Power size={33}/>}</button>
    <p className="text-[10px] uppercase tracking-[.25em] text-white/50">{status==='disconnected'?'Start Live Call':'End Live Call'}</p>
   </section>
   {site&&<div className="glass mb-3 rounded-2xl p-4 text-sm">
    <p className="flex items-center gap-2 font-semibold"><ExternalLink size={16}/> Zoya requests opening a website</p>
    <p className="my-3 break-all text-xs text-violet-100/70">{site}</p>
    <button className="primary w-full rounded-xl py-3" onClick={()=>{window.open(site,'_blank','noopener,noreferrer');setSite('');}}>Open website</button>
    <a className="mt-2 block break-all text-xs text-violet-200 underline" href={site} target="_blank" rel="noopener noreferrer">Direct link if popup is blocked</a>
    <button className="mt-3 text-xs underline" onClick={()=>setSite('')}>Dismiss</button>
   </div>}
   {error&&<div role="alert" className="glass mb-3 flex rounded-xl border border-rose-400/50 p-3 text-xs text-rose-100"><span className="flex-1">{error}</span><button aria-label="Dismiss" onClick={()=>setError('')}><X size={16}/></button></div>}
   {info&&<p className="mb-3 text-center text-xs text-violet-200">{info}</p>}
   <footer className="flex justify-between border-t border-white/10 pt-4 text-[10px] text-white/50"><span className="flex items-center gap-1"><ShieldCheck size={13}/> Separate from Maya</span><span className="flex items-center gap-1"><AudioLines size={13}/> Live audio only</span></footer>
  </main>
  {panel&&<div className="fixed inset-0 z-40 flex items-end justify-center bg-black/80 sm:items-center sm:p-4">
   <section aria-label="Zoya Settings" aria-modal="true" role="dialog" className="sheet max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Zoya Settings</h2><button aria-label="Close" onClick={()=>setPanel(false)}><X/></button></div>
    <label className="label" htmlFor="key"><KeyRound size={14}/> Gemini API Key</label>
    <input id="key" className="input" autoComplete="off" type="password" placeholder="Paste Google AI Studio API key" value={draft.apiKey} onChange={e=>setDraft(v=>({...v,apiKey:e.target.value}))}/>
    <p className="mt-2 text-xs leading-relaxed text-white/50">Stored in your browser; sent to Google for Gemini Live. Do not put private secrets in your profile. Browser keys are not fully secure.</p>
    <button className="mt-3 text-xs text-pink-300 underline" onClick={removeKey}>Remove saved API key</button>
    <div className="mt-6 grid grid-cols-2 gap-3">
     <div><label className="label" htmlFor="model">Gemini Live Model</label><select id="model" className="input" value={draft.model} onChange={e=>setDraft(v=>({...v,model:e.target.value as Settings['model']}))}><option value="gemini-3.1-flash-live-preview">Gemini 3.1 Preview</option><option value="gemini-3.8-live">Gemini 3.8 Live</option></select></div>
     <div><label className="label" htmlFor="voice">Female Voice</label><select id="voice" className="input" value={draft.voice} onChange={e=>setDraft(v=>({...v,voice:e.target.value as Settings['voice']}))}><option>Aoede</option><option>Zephyr</option><option>Kore</option><option>Leda</option></select></div>
    </div>
    <label className="label mt-6" htmlFor="about"><Heart size={14}/> About Me • Personal Memory</label>
    <textarea id="about" rows={8} maxLength={12000} className="input min-h-44" value={draft.aboutMe} onChange={e=>setDraft(v=>({...v,aboutMe:e.target.value}))}/>
    <p className="mt-2 text-xs text-white/50">Independent from Maya. Your exact Maya About Me text was unavailable, so please edit this starter profile.</p>
    <div className="mt-4 flex gap-5 text-xs text-violet-200"><button className="underline" onClick={exportAbout}>Export About Me</button><label className="cursor-pointer underline">Import JSON<input type="file" accept=".json,application/json" className="sr-only" onChange={e=>void importAbout(e)}/></label></div>
    <button className="primary mt-6 w-full rounded-xl py-4 font-semibold" onClick={save}>Save Changes</button>
   </section>
  </div>}
 </div>;
}
