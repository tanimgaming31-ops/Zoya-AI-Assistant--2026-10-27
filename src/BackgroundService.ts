import {Capacitor,registerPlugin} from '@capacitor/core';
type StatusResult={running:boolean;reason?:string};
type NativeBackground={
 start():Promise<StatusResult>;
 stop():Promise<StatusResult>;
 status():Promise<StatusResult>;
};
const native=registerPlugin<NativeBackground>('ZoyaBackground');
export function backgroundAvailable():boolean{return Capacitor.isNativePlatform()&&Capacitor.getPlatform()==='android';}
export async function startBackground():Promise<StatusResult>{
 if(!backgroundAvailable())return{running:false,reason:'Native Android APK required.'};
 try{return await native.start();}catch(err){return{running:false,reason:err instanceof Error?err.message:'Could not activate Android foreground notification.'};}
}
export async function stopBackground():Promise<void>{
 if(!backgroundAvailable())return;
 try{await native.stop();}catch{/* Android may have already stopped the service. */}
}
export async function getBackgroundStatus():Promise<StatusResult>{
 if(!backgroundAvailable())return{running:false,reason:'Only available in Android APK.'};
 try{return await native.status();}catch{return{running:false};}
}
