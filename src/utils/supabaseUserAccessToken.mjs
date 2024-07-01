// eslint-disable-next-line @typescript-eslint/no-var-requires
const supabase = require("@supabase/supabase-js");
const SUPABASE_URL_DEV = "https://fyxcbbbqmhcydwoxonoo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY_DEV =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5eGNiYmJxbWhjeWR3b3hvbm9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjIyNjM4NCwiZXhwIjoyMDI3ODAyMzg0fQ._9rS25EO7-aSFe56c1TmdD2p6Mpuvzd6VqqRmpfXyS8";
const supabaseClient = supabase.createClient(SUPABASE_URL_DEV, SUPABASE_SERVICE_ROLE_KEY_DEV);
let userName = process.argv?.[2];
let password = process.argv?.[3];

if (userName && password) {
  supabaseClient.auth
    .signInWithPassword({
      email: userName,
      password: password,
    })
    .then(userData => {
      console.log(`Bearer ${userData.data.session?.access_token}`);
    });
}
