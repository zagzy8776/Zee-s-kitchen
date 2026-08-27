"use client";
import {useEffect,useMemo,useState} from "react";
import {useCart} from "@/context/cart-context";

type Item={id:string;name:string;description:string;price_cents:number;category:string;image:string;available:boolean;sort_order:number};

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
     <a className="contact-item" href="https://wa.me/12049635748" target="_blank" rel="noreferrer"><span className="contact-icon">WA</span><span><b>WhatsApp</b><small>204-963-5748</small></span></a>
     <a className="contact-item" href="https://www.tiktok.com/@zeescomfortkitchen" target="_blank" rel="noreferrer"><span className="contact-icon">TT</span><span><b>TikTok</b><small>@zeescomfortkitchen</small></span></a>
     <a className="contact-item" href="https://www.snapchat.com/add/monkele_1" target="_blank" rel="noreferrer"><span className="contact-icon">SC</span><span><b>Snapchat</b><small>@monkele_1</small></span></a>
    </div>
   </div>
   <div className="footer-side">
    <a className="footer-book" href="/book">Book a table <span>→</span></a>
    <div className="footer-meta"><span>24–48hr notice</span><span>Pickup &amp; delivery available on request</span><span>© 2026 Zee&apos;s Kitchen</span></div>
   </div>
  </footer>
 </main>
}
