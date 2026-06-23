const NIV_ID = "78a9f6124f344018-01";
const VALID = /^(MAT|MRK|LUK|JHN|ACT|ROM|1CO|2CO|GAL|EPH|PHP|COL|1TH|2TH|1TI|2TI|TIT|PHM|HEB|JAS|1PE|2PE|1JN|2JN|3JN|JUD|REV)\.\d+\.\d+(?:-(MAT|MRK|LUK|JHN|ACT|ROM|1CO|2CO|GAL|EPH|PHP|COL|1TH|2TH|1TI|2TI|TIT|PHM|HEB|JAS|1PE|2PE|1JN|2JN|3JN|JUD|REV)\.\d+\.\d+)?$/;
export default {
  async fetch(request) {
    const key = process.env.API_BIBLE_KEY;
    const bibleId = process.env.API_BIBLE_ID || NIV_ID;
    const suppliedId = (new URL(request.url).searchParams.get("passageId") || "").toUpperCase().trim();
    const passageId = suppliedId.includes("-") ? suppliedId : `${suppliedId}-${suppliedId}`;
    if (!key) return Response.json({error:"API_BIBLE_KEY has not been added to Vercel."},{status:500});
    if (!VALID.test(suppliedId)) return Response.json({error:"Invalid New Testament passage reference."},{status:400});
    const url = new URL(`https://rest.api.bible/v1/bibles/${encodeURIComponent(bibleId)}/passages/${encodeURIComponent(passageId)}`);
    [["content-type","text"],["include-notes","false"],["include-titles","false"],["include-chapter-numbers","false"],["include-verse-numbers","true"],["include-verse-spans","false"],["fums-version","3"]].forEach(([k,v])=>url.searchParams.set(k,v));
    try {
      const r = await fetch(url,{headers:{"api-key":key,Accept:"application/json"},cache:"no-store"});
      const p = await r.json().catch(()=>({}));
      if (!r.ok) return Response.json({error:p.error||p.message||`API.Bible returned ${r.status}.`},{status:r.status});
      const d=p.data||{};
      return Response.json({id:d.id||passageId,bibleId:d.bibleId||bibleId,reference:d.reference||passageId,content:d.content||"",verseCount:d.verseCount||0,copyright:d.copyright||"",fumsToken:p.meta?.fumsToken||null},{headers:{"Cache-Control":"private, no-store, max-age=0"}});
    } catch(e) {
      return Response.json({error:`Could not reach API.Bible: ${e.message}`},{status:502});
    }
  }
};