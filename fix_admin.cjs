const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbuvsnamcrowwndfzuuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidXZzbmFtY3Jvd3duZGZ6dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDkyMDQsImV4cCI6MjA5MDAyNTIwNH0.HGVzFQun2MQe5mkreLFObr8d6ggTV8WeFJ2PYi3aQg0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'motokinegocios@gmail.com';
  const password = 'shiki666';
  let userId = null;

  console.log("1. Tentando login direto para pegar o identificador correto...");
  const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
  
  if (loginData?.user) {
    userId = loginData.user.id;
    console.log("Logado com sucesso. ID REAL:", userId);
  } else {
    console.log("Falha no login. Tentando registro limpo...");
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email, password });
    if (signUpErr) {
        console.log("Erro no registro:", signUpErr.message);
        return;
    }
    if (signUpData?.user) {
        userId = signUpData.user.id;
        console.log("Nova conta criada. ID REAL:", userId);
    } else {
        console.log("Erro: O Supabase não retornou dados de usuário (Email confirmation pode estar ativo).");
        return;
    }
  }

  console.log("2. Vinculando o perfil Administrador...");
  const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      is_admin: true,
      full_name: 'Administrador Master',
      onboarding_complete: true
  });

  if (profileError) {
      console.log("ERRO FINAL:", profileError.message || profileError);
  } else {
      console.log("SUCESSO ABSOLUTO! O Admin foi configurado no banco.");
  }
}

run();
