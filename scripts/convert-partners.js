#!/usr/bin/env node

/**
 * Script pentru conversia automată a imaginilor partenerilor în WebP
 * Rulează la fiecare build și:
 * 1. Detectează imagini noi în public/parteneri
 * 2. Le convertește în WebP
 * 3. Șterge fișierele originale (dacă nu sunt SVG)
 * 4. Actualizează lista de parteneri în CompanyCarousel.astro
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PARTNERS_DIR = path.join(__dirname, '../public/parteneri');
const CAROUSEL_FILE = path.join(__dirname, '../src/components/sections/CompanyCarousel.astro');

// Extensii de imagini acceptate (excluzând SVG și WebP deja existente)
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'];
const SVG_EXTENSION = '.svg';

async function checkSharpInstalled() {
  try {
    await import('sharp');
    return true;
  } catch {
    return false;
  }
}

async function convertToWebP(inputPath, outputPath) {
  try {
    const sharp = await import('sharp');
    await sharp.default(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Eroare la conversia ${inputPath}:`, error.message);
    return false;
  }
}

async function convertSVGToWebP(inputPath, outputPath) {
  try {
    const sharp = await import('sharp');
    // Pentru SVG, folosim o dimensiune mai mare pentru calitate
    await sharp.default(inputPath)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Eroare la conversia SVG ${inputPath}:`, error.message);
    return false;
  }
}

function extractPartnerName(filename) {
  // Extrage numele partenerului din numele fișierului
  // Exemplu: "logo-adt-banner-darkbg.svg" -> "Atelierul de Tehnologie"
  // Sau: "logo-coldea.webp" -> "Coldea"
  
  const basename = filename
    .replace(/^logo-/, '')
    .replace(/\.(webp|svg|png|jpg|jpeg|gif|bmp|tiff)$/i, '');
  
  // Mapări speciale pentru nume cunoscute
  const nameMap = {
    'adt-banner-darkbg': 'Atelierul de Tehnologie',
    'adt-banner-whitebg': 'Atelierul de Tehnologie',
    'adt': 'Atelierul de Tehnologie',
    'fcs': 'FCS',
    'mis': 'MIS',
    'coldea': 'Coldea',
    'odissea': 'Odissea',
    'pandoras-energy': 'Pandoras Energy',
    'pandoras': 'Pandoras',
    'perfect-doors': 'Perfect Doors',
    'primaria-sibiu': 'Primaria Sibiu',
    'stereographic': 'Stereographic',
  };
  
  // Verifică dacă există o mapare specială
  if (nameMap[basename.toLowerCase()]) {
    return nameMap[basename.toLowerCase()];
  }
  
  // Dacă nu, generează numele din basename
  const name = basename
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name;
}

function generatePartnerKey(filename) {
  // Generează o cheie URL-friendly pentru partener
  return filename
    .replace(/^logo-/, '')
    .replace(/\.(webp|svg|png|jpg|jpeg|gif|bmp|tiff)$/i, '')
    .toLowerCase();
}

async function getPartnersFromCarousel() {
  try {
    const content = await fs.readFile(CAROUSEL_FILE, 'utf-8');
    const partnersMatch = content.match(/const partners = \[([\s\S]*?)\];/);
    
    if (!partnersMatch) {
      return [];
    }
    
    const partnersArray = partnersMatch[1];
    const partnerRegex = /\{\s*name:\s*['"]([^'"]+)['"],\s*logo:\s*['"]([^'"]+)['"]\s*\}/g;
    const partners = [];
    let match;
    
    while ((match = partnerRegex.exec(partnersArray)) !== null) {
      partners.push({
        name: match[1],
        logo: match[2],
      });
    }
    
    return partners;
  } catch (error) {
    console.error('Eroare la citirea carousel-ului:', error.message);
    return [];
  }
}

async function updateCarousel(partners) {
  try {
    let content = await fs.readFile(CAROUSEL_FILE, 'utf-8');
    
    // Generează array-ul de parteneri
    const partnersArray = partners
      .map(p => `  { name: '${p.name}', logo: '${p.logo}' }`)
      .join(',\n');
    
    const newPartnersDeclaration = `const partners = [\n${partnersArray}\n];`;
    
    // Înlocuiește doar declarația partners; logos este construit în componentă din partners (cu type LogoItem și maxHeight)
    content = content.replace(
      /const partners = \[[\s\S]*?\];/,
      newPartnersDeclaration
    );
    
    await fs.writeFile(CAROUSEL_FILE, content, 'utf-8');
    console.log('✅ Carousel actualizat cu succes');
  } catch (error) {
    console.error('Eroare la actualizarea carousel-ului:', error.message);
  }
}

async function main() {
  console.log('🔄 Verificare imagini parteneri...\n');
  
  // Verifică dacă sharp este instalat
  const hasSharp = await checkSharpInstalled();
  if (!hasSharp) {
    console.error('❌ Sharp nu este instalat. Rulează: npm install --save-dev sharp');
    console.log('📝 Continuând fără conversie, doar actualizând lista...\n');
  }
  
  try {
    // Citește toate fișierele din directorul parteneri
    const files = await fs.readdir(PARTNERS_DIR);
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext) || ext === SVG_EXTENSION;
    });
    
    console.log(`📁 Găsite ${imageFiles.length} fișiere de imagini\n`);
    
    const partners = [];
    let convertedCount = 0;
    let deletedCount = 0;
    
    for (const file of imageFiles) {
      const filePath = path.join(PARTNERS_DIR, file);
      const ext = path.extname(file).toLowerCase();
      const basename = path.basename(file, ext);
      const webpPath = path.join(PARTNERS_DIR, `${basename}.webp`);
      
      // Dacă este deja WebP, adaugă-l direct
      if (ext === '.webp') {
        const partnerName = extractPartnerName(file);
        partners.push({
          name: partnerName,
          logo: `/parteneri/${file}`,
        });
        console.log(`✓ ${file} (deja WebP)`);
        continue;
      }
      
      // Dacă este SVG, îl păstrăm dar creăm și o versiune WebP
      if (ext === SVG_EXTENSION) {
        const partnerName = extractPartnerName(file);
        const webpBasename = basename.replace(/\.svg$/, '');
        const webpFile = `${webpBasename}.webp`;
        const webpFullPath = path.join(PARTNERS_DIR, webpFile);
        
        // Verifică dacă există deja WebP pentru acest SVG
        try {
          await fs.access(webpFullPath);
          // Există deja, folosim WebP
          partners.push({
            name: partnerName,
            logo: `/parteneri/${webpFile}`,
          });
          console.log(`✓ ${file} -> ${webpFile} (WebP existent)`);
        } catch {
          // Nu există WebP, creăm unul dacă avem sharp
          if (hasSharp) {
            const success = await convertSVGToWebP(filePath, webpFullPath);
            if (success) {
              partners.push({
                name: partnerName,
                logo: `/parteneri/${webpFile}`,
              });
              convertedCount++;
              console.log(`✓ ${file} -> ${webpFile} (convertit)`);
            } else {
              // Dacă conversia eșuează, folosim SVG-ul original
              partners.push({
                name: partnerName,
                logo: `/parteneri/${file}`,
              });
              console.log(`⚠ ${file} (folosit SVG original)`);
            }
          } else {
            // Fără sharp, folosim SVG-ul original
            partners.push({
              name: partnerName,
              logo: `/parteneri/${file}`,
            });
            console.log(`⚠ ${file} (folosit SVG original, instalează sharp pentru conversie)`);
          }
        }
        continue;
      }
      
      // Pentru alte formate de imagini, convertim în WebP
      if (hasSharp) {
        const success = await convertToWebP(filePath, webpPath);
        if (success) {
          const partnerName = extractPartnerName(file);
          partners.push({
            name: partnerName,
            logo: `/parteneri/${path.basename(webpPath)}`,
          });
          
          // Șterge fișierul original
          try {
            await fs.unlink(filePath);
            deletedCount++;
            console.log(`✓ ${file} -> ${path.basename(webpPath)} (convertit și șters)`);
          } catch (error) {
            console.log(`✓ ${file} -> ${path.basename(webpPath)} (convertit, eroare la ștergere: ${error.message})`);
          }
          convertedCount++;
        } else {
          console.log(`⚠ ${file} (eroare la conversie, păstrat original)`);
          const partnerName = extractPartnerName(file);
          partners.push({
            name: partnerName,
            logo: `/parteneri/${file}`,
          });
        }
      } else {
        // Fără sharp, folosim fișierul original
        const partnerName = extractPartnerName(file);
        partners.push({
          name: partnerName,
          logo: `/parteneri/${file}`,
        });
        console.log(`⚠ ${file} (folosit original, instalează sharp pentru conversie)`);
      }
    }
    
    // Sortează partenerii alfabetic după nume
    partners.sort((a, b) => a.name.localeCompare(b.name, 'ro'));
    
    // Actualizează carousel-ul
    await updateCarousel(partners);
    
    console.log(`\n✅ Procesare completă:`);
    console.log(`   - ${partners.length} parteneri găsiți`);
    if (hasSharp) {
      console.log(`   - ${convertedCount} imagini convertite`);
      console.log(`   - ${deletedCount} fișiere originale șterse`);
    }
    
  } catch (error) {
    console.error('❌ Eroare:', error.message);
    process.exit(1);
  }
}

main();

