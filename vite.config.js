import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const headers = { 'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp' };
// React e os ícones mudam pouco: em pacote próprio, eles ficam no cache do navegador
// entre versões e o pacote da aplicação volta a caber abaixo do limite de aviso.
const manualChunks = id => {
  if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
  if (id.includes('node_modules/lucide-react')) return 'icones';
};
// Em produção no GitHub Pages o site vive em /pycampus/. O worker do Python é carregado a
// partir de BASE_URL por causa disso: com caminho absoluto ele sumiria fora da raiz.
export default defineConfig({ base: process.env.PYCAMPUS_BASE || '/', plugins: [react()], server: { headers }, preview: { headers }, build: { rollupOptions: { output: { manualChunks } } } });
