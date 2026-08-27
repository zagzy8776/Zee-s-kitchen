const menu = [
  { category: "Rice & Bowls", items: ["Signature Jollof Bowl", "Fried Rice Bowl", "Party Jollof Tray"] },
  { category: "Chicken", items: ["Comfort Chicken Box", "Peppered Chicken", "Crispy Chicken"] },
  { category: "Sides", items: ["Plantain", "Coleslaw", "House Sauce"] },
  { category: "Specials", items: ["Weekend Special", "Family Comfort Tray"] },
];

export default function MenuPage() {
  return (
    <main className="menu-page shell">
      <a className="back" href="/">← Back home</a>
      <header className="menu-header">
        <p className="eyebrow">ZEE&apos;S KITCHEN</p>
        <h1>The menu.</h1>
        <p>Freshly prepared comfort food. Please allow 24–48 hours for orders.</p>
      </header>
      <div className="menu-list">
        {menu.map((group) => (
          <section key={group.category}>
            <h2>{group.category}</h2>
            {group.items.map((item, index) => (
              <article className="menu-row" key={item}>
                <div><span>0{index + 1}</span><h3>{item}</h3></div>
                <button>Add to order <b>+</b></button>
              </article>
            ))}
          </section>
        ))}
      </div>
      <div className="menu-cta"><strong>Ready to order?</strong><a className="primary" href="/#menu">Start your order <span>→</span></a></div>
    </main>
  );
}
