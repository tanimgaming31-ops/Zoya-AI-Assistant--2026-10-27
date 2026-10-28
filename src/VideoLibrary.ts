/** User-selected MP4 clips are saved locally and never sent to the AI. */
const DB='zoya-character-videos-v1';
const STORE='videos';
export const CLIPS=[1,2,3] as const;
export type ClipNumber=1|2|3;
function openDatabase():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(!('indexedDB'in window)){reject(Error('Video storage is unavailable on this device.'));return;}
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
  req.onerror=()=>reject(req.error||Error('Cannot open Zoya video storage.'));
  req.onsuccess=()=>resolve(req.result);
 });
}
export async function loadVideo(number:ClipNumber):Promise<Blob|null>{
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readonly');
  const request=tx.objectStore(STORE).get(number);
  request.onsuccess=()=>resolve(request.result instanceof Blob?request.result:null);
  request.onerror=()=>reject(request.error||Error('Could not load video.'));
  tx.oncomplete=()=>db.close();
  tx.onerror=()=>{db.close();};
 });
}
export async function saveVideo(number:ClipNumber,video:File):Promise<void>{
 if(!(/\.mp4$/i.test(video.name)||video.type==='video/mp4'))throw Error('Choose an MP4 video.');
 if(video.size===0||video.size>60*1024*1024)throw Error('Video size must be between 1 byte and 60 MB.');
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite');
  tx.objectStore(STORE).put(video,number);
  tx.oncomplete=()=>{db.close();resolve();};
  tx.onerror=()=>{db.close();reject(tx.error||Error('Could not save this video.'));};
 });
}
