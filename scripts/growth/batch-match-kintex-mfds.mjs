#!/usr/bin/env node
/**
 * Review-only MFDS candidate matcher. Usage:
 *   node scripts/growth/batch-match-kintex-mfds.mjs <exhibitors.csv> <mfds-export.csv> <output.csv>
 * Requires a lawfully obtained and dated CSV from the same Korean cosmetics registration scope.
 * Does not access any production database and does not send data anywhere.
 */
import fs from 'node:fs';

function parseCSV(text) {
  const rows = [];
  let row = [], val = '', quoted = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i=0; i<input.length; i++) {
    const c=input[i];
    if(c==='"') { if(quoted && input[i+1]==='"') {val+='"';i++} else quoted=!quoted; }
    else if(c===',' && !quoted) {row.push(val); val='';}
    else if((c==='\n'||c==='\r') && !quoted) {
      if(c==='\r' && input[i+1]==='\n')i++;
      row.push(val); if(row.some(x=>x.trim()))rows.push(row);
      row=[];val='';
    } else val+=c;
  }
  if(quoted)throw new Error('Malformed CSV: unclosed quote');
  if(val || row.length) {row.push(val);rows.push(row);}
  if(!rows.length)throw new Error('CSV empty');
  const [header,...body] = rows;
  return body.map((cells,j)=>{
    if(cells.length!==header.length)throw new Error('Wrong column count at line '+(j+2));
    return Object.fromEntries(header.map((k,i)=>[k.trim(),cells[i].trim()]));
  });
}
const csv=(arr,cols)=>[cols.join(','),...arr.map(row=>cols.map(col=>'"'+String(row[col]??'').replaceAll('"','""')+'"').join(','))].join('\n')+'\n';
const normId=value=>String(value??'').replace(/\D/g,'');
const normName=value=>String(value??'')
  .normalize('NFKC').toLowerCase().replace(/\(주\)|주식회사|㈜/g,'')
  .replace(/\b(co|ltd|llc|inc|corporation|company|limited)\b/g,'')
  .replace(/[\s\p{P}\p{S}]/gu,'');
const pick=(o,fields)=>fields.map(x=>o[x]).find(x=>String(x??'').trim())??'';
const [expoFile,mfdsFile,outFile] = process.argv.slice(2);
if(!expoFile || !mfdsFile || !outFile) {
  console.error('Usage: node batch-match-kintex-mfds.mjs <exhibitors.csv> <mfds-export.csv> <output.csv>');
  process.exit(2);
}
const exhibitors=parseCSV(fs.readFileSync(expoFile,'utf8'));
const registry=parseCSV(fs.readFileSync(mfdsFile,'utf8'));
const byId=new Map(), byName=new Map();
for(const r of registry) {
  const id=normId(pick(r,['bizrno','BIZRNO','사업자등록번호']));
  const name=normName(pick(r,['name','ENTP_NAME','업체명','업소명']));
  if(id.length===10)byId.set(id,[...(byId.get(id)||[]),r]);
  if(name.length>=2)byName.set(name,[...(byName.get(name)||[]),r]);
}
const result=exhibitors.map(e=>{
  const id=normId(e.korean_legal_entity_id);
  const legal=e.korean_legal_name||'';
  const lookupName=legal ? normName(legal) : '';
  const idMatches=id.length===10 ? (byId.get(id)||[]) : [];
  const nameMatches=lookupName ? (byName.get(lookupName)||[]) : [];
  const candidates=idMatches.length ? idMatches : nameMatches;
  let match_status;
  if(idMatches.length===1)match_status='EXACT_BUSINESS_ID_CANDIDATE';
  else if(idMatches.length>1)match_status='AMBIGUOUS_BUSINESS_ID';
  else if(nameMatches.length===1)match_status='EXACT_LEGAL_NAME_CANDIDATE';
  else if(nameMatches.length>1)match_status='AMBIGUOUS_LEGAL_NAME';
  else if(id.length!==10 && !lookupName)match_status='NEEDS_KOREAN_LEGAL_IDENTITY';
  else match_status='NO_REGISTRY_RECORD_FOUND';
  // Important: even exact key equality requires business-role, address and freshness checks.
  return {...e,match_status,registry_candidate_count:candidates.length,
    candidate_registry_names:candidates.map(r=>pick(r,['name','ENTP_NAME','업체명','업소명'])).join(' | '),
    candidate_industry_types:candidates.map(r=>pick(r,['induty','INDUTY','업종'])).join(' | '),
    independently_verified:'NO'};
});
const cols=[...new Set([...Object.keys(result[0]||{}),'match_status','registry_candidate_count','candidate_registry_names','candidate_industry_types','independently_verified'])];
fs.writeFileSync(outFile,csv(result,cols),'utf8');
const counts=Object.fromEntries([...new Set(result.map(r=>r.match_status))].map(k=>[k,result.filter(r=>r.match_status===k).length]));
console.log(JSON.stringify({exhibitors:exhibitors.length,registryRows:registry.length,counts,output:outFile},null,2));
