import {Shell,Screen} from './components';
import type {Deck} from '../../engine/types';
import './slides.css';
import icon from './assets/icon.png';
import map from './assets/ios-map.png';
import planner from './assets/ios-planner.png';
import tracking from './assets/ios-tracking.png';

// An example of a fully custom deck: its own 1600×900 layout, scaled to the
// engine's 1280×720 canvas, with every style scoped under .arrayah-deck.
const elements=[
 <Shell key="1" n={1} kind="cover"><div className="cover-copy"><h1>platform<span className="dot">.</span></h1><p className="intro">a public transport app<br/>for nsw.</p><p className="cover-byline">originally built for me</p></div><div className="cover-image"><Screen src={map}/></div></Shell>,
 <Shell key="2" n={2} kind="about"><main><p className="eyebrow">my story</p><h2>obsessed with ai-assisted<br/>app development.</h2><div className="photo-row">{[1,2,3].map(n=><figure className="polaroid" key={n} aria-label={`space for personal photo ${n}`}><div className="photo-space"/><div className="photo-caption"/></figure>)}</div></main></Shell>,
 <Shell key="3" n={3} kind="problem"><main><h2>why another<br/>transit app?</h2><div className="problem-list"><p>dated interfaces</p><p>frustrating navigation</p><p>privacy concerns</p></div><p className="reason">i want a transport app i can rely on every day.</p></main></Shell>,
 <Shell key="4" n={4} kind="progress"><main><h2>what i’ve done so far</h2><div className="progress-copy"><section><h3>overall progress</h3><p>the app is in beta and close to launch.<br/>i’m working through the final polish.</p></section><section><h3>during arrayah</h3><ul className="arrayah-progress"><li>worked on ios and android visual parity</li><li>researched my target users and how to reach them</li><li>talked to people about the app</li><li>3d printed stupid shit</li></ul></section></div><div className="progress-shot"><Screen src={planner} label="journey planning"/><Screen src={tracking} label="journey tracking"/></div></main></Shell>,
 <Shell key="5" n={5} kind="product"><div className="product-copy"><h2>i’m building platform, a public transport app that helps nsw commuters plan journeys and follow their trips.</h2></div><div className="screens"><Screen src={planner} label="journey planning"/><Screen src={tracking} label="journey tracking"/></div></Shell>,
 <Shell key="6" n={6} kind="closing"><main><h2>getting ready<br/>to launch.</h2><p className="next">keep testing. finish the polish.</p><div className="ask"><h3>i’d love help with</h3><p>social media content<br/>and reaching my first users.</p></div><p className="chat">come chat after this.</p></main></Shell>
];

export const arrayahDeck: Deck = {slug:'arrayah-2026-09-20',title:'platform at arrayah',date:'2026-09-20',accent:'#b93723',media:[map,planner,tracking,icon].map(src=>({kind:'image',src})),slides:elements.map((element,index)=>({id:`arrayah-${index+1}`,element:<div className="arrayah-deck"><div className="arrayah-canvas">{element}</div></div>}))};
