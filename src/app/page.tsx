"use client";
import {useEffect,useMemo,useState} from "react";
import {useCart} from "@/context/cart-context";

type Item={id:string;name:string;description:string;price_cents:number;category:string;image:string;available:boolean;sort_order:number};

function SocialIcon({type}:{type:"whatsapp"|"tiktok"|"snapchat"}){
 if(type==="whatsapp") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .4 5.2.4 11.6c0 2 .5 3.9 1.5 5.6L.3 23.7l6.7-1.7c1.6.9 3.3 1.3 5.1 1.3h.1c6.4 0 11.6-5.2 11.6-11.6 0-3.1-1.2-6-3.3-8.2Zm-8.3 17.8h-.1c-1.6 0-3.2-.4-4.6-1.2l-.3-.2-4 .9 1.1-3.9-.2-.3a9.7 9.7 0 1 1 8.1 4.7Zm5.3-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.6.1-.2.1-.4 0-.6l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.1.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2 .1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.3Z"/></svg>;
 if(type==="tiktok") return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 5.3c-1.5-1-2.4-2.6-2.5-4.3h-3.5v15.1c0 1.8-1.5 3.2-3.3 3.2-1.8 0-3.2-1.4-3.2-3.1 0-1.8 1.5-3.2 3.3-3.2.3 0 .7 0 1 .1V9.5c-.3 0-.7-.1-1-.1-3.7 0-6.7 3-6.7 6.7s3 6.6 6.7 6.6c3.7 0 6.7-3 6.7-6.6V8.4c1.3.9 2.8 1.5 4.5 1.5V6.4c-.7 0-1.4-.3-2-.7Z"/></svg>;
 return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.2c-3.7 0-6.8 2.4-7.9 5.7C2.1 7.6.8 9.2.8 11.3c0 1.5.7 2.8 1.8 3.7-.1.4-.2.9-.2 1.3 0 2.4 2 4.3 4.4 4.3.5 0 .9-.1 1.3-.2 1 .9 2.3 1.5 3.8 1.5s2.8-.6 3.8-1.5c.4.1.9.2 1.3.2 2.4 0 4.4-1.9 4.4-4.3 0-.5-.1-.9-.2-1.3 1.1-.9 1.8-2.2 1.8-3.7 0-2.1-1.3-3.7-3.3-4.4C16.8 3.6 15.7 1.2 12 1.2Zm0 17.2c-1.1 0-2.1-.4-2.8-1.1-.4.2-.9.3-1.4.3-1.5 0-2.7-1.1-2.7-2.5 0-.6.2-1.1.6-1.5-.9-.5-1.5-1.4-1.5-2.5 0-1.5 1.2-2.6 2.8-2.7C7.4 5.8 9.5 4 12 4s4.6 1.8 5 4.4c1.6.1 2.8 1.2 2.8 2.7 0 1.1-.6 2-1.5 2.5.4.4.6.9.6 1.5 0 1.4-1.2 2.5-2.7 2.5-.5 0-1-.1-1.4-.3-.7.7-1.7 1.1-2.8 1.1Z"/><path fill="currentColor" d="M9 11.1c.6 0 1.1-.4 1.1-.9s-.5-.9-1.1-.9-1.1.4-1.1.9.5.9 1.1.9Zm6 0c.6 0 1.1-.4 1.1-.9s-.5-.9-1.1-.9-1.1.4-1.1.9.5.9 1.1.9Zm-5.2 2.3c.8.7 1.6 1 2.2 1s1.4-.3 2.2-1c-.1-.3-.3-.5-.6-.5h-3.2c-.3 0-.5.2-.6.5Z"/></svg>;
}

export default function Home(){
 const{add,count}=useCart();
 const[items,setItems]=useState<Item[]>([]);
 const[category,setCategory]=useState("All");
 useEffect(()=>{fetch("/api/menu",{cache:"no-store"}).then(r=>r.ok?r.json():{items:[]}).then(d=>setItems(d.items||[])).catch(()=>setItems([]));},[]);
 const visible=useMemo(()=>items.filter(i=>category==="All"||i.category.toLowerCase()===category.toLowerCase()).slice(0,3),[items,category]);
 const featured=items[0];
 const categories=["All","Rice & Bowls","Chicken","Sides","Specials"];
 return <main>
  <style jsx global>{`@media(max-width:800px){.nav-book,.nav-order{min-height:50px;padding:0 16px;font-size:13px}.hero-actions{width:100%;flex-direction:column;align-items:stretch}.hero-primary,.hero-secondary{width:100%;min-height:56px;justify-content:center}.hero-secondary{padding:0 18px;border:1px solid var(--line);border-radius:999px}.order-strip{display:none}.booking-cta .primary{min-height:56px;font-size:15px}.food-image button{width:54px;height:54px}.scribble{display:none}}@media(max-width:430px){.nav-book{display:inline-flex}.nav-order{padding-inline:14px}.nav-actions{gap:6px}.nav-book,.nav-order{min-height:46px;font-size:12px}.brand{font-size:13px}.brand span{width:30px;height:30px}}`}</style>
  <nav className="nav shell">
   <a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a>
   <div className="nav-links"><a href="/menu">Menu</a><a href="/book">Book</a><a href="#story">Our story</a><a href="#contact">Contact</a></div>
   <div className="nav-actions"><a className="nav-book" href="/book">Book a table</a><a className="nav-order" href="/menu">Order food {count?`(${count})`:""}</a></div>
  </nav>
  <section id="top" className="hero shell">
   <div className="hero-copy"><p className="eyebrow">WINNIPEG • COMFORT FOOD</p><h1>Food that feels like <em>home.</em></h1><p className="hero-text">Big flavour, warm plates and comfort made with intention. Browse the menu, order ahead or book a table.</p><div className="hero-actions"><a className="primary hero-primary" href="/menu">Order food <span>→</span></a><a className="secondary hero-secondary" href="/book">Book a table</a></div><div className="notice"><span>✦</span><strong>24–48 hour notice</strong><small>Freshly prepared to order</small></div></div>
   <div className="hero-art"><div className="hero-image" style={featured?.image?{backgroundImage:`linear-gradient(180deg,rgba(20,15,10,.03),rgba(20,15,10,.28)),url(${featured.image})`}:undefined}/><div className="floating-card">{featured?<><span>Today&apos;s pick</span><strong>{featured.name}</strong><b>${(featured.price_cents/100).toFixed(2)} CAD</b></>:<><span>Today&apos;s pick</span><strong>Fresh from the kitchen</strong><b>See menu</b></>}</div><div className="scribble">made with<br/><strong>love ✦</strong></div></div>
  </section>
  <section id="menu" className="menu-section shell">
   <div className="section-head"><div><p className="eyebrow">FROM THE KITCHEN</p><h2>What are you craving?</h2></div><a className="view-menu-link" href="/menu">View full menu →</a></div>
   <div className="categories">{categories.map(c=><button key={c} className={category===c?"active":""} type="button" onClick={()=>setCategory(c)}>{c}</button>)}</div>
   <div className="food-grid">{visible.map(item=><article className="food-card" key={item.id}><div className="food-image" style={{backgroundImage:item.image?`url(${item.image})`:undefined}}><button type="button" onClick={()=>add({...item,price:item.price_cents/100})} aria-label={`Add ${item.name} to order`}>+</button></div><div className="food-info"><div><h3>{item.name}</h3><p>{item.description}</p></div><strong>${(item.price_cents/100).toFixed(2)}</strong></div></article>)}{!visible.length&&<div className="menu-empty">No dishes in this category yet.</div>}</div>
  </section>
  <section className="booking-cta shell"><div><p className="eyebrow">MAKING IT A SPECIAL ONE?</p><h2>Save your seat at the table.</h2><p>For dinners, birthdays and celebrations, send us a booking request and we&apos;ll confirm the details with you.</p></div><a className="primary" href="/book">Book with us <span>→</span></a></section>
  <section id="story" className="story shell"><div className="story-photo"/><div className="story-copy"><p className="eyebrow">A LITTLE ABOUT US</p><h2>Zee&apos;s comfort kitchen is my baby.</h2><p>From the first order to the last bite, everything is made to feel personal. This is food for birthdays, busy weeks, family tables and the days when you simply need something good.</p><a className="text-link" href="#contact">Get in touch →</a></div></section>
  <footer id="contact" className="footer shell">
   <div className="footer-main">
    <a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a>
    <p>Comfort food, made with love in Winnipeg, Manitoba.</p>
    <div className="footer-contact">
     <a className="contact-item" href="https://wa.me/12049635748" target="_blank" rel="noreferrer"><span className="contact-icon"><SocialIcon type="whatsapp"/></span><span><b>WhatsApp</b><small>204-963-5748</small></span></a>
     <a className="contact-item" href="https://www.tiktok.com/@zeescomfortkitchen" target="_blank" rel="noreferrer"><span className="contact-icon"><SocialIcon type="tiktok"/></span><span><b>TikTok</b><small>@zeescomfortkitchen</small></span></a>
     <a className="contact-item" href="https://www.snapchat.com/add/monkele_1" target="_blank" rel="noreferrer"><span className="contact-icon"><SocialIcon type="snapchat"/></span><span><b>Snapchat</b><small>@monkele_1</small></span></a>
    </div>
   </div>
   <div className="footer-side">
    <a className="footer-book" href="/book">Book a table <span>→</span></a>
    <div className="footer-meta"><span>24–48hr notice</span><span>Pickup &amp; delivery available on request</span><span>© 2026 Zee&apos;s Kitchen</span></div>
   </div>
  </footer>
 </main>
}
