import fs from 'node:fs';
import WebSocket from 'ws';
const base = process.env.E2E_BASE_URL ?? 'https://raksha-app.web.app';
const config = await (await fetch(`${base}/api/config`)).json();
const wsURL = new URL('/ws', config.wsOrigin || base); wsURL.protocol = wsURL.protocol === 'https:' ? 'wss:' : 'ws:';
const health = await (await fetch(`${base}/api/health`)).json();
if (process.env.REQUIRE_MOSS === '1' && health.retrieval.mode !== 'moss') throw new Error('Moss is unavailable; refusing to report fallback results as Moss results');
const scenarios = await (await fetch(`${base}/api/scenarios`)).json();
const results = [];
for (const scenario of scenarios) {
  const script = await (await fetch(`${base}/api/scenarios?id=${scenario.id}`)).json();
  const socket = new WebSocket(wsURL, { origin: base });
  const inbox = []; let signal;
  socket.on('message', raw => { inbox.push(JSON.parse(raw.toString())); signal?.(); });
  const receive = async type => {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const index = inbox.findIndex(m => m.type === type);
      if (index >= 0) return inbox.splice(index, 1)[0];
      await new Promise(resolve => { const timer = setTimeout(resolve, 200); signal = () => { clearTimeout(timer); resolve(); }; });
    }
    throw new Error(`${scenario.id}: timed out waiting for ${type}`);
  };
  await new Promise((resolve, reject) => { socket.on('open', resolve); socket.on('error', reject); });
  await receive('hello');
  socket.send(JSON.stringify({ type:'call.start', mode:'simulation', scenarioId:scenario.id, familyCode:'AUDIT234' }));
  await receive('call.started');
  const timings=[];let danger=false;
  for (const [i,turn] of script.turns.entries()) {
    socket.send(JSON.stringify({type:'utterance',text:turn.text,speaker:turn.speaker,final:true,t:i*6000}));
    const msg=await receive('analysis');timings.push(msg.analysis.latency.totalMs);
    danger ||= msg.analysis.risk.level === 'danger';
  }
  socket.send(JSON.stringify({type:'call.end'}));const ended=await receive('call.ended');socket.close();
  results.push({id:scenario.id,expected:scenario.expected,danger,finalScore:ended.risk.score,turns:script.turns.length,pass:danger===(scenario.expected==='scam'),latencies:timings});
  console.log(`${scenario.id}: ${results.at(-1).pass?'PASS':'FAIL'} (${ended.risk.score}/100)`);
}
const timings=results.flatMap(r=>r.latencies).sort((a,b)=>a-b);
const report={runtime:health.retrieval,generatedAt:new Date().toISOString(),url:base,scenarios:results.length,passed:results.filter(r=>r.pass).length,utterances:timings.length,p50:timings[Math.floor(timings.length*.5)],p95:timings[Math.floor(timings.length*.95)],results};
fs.mkdirSync('outputs',{recursive:true});fs.writeFileSync('outputs/hosted-evaluation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,results:undefined}));if(report.passed!==report.scenarios)process.exitCode=1;
