import { aulasDaFaculdade, unidades } from '../src/faculdade.js';
import { entregasDaFaculdade } from '../src/faculdade-entregas.js';
import { auditarProgressaoDaFaculdade } from '../src/faculdade-ensino.js';

const problemas = auditarProgressaoDaFaculdade();
const ids = new Set(aulasDaFaculdade.map(({ id }) => id));

for (const entrega of entregasDaFaculdade) {
  for (const requisito of entrega.preRequisitos) {
    if (!ids.has(requisito)) problemas.push(`${entrega.id}: pré-requisito inexistente ${requisito}`);
  }
}

if (problemas.length) {
  console.error('A progressão da faculdade tem saltos pedagógicos:');
  for (const problema of problemas) console.error(`- ${problema}`);
  process.exit(1);
}

console.log(
  `Progressão aprovada: ${aulasDaFaculdade.length} aulas, ${unidades.length} unidades e ${entregasDaFaculdade.length} entregas com explicar → exemplificar → praticar → revisar → aplicar.`,
);
