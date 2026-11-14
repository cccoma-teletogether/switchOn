const fs=require('fs'),vm=require('vm');
const d=JSON.parse(fs.readFileSync('switchon-2026-11-15.json','utf8'));
const s=fs.readFileSync('app.js','utf8'),ctx=vm.createContext({state:d});
for(const n of ['fatMass','fatPercent','biaRawMass'])vm.runInContext(s.split(/\r?\n/).find(l=>l.startsWith('function '+n+'(')),ctx);
vm.runInContext(s.split(/\r?\n/).find(l=>l.startsWith('function metricTrendEstimate(')),ctx);
vm.runInContext(s.slice(s.indexOf('function processBiaRecords('),s.indexOf('function refreshBiaAnalysis(')),ctx);
ctx.rows=d.records;vm.runInContext('result=processBiaRecords(rows)',ctx);
for(const r of ctx.result.sort((a,b)=>a.date.localeCompare(b.date))){const f=+(r.weight*r.fatPercent/100).toFixed(1);console.log(JSON.stringify({date:r.date,weight:r.weight,muscle:r.muscle,fatPercent:r.fatPercent,fat:r.fat,bone:r.bone,water:r.water,protein:r.protein,muscleAdj:r.muscleAdj,fatAdj:r.fatMassAdj,rawError:+(r.weight-r.muscle-f-r.bone).toFixed(2),adjustedError:+(r.weight-r.muscleAdj-r.fatMassAdj-r.bone).toFixed(2),savedMuscle:d.records.find(x=>x.date===r.date).muscleAdj,savedFat:d.records.find(x=>x.date===r.date).fatMassAdj,approved:[r.muscleAdjustmentApproved,r.fatAdjustmentApproved]}))}
