# Changelog

All notable changes to the pdf-annotator-react package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.21] - 2024-07-16

### Added
- Auto-scaling feature to fit PDF to the width of the container
  - Added `fitToWidth` prop (defaults to `true`) which automatically scales the PDF to fit the container width
  - Recalculates scale on window resize to maintain proper fit
- Support for custom categories beyond the default ENEM categories
  - Added `customCategories` prop allowing users to define their own annotation categories
  - Each custom category has an ID, display name, and color
  - Fully integrated with all existing category-related features

### Fixed
- Bug where annotation details would lose category color information
  - Enhanced AnnotationDetails component to properly display category colors throughout the UI
  - Added color indicator for category selection
  - Applied category color to various UI elements (buttons, borders, etc.)

## [0.1.20] - 2024-07-16

### Added
- Portuguese language support across all components

### Changed
- Translated all UI text from English to Portuguese:
  - `AnnotationDetails.tsx`: 
    - Translated dialog title to "Anotação"
    - Translated "Categoria", "Problemas", confirmation messages
    - Translated all button text (Cancelar, Salvar, Apagar, Editar)
  - `ToolBar.tsx`: 
    - Translated all tooltips and button labels
    - Changed "Page X of Y" to "Página X de Y"
    - Translated dropdown options (e.g., "Select Category" → "Selecionar Categoria")
    - Translated zoom controls text
  - `CommentPopup.tsx`:
    - Changed "Add a comment..." to "Adicionar um comentário..."
    - Changed "Cancel" to "Cancelar"
    - Changed "Save" to "Salvar"
  - `TextInputPopup.tsx`:
    - Changed "Enter your text here..." to "Digite seu texto aqui..."
    - Changed "Cancel" to "Cancelar"
    - Changed "Add Text" to "Adicionar Texto"
  - `PinPopup.tsx`:
    - Changed "Add Issue Pin" to "Adicionar Marcador"
    - Changed all form labels and button text to Portuguese
  - `PdfAnnotator.tsx`:
    - Changed console log message "Updating annotation" to "Atualizando anotação"

### Fixed
- No bug fixes in this release
