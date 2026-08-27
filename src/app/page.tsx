"use client";

import { useCart } from "@/context/cart-context";
import { menuItems } from "@/lib/menu";

export default function Home() {
  const { add, count } = useCart();
  const featured = menuItems.slice(0, 3);
  return (
    <main>
      <nav className="nav shell"><a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a><div className="nav-links"><a href="#menu">Menu</a><a href="#story">Our story</a><a href="#contact">Contact</a></div><a className="nav-order" href="/cart">Cart {count ? `(${count})` : ""}</a></nav>
      <section id="top" className="hero shell"><div className="hero-copy"><p className="eyebrow">WINNIPEG • COMFORT FOOD</p><h1>Food that feels like <em>home.</em></h1><p className="hero-text">Big flavour, warm plates and comfort made with intention. Browse the menu and place your order in a few taps.</p><div className="hero-actions"><a className="primary" href="#menu">Browse the menu <span>→</span></a><a className="secondary" href="#story">Meet Zee</a></div><div className="notice"><span>✦</span><strong>24–48 hour notice</strong><small>Freshly prepared to order</small></div></div><div className="hero-art"><div className="hero-image"/><div className="floating-card"><span>Today&apos;s pick</span><strong>{featured[0].name}</strong><b>${featured[0].price}</b></div><div className="scribble">made with<br/><strong>love ✦</strong></div></div></section>
      <section id="menu" className="menu-section shell"><div className="section-head"><div><p className="eyebrow">FROM THE KITCHEN</p><h2>What are you craving?</h2></div><a href="/menu">View full menu →</a></div><div className="categories"><button className="active">All</button><button>Rice & bowls</button><button>Chicken</button><button>Sides</button><button>Specials</button></div><div className="food-grid">{featured.map(item => <article className="food-card" key={item.id}><div className="food-image" style={{backgroundImage:`url(${item.image})`}}><button type="button" onClick={()=>add(item)} aria-label={`Add ${item.name}`}>+</button></div><div className="food-info"><div><h3>{item.name}</h3><p>{item.description}</p></div><strong>${item.price}</strong></div></article>)}</div></section>
      <section id="story" className="story shell"><div className="story-photo"/><div className="story-copy"><p className="eyebrow">A LITTLE ABOUT US</p><h2>Zee&apos;s comfort kitchen is my baby.</h2><p>From the first order to the last bite, everything is made to feel personal. This is food for birthdays, busy weeks, family tables and the days when you simply need something good.</p><a className="text-link" href="#contact">Get in touch →</a></div></section>
      <section className="order-strip shell"><div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Let&apos;s get dinner sorted.</h2></div><a className="primary" href="/menu">Start an order <span>→</span></a></section>
      <footer id="contact" className="footer shell"><div><a className="brand" href="#top"><span>Z</span> Zee&apos;s Kitchen</a><p>Comfort food, made with love in Winnipeg.</p></div><div className="footer-meta"><span>24–48hr notice</span><span>© 2026 Zee&apos;s Kitchen</span></div></footer>
    </main>
  );
}
