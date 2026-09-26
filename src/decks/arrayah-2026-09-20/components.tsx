import type {ReactNode} from 'react';
import icon from './assets/icon.png';
function Brand(){return <div className="brand"><img src={icon} alt=""/><span>platform</span></div>}
export function Screen({src,label}: {src:string;label?:string}){return <figure><img className="screen" src={src} alt={label}/>{label&&<figcaption>{label}</figcaption>}</figure>}
export function Shell({n,children,kind=''}: {n:number;children:ReactNode;kind?:string}){return <article className={'slide '+kind} data-slide={n}><header><Brand/><span className="section">{['arrayah showcase','about me','the problem','progress','what i’m building','next steps'][n-1]}</span></header>{children}<footer><span>immanuel lam</span><span>{String(n).padStart(2,'0')} / 06</span></footer></article>}
