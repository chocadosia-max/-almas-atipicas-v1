const fs = require('fs');
const path = require('path');

const pages = [
  'DiarioDaJornada', 'CadernetaDigital', 'RotinaDoDia', 'MomentoPausa',
  'RedeDeMaes', 'RadioDasMaes', 'Livraria',
  'SeusDireitos', 'RendaParaMae',
  'EspacoKids', 'JogoNivel1', 'JogoNivel2', 'JogoNivel3',
  'Login', 'EstouEmCrise', 'CartaoEmergencia', 'ParaAFamilia', 'DashboardAdmin'
];

const dir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

pages.forEach(page => {
  const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold font-serif mb-4">${page.replace(/([A-Z])/g, ' $1').trim()}</h1>
      <p className="text-[var(--texto-medio)]">Esta área está em construção.</p>
    </div>
  );
};

export default ${page};
`;
  fs.writeFileSync(path.join(dir, `${page}.tsx`), content);
});

console.log('Pages generated!');
