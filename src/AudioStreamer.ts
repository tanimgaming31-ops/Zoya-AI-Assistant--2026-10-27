export class AudioStreamer{
 private ctx:AudioContext|null=null;
 private stream:MediaStream|null=null;
 private source:MediaStreamAudioSourceNode|null=null;
 private node:AudioWorkletNode|null=null;
 async start(onChunk:(base64:string)=>void,onLevel:(n:number)=>void){
  if(!navigator.mediaDevices?.getUserMedia||!window.AudioWorkletNode)throw Error('Use Chrome over HTTPS and allow microphone access.');
  try{
   this.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   this.ctx=new AudioContext({latencyHint:'interactive'});
   await this.ctx.audioWorklet.addModule(new URL('./audio-worklet.js',import.meta.url));
   this.source=this.ctx.createMediaStreamSource(this.stream);
   this.node=new AudioWorkletNode(this.ctx,'zoya-audio-input');
   this.node.port.onmessage=(e:MessageEvent<{type:string;buffer:ArrayBuffer;level:number}>)=>{
     if(e.data.type!=='pcm')return;
     onLevel(e.data.level);
     const bytes=new Uint8Array(e.data.buffer);let binary='';
     for(let i=0;i<bytes.length;i++)binary+=String.fromCharCode(bytes[i]);
     onChunk(btoa(binary));
   };
   this.source.connect(this.node);this.node.connect(this.ctx.destination);
   await this.ctx.resume();
  }catch(e){await this.stop();throw e;}
 }
 async stop(){
  this.node?.port.close();this.node?.disconnect();this.source?.disconnect();this.stream?.getTracks().forEach(t=>t.stop());
  this.node=null;this.source=null;this.stream=null;
  const c=this.ctx;this.ctx=null;if(c&&c.state!=='closed')await c.close();
 }
}
export class AudioPlayback{
 private ctx:AudioContext|null=null;
 private nextAt=0;
 private nodes=new Set<AudioBufferSourceNode>();
 onBusy:(v:boolean)=>void=()=>{};
 async start(){this.ctx=new AudioContext({sampleRate:24000,latencyHint:'interactive'});await this.ctx.resume();this.nextAt=this.ctx.currentTime;}
 isPlaying(){return this.nodes.size>0;}
 enqueue(encoded:string){
  if(!this.ctx)return;
  const bytes=atob(encoded),count=Math.floor(bytes.length/2);if(!count)return;
  const buffer=this.ctx.createBuffer(1,count,24000),data=buffer.getChannelData(0);
  for(let i=0;i<count;i++){const n=bytes.charCodeAt(i*2)|(bytes.charCodeAt(i*2+1)<<8);data[i]=(n<32768?n:n-65536)/32768;}
  const node=this.ctx.createBufferSource();node.buffer=buffer;node.connect(this.ctx.destination);
  const at=Math.max(this.ctx.currentTime+.015,this.nextAt);node.start(at);this.nextAt=at+buffer.duration;
  this.nodes.add(node);this.onBusy(true);
  node.onended=()=>{this.nodes.delete(node);if(this.nodes.size===0)this.onBusy(false);};
 }
 interrupt(){const a=[...this.nodes];this.nodes.clear();this.nextAt=this.ctx?.currentTime||0;for(const n of a)try{n.stop();}catch{/* stopped */}this.onBusy(false);}
 async stop(){this.interrupt();const c=this.ctx;this.ctx=null;if(c&&c.state!=='closed')await c.close();}
}
