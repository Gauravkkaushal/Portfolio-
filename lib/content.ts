export const GH = "https://github.com/Gauravkkaushal";
export const WORDS = ["React","Next.js","TypeScript","AI","Agents","Python","Node","MongoDB","AWS","Firebase","Cloudflare","Testing"];
export const ART = [
  ["cards","#3b82f6","<App />"],["rings","#e5e7eb","app/"],["code","#3178c6","type Props"],["net","#fb5e28","gemini()"],
  ["cursor","#a78bfa","agent.run"],["dots","#facc15","def main"],["hex","#22c55e","node"],["code","#10b981","{ _id }"],
  ["bars","#ff9900","SAA-C03"],["glow","#ffca28","onSnapshot"],["cloud","#f38020","R2"],["checks","#14b8a6","expect()"]];
// gate films: name, label, link, card bg, big-word colour, text colour, underline, glow (lights the vault), lines
// product films by project name, used by the Work frame
export const FILMS: Record<string, string> = { "CreatorFlow AI": "/creatorflow-video/creatorflow-ai", "NetraShield": "/netrashield-video/netrashield", "ShopMall": "/shopmall-video/shopmall" };
export const GATE = [
  ["CreatorFlow AI","2026",GH+"/CreatorFlow","#ff7d32","#17110f","#17110f","#ffe14a","#ff7d32",["What does your",["audience","comments","next video"],"really want?"]],
  ["NetraShield","Agent",GH+"/Browser-s-Agent","#22113b","#c79bff","#f2f2ef","#ff7d32","#9b5cff",["Say it once.",["it browses","it reads","it clicks"],"for you."]],
  ["ShopMall","MERN",GH+"/Shopmall-ecommerce","#d6f24c","#0f1a12","#0f1a12","#ff7d32","#b8e03a",["From catalogue",["to cart","to checkout","delivered"],"in one flow."]],
  ["MaxVelocityLabs","Internship",GH,"#141a36","#6cc0ff","#f2f2ef","#ff7d32","#4c8dff",["Shipped for",["500+ users","15+ components","10+ screens"],"in real time."]],
  ["AWS SAA-C03","Certified",GH,"#f2f2ef","#ff8a00","#11151c","#11151c","#ffb547",["Certified",["Architect","on AWS","SAA-C03"],"since 2026."]]] as const;
export const MAKE = [
  ["Frontend that ships","Responsive, mobile-first interfaces in React and Next.js, built from reusable components so sprints move faster and layout bugs stay down.",
    [["MaxVelocityLabs","Internship",GH],["ShopMall","Project",GH+"/Shopmall-ecommerce"],["CreatorFlow AI","Project",GH+"/CreatorFlow"]],"React"],
  ["AI products and agents","LLM-powered analytics and content strategy, and agents that read the screen and act on plain-language instructions.",
    [["CreatorFlow AI","Project",GH+"/CreatorFlow"],["NetraShield","Project",GH+"/Browser-s-Agent"]],"AI"],
  ["Full-stack platforms","MERN apps with REST APIs, auth and admin dashboards. JWT with refresh rotation, OAuth through NextAuth, schemas checked with Zod.",
    [["ShopMall","Project",GH+"/Shopmall-ecommerce"],["CreatorFlow AI","Project",GH+"/CreatorFlow"]],"MERN"],
  ["Cloud and real-time data","Firebase Auth and Firestore sync for 500+ live users, Cloudflare R2 media streaming over the S3 SDK, and AWS done by the book.",
    [["MaxVelocityLabs","Internship",GH],["Cloudflare_R2","Repo",GH+"/Cloudflare_R2"],["AWS SAA-C03","Certified",GH]],"Cloud"],
  ["Tested and reviewed","Unit tests with Jest, Vitest and pytest, feature-branch Git workflows and code reviews that keep merges calm.",
    [["NetraShield","Project",GH+"/Browser-s-Agent"],["CreatorFlow AI","Project",GH+"/CreatorFlow"]],"Tests"],
  ["Data and ML","Prediction models and data visualisation in Python notebooks, from COVID case curves to employee attrition.",
    [["Covid-Cases-Predictor","Repo",GH+"/Covid-Cases-Predictor"],["Employee Attrition","Repo",GH+"/Predict-Employee-Attrition"],["CivicLens","Repo",GH+"/CivicLens"]],"Python"]] as const;
// About chapters: year shown top-right, card year, title, body, card class (each card's extra markup lives in components/About.tsx)
export const OP = [
  ["2022","2022 – 2023","Class XII, CBSE","DAV Public School, Kumarganj, Ayodhya. Science stream.",""],
  ["2024","2024 – 2028","B.Tech, CSE (AI & ML)","","op-grid op-pl-col"],
  ["2025","2025","Cloud Practitioner, hackathon finalist","AWS Certified Cloud Practitioner (CLF-C02), and an Innotech Hackathon finalist for rapid prototyping.",""],
  ["2026","Jan – Jul 2026","Frontend Developer Intern","MaxVelocityLabs, remote. React interfaces, Firebase sync and Cloudflare R2 media streaming for a live product.",""],
  ["2026","2026","Solutions Architect – Associate","AWS Certified Solutions Architect – Associate. S3, EC2, Lambda and CloudWatch, designed properly.",""],
  ["Now","2026 →","Building AI products","CreatorFlow AI for creators and NetraShield, an agent that browses for you.",""]] as const;
// [position in chapters, label]: timeline year marks
export const TICKS_AT = [[0, "2022"], [.5, "2023"], [1, "2024"], [2, "2025"], [3, "2026"], [5, "Now"]] as const;
export const WHAT: Record<string, string> = { "CreatorFlow AI": "LLM analytics and content strategy for creators", "NetraShield": "An agent that reads the screen and browses for you", "ShopMall": "MERN store, from catalogue to checkout",
  "MaxVelocityLabs": "React interfaces and Firebase sync for a live product", "Cloudflare_R2": "Media streaming over the S3 SDK", "AWS SAA-C03": "Solutions Architect – Associate",
  "Covid-Cases-Predictor": "Case curves predicted in Python", "Employee Attrition": "Attrition prediction in a notebook" };
// full view: every project once, split into the two columns around the dial
type Entry = readonly [name: string, label: string, href: string];
const ALL: Entry[] = [...new Map(MAKE.flatMap(m => m[2] as readonly Entry[]).map(e => [e[0], e])).values()];
export const isRepo = (e: Entry) => /Repo|Certified/.test(e[1]);
export const SIDES = [ALL.filter(e => !isRepo(e)), ALL.filter(isRepo)];      // right of the dial, left of the dial
export const ORDER = [...SIDES[0], ...SIDES[1].slice().reverse()];            // clockwise from the top right
export const EMAIL = "mailto:" + "gauravkkaushal.official" + "@gmail.com";
