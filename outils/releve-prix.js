// Relève les prix réels sur Open Prices (Open Food Facts) pour les articles du catalogue.
// Aucun prix inventé : ce qui n'est pas trouvé reste vide.
const fs = require("fs"), https = require("https");

// article de l'app  ->  catégorie Open Food Facts + poids moyen d'une pièce (g) si l'unité est "pièce"
const CARTE = {
  "Oignon|pièce":            ["en:onions", 150],
  "Ail|gousse":              ["en:garlic", 5],
  "Carotte|pièce":           ["en:carrots", 120],
  "Carotte|g":               ["en:carrots"],
  "Pommes de terre|g":       ["en:potatoes"],
  "Tomates|pièce":           ["en:tomatoes", 120],
  "Citron|pièce":            ["en:lemons", 100],
  "Citron vert|pièce":       ["en:limes", 80],
  "Courgette|pièce":         ["en:zucchini", 250],
  "Aubergine|pièce":         ["en:aubergines", 300],
  "Poivron|pièce":           ["en:peppers", 180],
  "Poireau|pièce":           ["en:leeks", 200],
  "Navet|pièce":             ["en:turnip", 150],
  "Échalote|pièce":          ["en:shallots", 40],
  "Salade verte|pièce":      ["en:lettuces", 300],
  "Champignons de Paris|g":  ["en:mushrooms"],
  "Épinards frais|g":        ["en:spinachs"],
  "Chou vert|pièce":         ["en:cabbages", 900],
  "Chou vert|g":             ["en:cabbages"],
  "Chou-fleur|g":            ["en:cauliflowers"],
  "Brocoli|g":               ["en:broccoli"],
  "Pomme|pièce":             ["en:apples", 150],
  "Poire|pièce":             ["en:pears", 160],
  "Orange|pièce":            ["en:oranges", 180],
  "Fraises|g":               ["en:strawberries"],
  "Concombre|pièce":         ["en:cucumbers", 350],
  "Potiron|g":               ["en:pumpkins"],
  "Céleri|pièce":            ["en:celery", 400],
  "Céleri-rave|g":           ["en:celery"],
  "Avocat|pièce":            ["en:avocados", 200],

  "Œufs|pièce":              ["en:chicken-eggs", 60],
  "Beurre|g":                ["en:butters"],
  "Lait|ml":                 ["en:milks"],
  "Crème liquide|ml":        ["en:creams"],
  "Crème épaisse|g":         ["en:creams"],
  "Crème épaisse|ml":        ["en:creams"],
  "Gruyère râpé|g":          ["en:grated-cheeses"],
  "Parmesan|g":              ["en:parmigiano-reggiano"],
  "Mozzarella|g":            ["en:mozzarella"],
  "Reblochon|g":             ["en:reblochon"],
  "Cheddar|g":               ["en:cheddar"],
  "Feta|g":                  ["en:feta"],
  "Ricotta|g":               ["en:ricotta"],
  "Yaourt nature|pot":       ["en:plain-yogurts", 125],
  "Fromage de chèvre|g":     ["en:goat-cheeses"],

  "Bœuf haché|g":            ["en:ground-beef"],
  "Bœuf à braiser|g":        ["en:beef"],
  "Steak de bœuf|g":         ["en:beef"],
  "Filet de poulet|g":       ["en:chicken-breasts"],
  "Cuisses de poulet|g":     ["en:chicken-legs"],
  "Lardons fumés|g":         ["en:lardons"],
  "Lard fumé|g":             ["en:lardons"],
  "Jambon blanc|tranche":    ["en:cooked-hams", 40],
  "Saucisse de Toulouse|pièce": ["en:sausages", 120],
  "Merguez|pièce":           ["en:merguez", 70],
  "Chair à saucisse|g":      ["en:sausages"],
  "Pavé de saumon|g":        ["en:salmons"],
  "Dos de cabillaud|g":      ["en:cods"],
  "Moules|g":                ["en:mussels"],
  "Crevettes|g":             ["en:shrimps"],
  "Thon|g":                  ["en:canned-tuna"],

  "Farine|g":                ["en:wheat-flours"],
  "Sucre|g":                 ["en:sugars"],
  "Riz basmati|g":           ["en:rices"],
  "Riz rond|g":              ["en:rices"],
  "Spaghetti|g":             ["en:spaghetti"],
  "Tagliatelles|g":          ["en:pastas"],
  "Fusilli|g":               ["en:pastas"],
  "Macaronis|g":             ["en:pastas"],
  "Pâtes|g":                 ["en:pastas"],
  "Lentilles vertes du Puy|g": ["en:lentils"],
  "Lentilles corail|g":      ["en:lentils"],
  "Pois chiches|g":          ["en:chickpeas"],
  "Haricots blancs|g":       ["en:white-beans"],
  "Haricots rouges|g":       ["en:kidney-beans"],
  "Tomates concassées|g":    ["en:crushed-tomatoes"],
  "Chocolat noir|g":         ["en:dark-chocolates"],
  "Olives noires|g":         ["en:black-olives"],
  "Olives vertes|g":         ["en:green-olives"],
  "Huile d'olive|ml":        ["en:olive-oils"],
  "Semoule|g":               ["en:semolina"],
  "Lait de coco|ml":         ["en:coconut-milks"],
  "Miel|g":                  ["en:honeys"],
  "Cornichons|g":            ["en:pickles"],
  "Vin blanc sec|ml":        ["en:white-wines"],
  "Vin rouge|ml":            ["en:red-wines"],
  "Bière brune|ml":          ["en:beers"],

  "Pain de campagne|pièce":  ["en:breads", 400],
  "Pain de mie|tranche":     ["en:sandwich-breads", 30],
  "Tortillas de blé|pièce":  ["en:tortillas", 45],
  "Frites surgelées|g":      ["en:french-fries"],
  "Petits pois|g":           ["en:peas"],
  "Pâte brisée|pièce":       ["en:shortcrust-pastries", 230],
  "Pâte feuilletée|pièce":   ["en:puff-pastries", 230]
};

const ENSEIGNES = {
  inter:     /intermarch|itm |netto/i,
  lidl:      /lidl/i,
  carrefour: /carrefour/i,
  leclerc:   /leclerc/i
};
// enseignes françaises retenues pour la médiane de référence
const FR = /intermarch|lidl|carrefour|leclerc|auchan|super\s?u|hyper\s?u|casino|monoprix|franprix|cora|aldi|netto|geant|g[ée]ant|utile|spar|match|colruyt/i;

const dodo = ms => new Promise(r => setTimeout(r, ms));
function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "Accept": "application/json", "User-Agent": "semainier-loydot/1.0 (usage personnel)" } }, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on("error", rej);
  });
}
const mediane = t => { if (!t.length) return null; const s = [...t].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

(async () => {
  const sortie = {}, journal = [];
  const cats = [...new Set(Object.values(CARTE).map(c => c[0]))];
  const parCat = {};

  for (const cat of cats) {
    let items = [];
    for (const page of [1, 2]) {
      const j = await get(`https://prices.openfoodfacts.org/api/v1/prices?category_tag=${encodeURIComponent(cat)}&price_per=KILOGRAM&order_by=-date&size=100&page=${page}`);
      items = items.concat(j.items || []);
      if (!j.items || j.items.length < 100) break;
      await dodo(300);
    }
    parCat[cat] = items.filter(i => i.currency === "EUR" && i.price_per === "KILOGRAM" && !i.price_is_discounted);
    journal.push(`${cat} : ${parCat[cat].length} relevés € au kilo`);
    await dodo(300);
  }

  for (const [article, [cat, poids]] of Object.entries(CARTE)) {
    const items = parCat[cat] || [];
    const marque = i => (i.location && (i.location.osm_brand || i.location.osm_name)) || "";
    const fr = items.filter(i => FR.test(marque(i)));
    const ligne = {};
    for (const [cle, re] of Object.entries(ENSEIGNES)) {
      const p = items.filter(i => re.test(marque(i))).map(i => i.price);
      if (p.length >= 2) ligne[cle] = mediane(p);
    }
    const ref = mediane(fr.map(i => i.price));
    if (ref === null && !Object.keys(ligne).length) continue;

    // conversion : Open Prices donne un prix au kilo ; l'app attend le prix dans son unité
    const facteur = poids ? poids / 1000 : 1;   // prix d'une pièce = prix au kilo x poids
    const arrondi = v => v === null ? null : Math.round(v * facteur * 100) / 100;
    const e = {};
    for (const k of Object.keys(ligne)) e[k] = arrondi(ligne[k]);
    sortie[article] = { ref: arrondi(ref), e, n: fr.length };
  }

  fs.writeFileSync(__dirname + "/prix.json", JSON.stringify(sortie, null, 1), "utf8");
  console.log(journal.join("\n"));
  console.log("\n" + Object.keys(sortie).length + " articles tarifés sur " + Object.keys(CARTE).length + " demandés");
  const sansEnseigne = Object.entries(sortie).filter(([, v]) => !Object.keys(v.e).length).length;
  console.log(sansEnseigne + " n'ont qu'un prix de référence (aucune des 4 enseignes relevée)");
})();
