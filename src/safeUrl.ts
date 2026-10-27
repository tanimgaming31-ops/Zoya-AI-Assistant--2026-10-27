export function safeWebsite(raw:unknown):string|null{
 if(typeof raw!=='string'||raw.length>2048||/[\x00-\x1f\x7f]/.test(raw))return null;
 const s=raw.trim();if(!s)return null;
 try{const u=new URL(/^[a-z][a-z0-9+.-]*:/i.test(s)?s:'https://'+s);
 return['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}
 catch{return null;}
}
export function safeSearch(raw:unknown):string|null{
 return typeof raw==='string'&&raw.trim()?'https://www.google.com/search?q='+encodeURIComponent(raw.trim().slice(0,300)):null;
}