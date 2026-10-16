#!/usr/bin/env node
/**
 * KINTEX 2026 / GloSource AI MFDS cross-check — READ ONLY.
 *
 * Usage:
 *  node --env-file=.env.local scripts/growth/kintex-mfds-readonly.mjs \
 *   docs/audit/2026-10-16-kintex-exhibitor-master-candidates.csv \
 *   .local/kintex-mfds-results.csv
 *
 * Safety:
 * - SELECT only; no TRUNCATE/UPDATE/INSERT, no API calls or emails.
 * - Uses an existing, dated kr_cosmetics_firms snapshot. A match is a CANDIDATE,
 *   NOT automatic regulatory verification.
 * - Never prints DATABASE_URL; never commits outputs automatically.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

const [inputCsv, outputCsv] = process.argv.slice(2);
if (!inputCsv || !outputCsv) {
  console.error('Usage: kintex-mfds-readonly.mjs <expo-candidates.csv> <out.csv>');
  process.exit(2);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing. Use local env; never paste keys in chat.');
  process.exit(2);
}
function parseCsv(data) {
  data = data.replace(/^\uFEFF/, '');
  const out = []; let row=[], val='', quote=false;
  for(let i=0;i<data.length;i++) {
    const c=data[i];
    if(c==='"') { if(quote && data[i+1]==='"'){val+='"';i++}else{quote=!quote} }
    else if(c===','&&!quote){row.push(val);val=''}
    else if((c==='\n'||c==='\r')&&!quote){
      if(c==='\r'&&data[i+1]==='\n')i++;
      row.push(val);if(row.some(v=>v.trim()))out.push(row);
      row=[];val='';
    }else{val+=c}
  }
  if(quote)throw Error('CSV has an unclosed quoted field');
  if(row.length||val){row.push(val);out.push(row)}
  const [header,...body]=out;
  if(!header)throw Error('CSV is empty');
  return body.map((values,index)=>{
    if(values.length!==header.length)throw Error('Malformed CSV row '+(index+2));
    return Object.fromEntries(header.map((k,j)=>[k.trim(),values[j].trim()]));
  });
}
function csvCell(value){return '"'+String(value??'').replaceAll('"','""')+'"'}
function toCsv(rows,columns) {
  return columns.map(csvCell).join(',')+'\n'+rows.map(row=>columns.map(k=>csvCell(row[k])).join(',')).join('\n')+'\n';
}
function businessId(value){return String(value??'').replace(/\D/g,'')}
function norm(value) {
  return String(value??'').normalize('NFKC').toLowerCase()
    .replace(/(주식회사|\(주\)|㈜|co\.,?\s*ltd\.?|limited|inc\.?|llc|corporation)/gi,'')
    .replace(/[\s\p{P}\p{S}]/gu,'');
}
const candidates=parseCsv(readFileSync(inputCsv,'utf8'));
const sql=neon(process.env.DATABASE_URL);
// A single SELECT; use a DB role with SELECT-only grants whenever possible.
const registry=await sql`
 SELECT entp_seq, name, induty, is_manufacturer, factory_addr, bizrno, fetched_at
 FROM kr_cosmetics_firms
`;
const byId=new Map(),byName=new Map();
for(const r of registry){
  const id=businessId(r.bizrno);
  if(id.length===10)byId.set(id,[...(byId.get(id)??[]),r]);
  const key=norm(r.name);
  if(key)byName.set(key,[...(byName.get(key)??[]),r]);
}
const answers=candidates.map(c=>{
  const id=businessId(c.korean_legal_entity_id);
  const legalName=c.korean_legal_name||c.official_legal_name||'';
  const scope=String(c.business_activity_screen||'').toLowerCase();
  const foreignNonCosmetic=/foreign|chinese|japanese|canadian|italian|overseas|packaging|logistics|printing|exhibition services|beauty.*device|diagnostic devices|pavilion/.test(scope);
  const idHits=id.length===10?(byId.get(id)||[]):[];
  const nameHits=legalName.trim()?(byName.get(norm(legalName))||[]):[];
  const matches=idHits.length ? idHits : nameHits;
  const matchMethod=idHits.length?'business_id':(nameHits.length?'korean_legal_name':'none');
  let status;
  if(foreignNonCosmetic)status='OUT_OF_SCOPE_REVIEW'; // still preserve any apparent match for human review
  else if(matches.length>1)status='MULTIPLE_CANDIDATE_ROWS';
  else if(matches.length===1)status='MFDS_REGISTRY_CANDIDATE_REVIEW';
  else if(!legalName && id.length!==10)status='MISSING_KOREAN_LEGAL_IDENTITY';
  else status='NOT_FOUND_IN_THIS_SNAPSHOT_REVIEW';
  return {
    ...c,match_status:status,match_method:matchMethod,
    registry_candidate_count:matches.length,
    matched_registry_entp_seq:matches.map(x=>x.entp_seq).join(';'),
    matched_registry_name:matches.map(x=>x.name).join(';'),
    matched_registry_induty:matches.map(x=>x.induty).join(';'),
    matched_registry_addr:matches.map(x=>x.factory_addr||'').join(';'),
    registry_row_fetched_at:matches.map(x=>String(x.fetched_at||'')).join(';'),
    verified_by_mfds_authority:'NO',
    review_note:'Match is a join candidate, not proof of active registration/certification'
  };
});
const fields=[...new Set(answers.flatMap(Object.keys))];
mkdirSync(dirname(resolve(outputCsv)),{recursive:true});
writeFileSync(outputCsv,toCsv(answers,fields),'utf8');
const counters={};
for(const a of answers)counters[a.match_status]=(counters[a.match_status]||0)+1;
const dates=registry.map(x=>x.fetched_at).filter(Boolean).map(String).sort();
console.log(JSON.stringify({
  expoCandidates:candidates.length,
  existingRegistryRecords:registry.length,
  snapshotOldest:dates[0]||'UNKNOWN',
  snapshotNewest:dates.at(-1)||'UNKNOWN',
  ...counters,
  output:resolve(outputCsv),
  disclaimer:'No definitive regulatory match; identity/registration role/status must be reviewed.'
},null,2));
