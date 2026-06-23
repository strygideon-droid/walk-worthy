export default {
  async fetch() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({error:"Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in Vercel."},{status:500,headers:{"Cache-Control":"no-store"}});
    }
    return Response.json({supabaseUrl,supabaseKey},{headers:{"Cache-Control":"no-store"}});
  }
};