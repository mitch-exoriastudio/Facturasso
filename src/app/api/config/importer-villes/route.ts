import { NextResponse } from 'next/server';
import { parse as parseCsv } from 'csv-parse/sync';
import { protege } from '@/lib/handler';
import { exigerSuperviseur } from '@/lib/auth';
import { importerVilles } from '@/lib/modeles/configModele';

// POST /api/config/importer-villes  (body: { csv: "contenu brut du fichier" })
export const POST = protege('droit_config', async (req, { utilisateur }) => {
  exigerSuperviseur(utilisateur);
  const { csv } = await req.json();
  if (!csv) return NextResponse.json({ message: 'Fichier CSV manquant.' }, { status: 400 });
  try {
    // On essaie d'abord le séparateur point-virgule (format français),
    // puis la virgule si rien n'est trouvé.
    let lignes: string[][] = parseCsv(csv, { delimiter: ';', skip_empty_lines: true, from_line: 1 });
    if ((lignes[0]?.length ?? 2) < 2) {
      lignes = parseCsv(csv, { delimiter: ',', skip_empty_lines: true, from_line: 1 });
    }
    // On attend deux colonnes : code_postal, nom_ville (dans cet ordre).
    const villes = lignes
      .map((l) => ({ code_postal: String(l[0] ?? '').trim(), nom_ville: String(l[1] ?? '').trim() }))
      .filter((v) => v.code_postal && v.nom_ville);
    await importerVilles(villes);
    return NextResponse.json({ message: `${villes.length} villes importées.` });
  } catch (err) {
    return NextResponse.json({ message: 'Erreur lors du parsing CSV : ' + (err as Error).message }, { status: 400 });
  }
});
