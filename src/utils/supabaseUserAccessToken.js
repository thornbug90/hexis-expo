const supabase = require("@supabase/supabase-js");
const SUPABASE_URL_DEV = "https://zbbwlvunazmamwsjhwrv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY_DEV =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYndsdnVuYXptYW13c2pod3J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1Njg2MjQsImV4cCI6MjAyMTE0NDYyNH0.MVOcOzeDOJi7m1B9nasrr-R76MxdiRAtCkifdD-tHCQ";
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
    })
    .catch(error => {
      console.error("Failed to sign in:", error);
    });
}
