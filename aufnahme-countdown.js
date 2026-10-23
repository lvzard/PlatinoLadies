// Platino Ladies: Aufnahme immer am 1. und 3. Dienstag, 20 Uhr (Europe/Berlin).
(() => {
  const target = document.getElementById('pl-aufnahme-countdown');
  if (!target) return;
  target.innerHTML = `<div class="pl-aufnahme-kicker">✧ DER NÄCHSTE CLUBBEITRITT ✧</div>
    <h2>☾ Countdown zur Clubaufnahme</h2>
    <p>Angenommene Bewerberinnen werden am 1. und 3. Dienstag jedes Monats aufgenommen.</p>
    <div class="pl-aufnahme-date" id="pl-aufnahme-date"></div>
    <div class="pl-aufnahme-clock" id="pl-aufnahme-clock" role="timer" aria-label="Verbleibende Zeit"></div>`;
  const dateEl = document.getElementById('pl-aufnahme-date');
  const clockEl = document.getElementById('pl-aufnahme-clock');
  const fmt = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const berlinParts = instant => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone:'Europe/Berlin', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'
  }).formatToParts(instant).filter(x => x.type !== 'literal').map(x => [x.type, Number(x.value)]));
  const offsetAt = instant => {
    const p=berlinParts(instant);
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-Math.floor(instant.getTime()/1000)*1000;
  };
  const berlinDateToUTC = (y,m,d,h) => {
    const wall=Date.UTC(y,m-1,d,h);
    let instant=new Date(wall);
    for(let i=0;i<3;i++) instant=new Date(wall-offsetAt(instant));
    return instant;
  };
  const nthTuesday = (y,m,n) => 1+(2-new Date(Date.UTC(y,m-1,1)).getUTCDay()+7)%7+7*(n-1);
  const next = now => {
    const p=berlinParts(now);
    for(let i=0;i<14;i++) {
      const y=p.year+Math.floor((p.month-1+i)/12),m=(p.month-1+i)%12+1;
      for(const n of [1,3]) {
        const day=nthTuesday(y,m,n);
        const date=berlinDateToUTC(y,m,day,20);
        if(date.getTime()>now.getTime()) return date;
      }
    }
  };
  let targetDate=next(new Date());
  const render=()=>{
    const now=new Date();
    if(now>=targetDate) targetDate=next(now);
    const seconds=Math.max(0,Math.floor((targetDate-now)/1000));
    const days=Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;
    dateEl.textContent=fmt.format(targetDate)+' · 20:00 Uhr';
    clockEl.textContent=`${days} Tage · ${String(hours).padStart(2,'0')} Std. · ${String(minutes).padStart(2,'0')} Min. · ${String(secs).padStart(2,'0')} Sek.`;
  };
  render();setInterval(render,1000);
})();
