export type Model='gemini-3.1-flash-live-preview'|'gemini-3.8-live';
export type Voice='Aoede'|'Zephyr'|'Kore'|'Leda';
export type Settings={apiKey:string;model:Model;voice:Voice;aboutMe:string};
export const defaultProfile=['Preferred languages: Bangla, English, Tagalog, Indonesian.','Match my spoken language. Be warm, natural and helpful.','My name or nickname: (edit this).','Things Zoya should know about me: (edit this).'].join('\n');
export const defaults:Settings={apiKey:'',model:'gemini-3.1-flash-live-preview',voice:'Aoede',aboutMe:defaultProfile};
export const storageName='zoya-independent-settings-v1';
export function readSettings():Settings{try{
 const d:Partial<Settings>=JSON.parse(localStorage.getItem(storageName)||'{}');
 return{apiKey:typeof d.apiKey==='string'?d.apiKey:'',
 model:d.model==='gemini-3.8-live'?d.model:defaults.model,
 voice:['Aoede','Zephyr','Kore','Leda'].includes(d.voice||'')?d.voice!:defaults.voice,
 aboutMe:typeof d.aboutMe==='string'?d.aboutMe:defaultProfile};
 }catch{return {...defaults};}}
export function saveSettings(s:Settings){localStorage.setItem(storageName,JSON.stringify(s));}
