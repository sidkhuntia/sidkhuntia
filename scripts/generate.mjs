// Builds assets/waveform.svg, assets/mixer.svg and the "building" list in README.md.
// Needs Node 18+ and GH_TOKEN. No dependencies.
import { readFileSync, writeFileSync } from "node:fs";

const USER = "sidkhuntia";
const token = process.env.GH_TOKEN;
if (!token) throw new Error("GH_TOKEN is required");

const query = `
query($login:String!){
  user(login:$login){
    contributionsCollection{
      contributionCalendar{ weeks{ contributionDays{ contributionCount } } }
    }
    repositories(first:60, privacy:PUBLIC, isFork:false, ownerAffiliations:OWNER, orderBy:{field:PUSHED_AT,direction:DESC}){
      nodes{
        name url description pushedAt homepageUrl
        languages(first:5, orderBy:{field:SIZE,direction:DESC}){ edges{ size node{ name } } }
      }
    }
  }
}`;

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query, variables: { login: USER } }),
});
const json = await res.json();
if (json.errors) throw new Error(JSON.stringify(json.errors));
const { contributionsCollection, repositories } = json.data.user;

const css = `
  .t{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#57606a}
  .bar{fill:#378ADD}.on{fill:#24292f}.off{fill:#d0d7de}
  @media (prefers-color-scheme:dark){.t{fill:#9198a1}.bar{fill:#58a6ff}.on{fill:#e6edf3}.off{fill:#30363d}}`;

// waveform: one mirrored bar per day for the last 52 weeks, log-scaled so quiet days still show
const days = contributionsCollection.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
  .slice(-364);
const max = Math.max(...days, 1);
const H = 60, PITCH = 640 / days.length;
const bars = days
  .map((n, i) => {
    const r = Math.max(0.06, Math.log1p(n) / Math.log1p(max));
    const h = (r * (H - 6)).toFixed(1);
    const op = (0.4 + r * 0.6).toFixed(2);
    return `<rect class="bar" x="${(i * PITCH).toFixed(2)}" y="${(H / 2 - h / 2).toFixed(1)}" width="${(PITCH * 0.62).toFixed(2)}" height="${h}" rx="0.7" opacity="${op}"/>`;
  })
  .join("");
writeFileSync(
  "assets/waveform.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${H}" width="640" height="${H}" role="img" aria-label="Daily commit activity over the last year drawn as a waveform"><style>${css}</style>${bars}</svg>\n`
);

// mixer: top languages by bytes across owned, non-fork repos
const sizes = {};
for (const repo of repositories.nodes)
  for (const e of repo.languages.edges) sizes[e.node.name] = (sizes[e.node.name] || 0) + e.size;
const total = Object.values(sizes).reduce((a, b) => a + b, 0) || 1;
const sorted = Object.entries(sizes).sort((a, b) => b[1] - a[1]);
const top = sorted.slice(0, 5).map(([n, s]) => [n, (s / total) * 100]);
const other = 100 - top.reduce((a, [, p]) => a + p, 0);
if (other >= 1) top.push(["Other", other]);
const SEG = 24, RH = 26;
const rows = top
  .map(([name, pct], i) => {
    const y = 12 + i * RH;
    const lit = Math.max(1, Math.round((pct / top[0][1]) * SEG));
    const segs = Array.from({ length: SEG }, (_, q) =>
      `<rect class="${q < lit ? "on" : "off"}" x="${110 + q * 19}" y="${y}" width="16" height="8" rx="2"/>`).join("");
    return `<text class="t" x="0" y="${y + 8}">${name}</text>${segs}<text class="t" x="572" y="${y + 8}">${Math.round(pct)}%</text>`;
  })
  .join("");
const MH = 24 + top.length * RH - 10;
writeFileSync(
  "assets/mixer.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 610 ${MH}" width="610" height="${MH}" role="img" aria-label="Top languages"><style>${css}</style>${rows}</svg>\n`
);

// building: most recently pushed owned repos (skips the profile repo)
const recent = repositories.nodes.filter((r) => r.name !== USER).slice(0, 3);
const list = recent
  .map((r, i) => `0${i + 1} [${r.name}](${r.url})${r.description ? ` · ${r.description}` : ""}`)
  .join("<br>\n");
const readme = readFileSync("README.md", "utf8");
const next = readme.replace(
  /(<!--BUILDING:START-->)[\s\S]*?(<!--BUILDING:END-->)/,
  `$1\n${list}\n$2`
);
writeFileSync("README.md", next);
console.log(`days=${days.length} langs=${top.map((t) => t[0]).join(",")} building=${recent.map((r) => r.name).join(",")}`);
