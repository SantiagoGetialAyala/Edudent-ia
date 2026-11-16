# Material académico en PDF

- `Guia_de_estudio_Edudent-IA.pdf`: guía para comprender el propósito, arquitectura, módulos, flujos, persistencia, límites, ejecución y verificación del proyecto.
- `Exposicion_Edudent-IA_4_integrantes.pdf`: guion sugerido de 8-10 minutos con libreto equilibrado para cuatro integrantes, demostración, relación con la rúbrica y preguntas probables.

## Regeneración

Desde la raíz del repositorio, con Python y `reportlab` instalados:

```powershell
python -m pip install reportlab
python scripts/generate_academic_pdfs.py
```

El generador fuente está en `scripts/generate_academic_pdfs.py`.
