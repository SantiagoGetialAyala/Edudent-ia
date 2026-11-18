BEGIN;
CREATE TABLE IF NOT EXISTS dental_knowledge (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  fdi text CHECK (fdi IS NULL OR fdi ~ '^[1-4][1-8]$'),
  arch text NOT NULL DEFAULT 'both' CHECK (arch IN ('upper','lower','both')),
  title text NOT NULL,
  content text NOT NULL,
  source_title text NOT NULL,
  source_url text NOT NULL CHECK (source_url ~ '^https://'),
  reviewed_by text,
  reviewed_at timestamptz,
  search_document tsvector GENERATED ALWAYS AS
    (to_tsvector('spanish', title || ' ' || content)) STORED,
  CHECK ((reviewed_by IS NULL) = (reviewed_at IS NULL))
);
CREATE INDEX IF NOT EXISTS dental_knowledge_search ON dental_knowledge USING gin(search_document);
CREATE INDEX IF NOT EXISTS dental_knowledge_fdi ON dental_knowledge(fdi);
-- Draft reference summaries, NOT validated content. A dental educator must review
-- each entry and record their identity/date before the tutor can retrieve it.
INSERT INTO dental_knowledge (slug, fdi, arch, title, content, source_title, source_url) VALUES
('14-ubicacion', '14', 'upper', 'Pieza 14: identificación y función',
 'El primer premolar superior derecho es la cuarta pieza permanente desde la línea media del cuadrante superior derecho. Está entre el canino 13 y el segundo premolar 15. Participa en la trituración de alimentos.',
 'Al-Mustaqbal University — Dental Anatomy, Lec 2, Dr. Dhifaf Kamil',
 'https://www.uomus.edu.iq/img/lectures21/MUCLecture_2025_5135316.pdf'),
('14-caras', '14', 'upper', 'Cúspides y caras vestibular y palatina',
 'Presenta habitualmente dos cúspides, vestibular y palatina. La palatina suele ser más corta. Vestibular mira hacia la mejilla; palatina hacia el paladar. Mesial mira hacia la línea media y distal se aleja de ella. Oclusal es la superficie masticatoria.',
 'Al-Mustaqbal University — Dental Anatomy, Lec 2, Dr. Dhifaf Kamil',
 'https://www.uomus.edu.iq/img/lectures21/MUCLecture_2025_5135316.pdf'),
('14-oclusal', '14', 'upper', 'Superficie oclusal: surcos y fosas',
 'La superficie oclusal presenta un surco de desarrollo central, fosas triangulares mesial y distal y rebordes marginales mesial y distal. El surco marginal mesial es un rasgo característico para orientar el primer premolar superior.',
 'Al-Mustaqbal University — Dental Anatomy, Lec 2, Dr. Dhifaf Kamil',
 'https://www.uomus.edu.iq/img/lectures21/MUCLecture_2025_5135316.pdf'),
('14-mesial', '14', 'upper', 'Identificación de la cara mesial',
 'El surco marginal mesial y la depresión de desarrollo mesial son rasgos distintivos del primer premolar superior. En el visor, examina la cara mesial y después la oclusal para buscar estas referencias; su presencia concreta debe comprobarse en el modelo.',
 'Shivappa — An Illustrated Atlas of Tooth Carving and Wax-Up Techniques, Permanent Maxillary First Premolar',
 'https://onlinelibrary.wiley.com/doi/10.1002/9781119573609.ch11')
ON CONFLICT (slug) DO NOTHING;
COMMIT;
