const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wbuvsnamcrowwndfzuuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndidXZzbmFtY3Jvd3duZGZ6dXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDkyMDQsImV4cCI6MjA5MDAyNTIwNH0.HGVzFQun2MQe5mkreLFObr8d6ggTV8WeFJ2PYi3aQg0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'motokinegocios@gmail.com';
  const password = 'shiki666';

  console.log("Tentando cadastrar usuário:", email);
  
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  let user = data?.user;

  // Se já existir ou o signUp falhar por isso, tenta dar apenas login para pegar o ID
  if (error && error.message.includes('already registered')) {
    console.log("Usuário já existe, tentando logar...");
    const loginRes = await supabase.auth.signInWithPassword({ email, password });
    if (loginRes.error) {
      console.error("Erro ao logar:", loginRes.error.message);
      return;
    }
    user = loginRes.data.user;
  } else if (error) {
    console.error("Erro no cadastro:", error);
    return;
  }

  if (!user || (!user.id)) {
    console.error("Não foi possível recuperar o ID da conta.");
    return;
  }

  console.log("Usuário autenticado. Seu ID:", user.id);
  console.log("Tentando registrar como Admin na tabela 'profiles'...");

  // Upsert on profiles
  const profileRes = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      is_admin: true, 
      full_name: 'Motoki Admin',
      onboarding_complete: true 
    });

  if (profileRes.error) {
    console.error("ALERTA: O Cadastro do Auth funcionou, mas a atualização do Perfil para Admin falhou.", profileRes.error);
    console.log("Motivo comum: Políticas do Supabase (RLS) bloqueiam usuários comuns de definirem 'is_admin = true' sozinhos.");
    console.log("Para resolver, faça login no painel do Supabase, vá no SQL Editor e rode: UPDATE profiles SET is_admin = true WHERE id = '" + user.id + "';");
  } else {
    console.log("✅ SUCESSO ABSOLUTO! O usuário", email, "agora é Administrador do sistema.");
  }
}

run();
