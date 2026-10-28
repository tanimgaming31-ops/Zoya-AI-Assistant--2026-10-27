import {useEffect,useMemo,useRef,useState,type ChangeEvent} from 'react';
import {AudioLines,Heart,KeyRound,Mic,Power,Settings2,ShieldCheck,X,ExternalLink,Video,Upload,CheckCircle2} from 'lucide-react';
import {LiveSession,type State} from './LiveSession';
import {readSettings,saveSettings,type Settings} from './settings';
import {CLIPS,loadVideo,saveVideo,type ClipNumber} from './VideoLibrary';
import {backgroundAvailable,getBackgroundStatus,startBackground,stopBackground} from './BackgroundService';

const labels:Record<State,string>={
 disconnected:'Tap the microphone to start',
 connecting:'Connecting to Gemini Live…',
 listening:'Zoya is listening',
 speaking:'Zoya is speaking'
};
const storedCharacter=()=>{
 try{const n=Number(localStorage.getItem('zoya-character-index-v1'));return n===2||n===3?n as ClipNumber:1 as ClipNumber;}
 catch{return 1 as ClipNumber;}
};
type CharacterResult={success:boolean;character?:number;message?:string};

export default function App(){
 const[settings,setSettings]=useState<Settings>(readSettings);
 const[draft,setDraft]=useState<Settings>(readSettings);
 const[status,setStatus]=useState<State>('disconnected');
 const[level,setLevel]=useState(0);
 const[panel,setPanel]=useState(false);
 const[error,setError]=useState('');
 const[info,setInfo]=useState('');
 const[site,setSite]=useState('');
 const[character,setCharacter]=useState<ClipNumber>(storedCharacter);
 const[clipUrls,setClipUrls]=useState<Record<number,string>>({});
 const[background,setBackground]=useState(false);
 const[loaded,setLoaded]=useState(false);
 const current=useRef<ClipNumber>(character);
 const available=useRef<Record<number,boolean>>({1:false,2:false,3:false});
 const objectUrls=useRef<Record<number,string>>({});
 function changeCharacter(number:number|null):CharacterResult{
  const installed=CLIPS.filter(n=>available.current[n]);
  if(installed.length===0)return{success:false,message:'No character videos imported. Open Settings to import all three videos.'};
  const wanted=number!==null&&CLIPS.includes(number as ClipNumber)?number as ClipNumber:null;
  if(wanted&&!available.current[wanted])return{success:false,message:'Character '+wanted+' has not been imported.'};
  let next:ClipNumber;
  if(wanted)next=wanted;
  else{
   const ix=installed.indexOf(current.current);
   next=installed[(ix+1)%installed.length];
  }
  current.current=next;setCharacter(next);
  try{localStorage.setItem('zoya-character-index-v1',String(next));}catch{/* In-memory selection still works */}
  return{success:true,character:next,message:'Character '+next+' is showing.'};
 }
 const characterCallback=useRef(changeCharacter);
 characterCallback.current=changeCharacter;
 const session=useMemo(()=>new LiveSession({
  onState:setStatus,
  onLevel:setLevel,
  onWebsite:setSite,
  onError:setError,
  onChangeCharacter:n=>characterCallback.current(n)
 }),[]);

 useEffect(()=>{
  let mounted=true;
  async function restore(){
   const urls:Record<number,string>={};
   for(const n of CLIPS){
    try{
     const blob=await loadVideo(n);
     if(blob){const url=URL.createObjectURL(blob);urls[n]=url;available.current[n]=true;objectUrls.current[n]=url;}
    }catch(e){if(mounted)setError(e instanceof Error?e.message:'Could not load saved video.');}
   }
   if(!mounted)return;
   setClipUrls(urls);
   if(!available.current[current.current]){
    const first=CLIPS.find(n=>available.current[n]);if(first){current.current=first;setCharacter(first);}
   }
   setLoaded(true);
  }
  void restore();
  if(backgroundAvailable())void getBackgroundStatus().then(r=>{if(mounted)setBackground(r.running);});
  return()=>{mounted=false;void session.stop();void stopBackground();for(const url of Object.values(objectUrls.current))URL.revokeObjectURL(url);};
 },[session]);

 async function importClip(n:ClipNumber,e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  setError('');
  try{
   await saveVideo(n,file);
   const old=objectUrls.current[n];if(old)URL.revokeObjectURL(old);
   const url=URL.createObjectURL(file);objectUrls.current[n]=url;available.current[n]=true;
   setClipUrls(p=>({...p,[n]:url}));
   changeCharacter(n);
   setInfo('Character '+n+' imported and stored on your phone.');
  }catch(err){setError(err instanceof Error?err.message:'Video import failed.');}
 }
 async function call(){
  setError('');setInfo('');
  if(status!=='disconnected'){await session.stop();await stopBackground();setBackground(false);return;}
  if(!settings.apiKey.trim()){setDraft(settings);setPanel(true);setError('Add your Gemini API key in Settings.');return;}
  try{
   await session.start(settings);
   if(backgroundAvailable()){
    const result=await startBackground();
    setBackground(result.running);
    if(!result.running)setInfo('Background notification unavailable: '+(result.reason||'check Android microphone permissions.'));
   }
  }catch(e){setError(e instanceof Error?e.message:'Voice connection failed.');await stopBackground();setBackground(false);}
 }
 function save(){try{saveSettings(draft);setSettings(draft);setPanel(false);setInfo('Settings saved on this phone.');setError('');}catch{setError('Local storage is not accessible.');}}
 function removeKey(){const next={...draft,apiKey:''};setDraft(next);
  try{saveSettings({...settings,apiKey:''});setSettings(v=>({...v,apiKey:''}));setInfo('API key removed.');}catch{setError('Could not remove API key.');}}
 function exportAbout(){
  const blob=new Blob([JSON.stringify({app:'zoya',aboutMe:draft.aboutMe},null,2)],{type:'application/json'});
  const uri=URL.createObjectURL(blob),a=document.createElement('a');a.href=uri;a.download='zoya-about-me.json';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);
 }
 async function importAbout(e:ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];e.target.value='';if(!file)return;
  try{
   if(file.size>128000)throw Error('File too large.');
   const result:unknown=JSON.parse(await file.text());
   if(!result||typeof result!=='object'||!('aboutMe' in result)||typeof result.aboutMe!=='string')throw Error('Invalid About Me file.');
   setDraft(v=>({...v,aboutMe:result.aboutMe as string}));setInfo('About Me loaded. Tap Save Changes.');
  }catch(err){setError(err instanceof Error?err.message:'Import failed.');}
 }
 const active=status==='listening'||status==='speaking';
 return <div className="zoya-video text-white">
  {clipUrls[character]
   ?<video key={clipUrls[character]} src={clipUrls[character]} autoPlay muted loop playsInline preload="auto" aria-label={'Zoya character '+character+' video'}/>
   :<div className="absolute inset-0 bg-gradient-to-b from-[#120b31] via-[#3b206b] to-[#070512]"/>}
  <div className="dim"/>
  <main className="pointer-events-none relative z-10 flex h-[100dvh] w-full flex-col justify-between px-4 pt-[max(18px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))]">
   <header className="flex items-start justify-between">
    <div className="glass rounded-2xl px-4 py-2"><div className="text-base font-bold tracking-[.25em]">ZOYA ✦</div><div className="text-[10px] text-white/75">CHARACTER {character}</div></div>
    <button aria-label="Open Zoya settings and import characters" className="pointer-events-auto glass rounded-2xl p-3" onClick={()=>{setDraft(settings);setPanel(true);}}><Settings2 size={23}/></button>
   </header>
   <section className="pointer-events-auto mt-auto flex flex-col items-center gap-3 pb-4">
    {!loaded?<p className="glass rounded-xl px-4 py-2 text-xs">Loading videos…</p>:!clipUrls[character]?
     <button className="glass max-w-xs rounded-2xl p-4 text-center text-sm" onClick={()=>{setDraft(settings);setPanel(true);}}>Tap here to add your 3 Zoya character videos in Settings</button>:null}
    {background&&<span className="glass rounded-lg px-3 py-1 text-[11px]">Android foreground notification active</span>}
    <div className="glass rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-widest"><span className={'dot mr-2 '+(active?'active':'')}/>{status}</div>
    <button aria-label={status==='disconnected'?'Start live voice call':'End live voice call'} className="power flex h-16 w-16 items-center justify-center rounded-full" style={{boxShadow:active?`0 0 ${16+Math.min(50,level*150)}px rgba(233,150,255,.65)`:undefined}} onClick={()=>void call()}>
     {status==='disconnected'?<Mic size={28}/>:<Power size={28}/>}
    </button>
    <p className="text-xs text-white/85">{labels[status]}</p>
    <div className="flex items-center gap-3">
     {CLIPS.map(n=><button key={n} aria-label={'Select character '+n} disabled={!available.current[n]} onClick={()=>changeCharacter(n)}
      className={'glass h-9 w-9 rounded-full text-sm '+(character===n?'border-2 border-fuchsia-300':'')+' disabled:opacity-30'}>{n}</button>)}
    </div>
    <p className="text-center text-[10px] text-white/70">Say: “Zoya, change your character” in any language</p>
   </section>
  </main>
  {site&&<section className="pointer-events-auto glass absolute bottom-52 left-3 right-3 z-20 rounded-xl p-4">
   <p className="mb-2 text-sm"><ExternalLink className="mr-2 inline" size={17}/>Zoya requests opening a website</p>
   <p className="mb-3 break-all text-xs">{site}</p>
   <button className="primary rounded-lg px-4 py-2" onClick={()=>{window.open(site,'_blank','noopener,noreferrer');setSite('');}}>Open website</button>
   <button className="ml-4 text-xs underline" onClick={()=>setSite('')}>Dismiss</button>
  </section>}
  {error&&<section role="alert" className="glass absolute left-3 right-3 top-28 z-30 flex gap-3 rounded-xl border border-red-400/60 p-3 text-xs text-white"><span className="flex-1">{error}</span><button aria-label="Dismiss error" onClick={()=>setError('')}><X size={17}/></button></section>}
  {info&&<p role="status" className="glass absolute left-4 right-4 top-28 z-20 rounded-xl p-3 text-center text-xs">{info}</p>}
  {panel&&<div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 sm:items-center sm:p-4">
   <section aria-modal="true" role="dialog" aria-label="Zoya settings" className="sheet max-h-[93dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl">
    <div className="mb-5 flex justify-between"><h2 className="text-xl font-semibold">Zoya Settings</h2><button aria-label="Close settings" onClick={()=>setPanel(false)}><X/></button></div>
    <div className="mb-6">
     <h3 className="label"><Video size={16}/> Character Videos — saved privately on your phone</h3>
     <p className="mb-3 text-xs text-white/60">Select each of the 3 MP4 videos once. Zoya will loop them full-screen and switch by voice in any spoken language.</p>
     <div className="grid grid-cols-3 gap-2">{CLIPS.map(n=><label key={n} className="glass flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-center text-xs">
      {available.current[n]?<CheckCircle2 size={22} className="text-emerald-300"/>:<Upload size={22}/>}
      <span className="mt-2">Character {n}</span>
      <span className="mt-1 text-[10px] text-white/60">{available.current[n]?'Replace MP4':'Add MP4'}</span>
      <input className="sr-only" aria-label={'Import character '+n+' video'} type="file" accept="video/mp4,.mp4" onChange={e=>void importClip(n,e)}/>
     </label>)}</div>
    </div>
    <label className="label" htmlFor="key"><KeyRound size={14}/> Gemini API Key</label>
    <input id="key" className="input" type="password" autoComplete="off" placeholder="Paste Gemini API key" value={draft.apiKey} onChange={e=>setDraft(v=>({...v,apiKey:e.target.value}))}/>
    <p className="mt-2 text-xs text-white/55">Stored in this app and sent to Google Gemini; a WebView API key is not fully secret.</p>
    <button className="mb-5 mt-2 text-xs text-pink-300 underline" onClick={removeKey}>Remove stored key</button>
    <div className="grid grid-cols-2 gap-3">
     <div><label className="label" htmlFor="model">Live Model</label><select id="model" className="input" value={draft.model} onChange={e=>setDraft(v=>({...v,model:e.target.value as Settings['model']}))}><option value="gemini-3.8-live">Gemini 3.8 Live</option><option value="gemini-3.1-flash-live-preview">3.1 Flash Preview</option></select></div>
     <div><label className="label" htmlFor="voice">Voice</label><select id="voice" className="input" value={draft.voice} onChange={e=>setDraft(v=>({...v,voice:e.target.value as Settings['voice']}))}><option>Aoede</option><option>Zephyr</option><option>Kore</option><option>Leda</option></select></div>
    </div>
    <label className="label mt-5" htmlFor="about"><Heart size={14}/> About Me</label>
    <textarea id="about" rows={5} className="input min-h-32" maxLength={12000} value={draft.aboutMe} onChange={e=>setDraft(v=>({...v,aboutMe:e.target.value}))}/>
    <p className="mt-2 text-[11px] text-white/50">Zoya's profile is separate from Maya. Videos are not uploaded to Gemini.</p>
    <div className="mt-3 flex gap-4 text-xs text-violet-200"><button className="underline" onClick={exportAbout}>Export About Me</button><label className="cursor-pointer underline">Import JSON<input className="sr-only" type="file" accept=".json,application/json" onChange={e=>void importAbout(e)}/></label></div>
    <div className="glass mt-5 rounded-xl p-3 text-xs leading-relaxed text-white/75">
     <div className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck size={15}/>{backgroundAvailable()?'Android Background Notification':'Background Limits'}</div>
     {backgroundAvailable()?
      'When a call starts, Android starts a foreground notification to improve process survival. Android may still pause WebView microphone, audio, or Gemini sessions when locked or in the background. Accessibility cannot bypass that restriction.':
      'Browser tabs cannot guarantee background Gemini Live voice. Use the Android app for a foreground-service notification.'}
     <div className="mt-2 flex items-center gap-2"><AudioLines size={14}/>{background?'Foreground notification running':'Foreground notification is not running'}</div>
    </div>
    <button className="primary mt-5 w-full rounded-xl py-4 font-semibold" onClick={save}>Save Changes</button>
   </section>
  </div>}
 </div>;
}
