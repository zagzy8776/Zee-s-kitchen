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
  <nav className="nav shell">
   <a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a>
   <div className="nav-links"><a href="/menu">Menu</a><a href="/book">Book</a><a href="#story">Our story</a><a href="#contact">Contact</a></div>
   <div className="nav-actions"><a className="nav-book" href="/book">Book a table</a><a className="nav-order" href="/cart">Cart {count?`(${count})`:""}</a></div>
  </nav>
  <section id="top" className="hero shell">
   <div className="hero-copy"><p className="eyebrow">WINNIPEG • COMFORT FOOD</p><h1>Food that feels like <em>home.</em></h1><p className="hero-text">Big flavour, warm plates and comfort made with intention. Browse the menu, order ahead or book a table.</p><div className="hero-actions"><a className="primary hero-primary" href="/menu">Order food <span>→</span></a><a className="secondary hero-secondary" href="/book">Book a table</a></div><div className="notice"><span>✦</span><strong>24–48 hour notice</strong><small>Freshly prepared to order</small></div></div>
   <div className="hero-art"><div className="hero-image"/><div className="floating-card">{featured?<><span>Today&apos;s pick</span><strong>{featured.name}</strong><b>${(featured.price_cents/100).toFixed(2)}</b></>:<><span>Today&apos;s pick</span><strong>Fresh from the kitchen</strong><b>See menu</b></>}</div><div className="scribble">made with<br/><strong>love ✦</strong></div></div>
  </section>
  <section id="menu" className="menu-section shell">
   <div className="section-head"><div><p className="eyebrow">FROM THE KITCHEN</p><h2>What are you craving?</h2></div><a className="view-menu-link" href="/menu">View full menu →</a></div>
   <div className="categories">{categories.map(c=><button key={c} className={category===c?"active":""} type="button" onClick={()=>setCategory(c)}>{c}</button>)}</div>
   <div className="food-grid">{visible.map(item=><article className="food-card" key={item.id}><div className="food-image" style={{backgroundImage:`url(${item.image})`}}><button type="button" onClick={()=>add({...item,price:item.price_cents/100})} aria-label={`Add ${item.name} to order`}>+</button></div><div className="food-info"><div><h3>{item.name}</h3><p>{item.description}</p></div><strong>${(item.price_cents/100).toFixed(2)}</strong></div></article>)}{!visible.length&&<div className="menu-empty">No dishes in this category yet.</div>}</div>
  </section>
  <section className="booking-cta shell"><div><p className="eyebrow">MAKING IT A SPECIAL ONE?</p><h2>Save your seat at the table.</h2><p>For dinners, birthdays and celebrations, send us a booking request and we&apos;ll confirm the details with you.</p></div><a className="primary" href="/book">Book with us <span>→</span></a></section>
  <section id="story" className="story shell"><div className="story-photo"/><div className="story-copy"><p className="eyebrow">A LITTLE ABOUT US</p><h2>Zee&apos;s comfort kitchen is my baby.</h2><p>From the first order to the last bite, everything is made to feel personal. This is food for birthdays, busy weeks, family tables and the days when you simply need something good.</p><a className="text-link" href="#contact">Get in touch →</a></div></section>
  <section className="order-strip shell"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Let&apos;s get dinner sorted.</h2></div><div className="hero-actions"><a className="secondary" href="/book">Book a table</a><a className="primary" href="/menu">Start an order <span>→</span></a></div></section>
  <footer id="contact" className="footer shell"><div><a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a><p>Comfort food, made with love in Winnipeg, Manitoba.</p></div><div className="footer-meta"><span>24–48hr notice</span><span>© 2026 Zee&apos;s Kitchen</span></div></footer>
 </main>
}
