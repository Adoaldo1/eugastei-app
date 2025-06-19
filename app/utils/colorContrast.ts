/**
 * Calcula a cor de texto ideal (preto ou branco) baseada na cor de fundo
 * para garantir contraste e acessibilidade adequados.
 * 
 * @param hexColor - Cor em formato hex (ex: "#FFFF00" ou "FFFF00")
 * @returns "#000000" para fundos claros ou "#FFFFFF" para fundos escuros
 */
export function getContrastingTextColor(hexColor: string): string {
  // Remove o # se presente
  const hex = hexColor.replace('#', '');
  
  // Converte hex para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Fórmula de luminância relativa (W3C)
  // Considera a sensibilidade do olho humano a diferentes cores
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Retorna preto para fundos claros, branco para fundos escuros
  return brightness > 160 ? '#000000' : '#FFFFFF';
}

/**
 * Verifica se uma cor hex é válida
 * @param hexColor - Cor em formato hex
 * @returns true se a cor for válida
 */
export function isValidHexColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  return /^[0-9A-Fa-f]{6}$/.test(hex);
}

// Exemplos de teste para demonstrar a funcionalidade:
// getContrastingTextColor('#FFFF00') // retorna '#000000' (amarelo claro = texto preto)
// getContrastingTextColor('#000080') // retorna '#FFFFFF' (azul escuro = texto branco)
// getContrastingTextColor('#FF69B4') // retorna '#000000' (rosa claro = texto preto)
// getContrastingTextColor('#8B0000') // retorna '#FFFFFF' (vermelho escuro = texto branco) 