class ZoyaAudioInput extends AudioWorkletProcessor {
 constructor(){super();this.index=0;this.last=0;this.next=0;this.frame=new Int16Array(1024);this.n=0;this.energy=0;}
 process(inputs,outputs){
  for(const channel of outputs[0]||[])channel.fill(0);
  const audio=inputs[0]?.[0];if(!audio)return true;
  const step=sampleRate/16000;
  for(let i=0;i<audio.length;i++){
   const sample=audio[i];
   while(this.next<=this.index){
    const fraction=Math.max(0,Math.min(1,this.next-this.index+1));
    const v=Math.max(-1,Math.min(1,this.last+(sample-this.last)*fraction));
    this.frame[this.n++]=Math.round(v<0?v*32768:v*32767);
    this.energy+=v*v;this.next+=step;
    if(this.n===1024){
      const buffer=this.frame.buffer;this.port.postMessage({type:'pcm',buffer,level:Math.sqrt(this.energy/1024)},[buffer]);
      this.frame=new Int16Array(1024);this.n=0;this.energy=0;
    }
   }
   this.last=sample;this.index++;
  }
  return true;
 }
}
registerProcessor('zoya-audio-input',ZoyaAudioInput);
