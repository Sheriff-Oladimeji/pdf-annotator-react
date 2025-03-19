# Changelog

All notable changes to the pdf-annotator-react package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.41] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [Unreleased]

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.41] - 2024-06-30

### Added
- Enhanced viewOnly mode in PdfAnnotator component
  - Hidden annotation tools when in viewOnly mode while preserving document viewing capabilities
  - Simplified toolbar in viewOnly mode to show only zoom and pagination controls
  - Added "Modo Visualização" label to indicate view-only status
  - Maintained the ability to view all annotations in viewOnly mode
  - Improved user experience by removing irrelevant controls for viewers
  - Added protection against entering edit mode on annotations when in viewOnly mode
- External annotation selection capabilities
  - Added `selectAnnotationById` method to PdfAnnotatorRef
  - Parent components can now highlight specific annotations from external lists/tables
  - Automatically scrolls to the page containing the selected annotation
  - Works in both normal and viewOnly modes
  - Implementation example:
    ```tsx
    const pdfAnnotatorRef = useRef<PdfAnnotatorRef>(null);
    
    // In your table component
    const handleHighlightClick = (annotationId) => {
      pdfAnnotatorRef.current?.selectAnnotationById(annotationId);
    };
    
    // In your render method
    <PdfAnnotator
      ref={pdfAnnotatorRef}
      // other props...
    />
    ```

### Changed
- 

### Fixed
- Fixed PDF.js canvas rendering error when navigating between pages
  - Added proper cleanup of render tasks when component unmounts
  - Implemented cancellation of previous render tasks before starting new ones
  - Added check for component mount status to prevent rendering to unmounted components
  - Fixed coordinates calculation in right-click handler to properly use scale
  - Improved canvas context creation with alpha:false for better performance

## [0.1.40] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.39] - 2025-03-19

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.38] - 2025-03-18

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.37] - 2024-06-12

### Added
- View-only mode for annotations
  - Added `viewOnly` prop to PdfAnnotator component
  - When enabled, users can view but not edit or delete annotations
  - Annotations can still be selected and viewed
  - Ideal for scenarios where multiple user roles access the same content
  - Implementation example:
    ```tsx
    // Editor vs Viewer roles
    <PdfAnnotator
      url="sample.pdf"
      annotations={annotations}
      viewOnly={userRole === 'viewer'} // true for viewers, false for editors
      onAnnotationsChange={handleAnnotationsChange}
    />
    ```
- Enhanced parent component control over annotations
  - Added `onAnnotationsChange` callback to AnnotationDetails component
  - Ensures parent components can react to annotation changes
  - Improves state management in complex applications
  - Implementation example:
    ```tsx
    // In parent component
    const [annotations, setAnnotations] = useState([]);
    
    const handleAnnotationsChange = (updatedAnnotations) => {
      setAnnotations(updatedAnnotations);
      // Save to server, localStorage, etc.
      saveAnnotationsToBackend(updatedAnnotations);
    };
    
    // Pass to PdfAnnotator
    <PdfAnnotator
      annotations={annotations}
      onAnnotationsChange={handleAnnotationsChange}
    />
    ```
  - Full lifecycle support for fetching, saving, and resuming work
  - Integration with custom backend services for annotation persistence

### Changed
- Improved two-column layout in AnnotationDetails component
  - Made left and right columns equal in width for better balance
  - Expanded container width when tag selector is open
  - Enhanced spacing between columns for better visual separation
  - Improved overall usability of the annotation interface
- Relocated close button to top-right corner in AnnotationDetails component
  - Improved usability with standard placement pattern
  - Enhanced visual consistency with common UI patterns
  - Added proper aria-label for accessibility

### Fixed
- 

## [0.1.36] - 2025-03-18

### Added
- 

### Changed
- 

### Fixed
- 

## [0.1.33] - 2025-03-20

### Added
- Sticky ToolBar when scrolling through PDF content
  - ToolBar now remains fixed at the top of the viewport during scrolling
  - Improves accessibility by keeping annotation tools always visible
  - Added subtle shadow effect and smooth transitions
  - Enhanced readability with proper background and z-index

### Changed
- Improved ToolBar styling and structure
  - Better responsive behavior when viewport size changes
  - Fixed background color for consistent appearance
  - Added transition effects for smoother user experience

### Fixed
- 

## [0.1.32] - 2025-03-19

### Added
- New `onAnnotationsChange` prop to PdfAnnotator component
  - Enables parent components to easily track and maintain the full annotations array
  - Provides real-time updates whenever annotations are created, updated, or deleted
  - Simplifies state management in parent components

### Changed
- Improved Tag Selection UI in AnnotationDetails component
  - Added max-height constraints to prevent overflow in viewport
  - Enhanced scrolling behavior for better user experience
  - Made tag containers scrollable for better space management
  - Added sticky header for better visual hierarchy
  - Implemented two-column layout when tag selector is open
    - Left column: Competência dropdown and Anotações textarea
    - Right column: Tag selection interface
    - Improves usability with better space utilization
    - Provides more room for both annotation content and tag selection

### Fixed
- Fixed annotation color not updating when changing category
  - Ensured color is properly updated in the annotation object when category changes
  - Added explicit color handling in the update flow
  - Enhanced color synchronization between categories and annotation rendering

## [0.1.31] - 2025-03-18

### Added
- Type exports for better TypeScript support
  - Added explicit exports for `PdfAnnotatorRef` type
  - Enhanced type safety across component interfaces

### Changed
- Major refactoring to improve type system
  - Replaced `ENEMCategory` and `CategoryType` with `CategoryItem`
  - Updated components to use the new type definitions
  - Enhanced custom categories support throughout the codebase
- Improved project structure
  - Restructured exports for better code organization
  - Simplified root-level PdfAnnotator to be a re-export
  - Consistent import paths across components

### Removed
- Deprecated props that are no longer needed
  - Removed `availableTags` prop (using `customCategories` instead)
  - Removed `categoryColors` prop (colors now come from category items)
  - Simplified color handling across components

### Fixed
- Fixed import path issues that were causing build failures
- Enhanced type compatibility between `CustomCategory` and `CategoryItem`

## [0.1.30] - 2025-03-18

### Fixed
- Fixed category selection bug that was reverting to the first category
  - Corrected issue where selecting a different category would revert to the default
  - Modified the category selection logic to respect user's choice
  - Updated ToolBar to display both ENEM and custom categories correctly
  - Enhanced the handling of customCategories in dropdown options

## [0.1.29] - 2025-03-16

### Changed
- Improved tag selection UI in the AnnotationDetails component
  - Selected tags now remain visible while browsing available tags
  - Added visual separation between selected tags and available tags
  - Enhanced the UI with a "Disponíveis" label for available tags
  - Tag selector now only appears when a category is selected
  - Available tags are now filtered based on the selected category

### Fixed
- Fixed tag filtering logic to match the selected category
  - Tags are now automatically filtered by competency number based on the selected category
  - Improved user experience by only showing relevant tags for each category
  - Automatically selects the correct competency when opening the tag selector

## [0.1.28] - 2025-03-18

### Added
- 

### Changed
- Improved tag selection UI in the AnnotationDetails component
  - Selected tags now remain visible while browsing available tags
  - Added visual separation between selected tags and available tags
  - Enhanced the UI with a "Disponíveis" label for available tags
  - Tag selector now only appears when a category is selected
  - Available tags are now filtered based on the selected category

### Fixed
- Fixed tag filtering logic to match the selected category
  - Tags are now automatically filtered by competency number based on the selected category
  - Improved user experience by only showing relevant tags for each category
  - Automatically selects the correct competency when opening the tag selector

## [0.1.27] - 2025-03-17

### Added
- Visual feedback for rectangle drawing
  - Added real-time preview when creating rectangle annotations
  - Dynamic dashed outline shows exact dimensions before committing
  - Consistent with the visual feedback already available for highlighting
- Thickness selector for drawing tools
  - Added a contextual thickness menu that appears when using drawing tools
  - Support for multiple thickness levels (1px, 2px, 4px, 8px, 12px)
  - Different default thicknesses per tool type (drawing, highlighting, rectangle)
  - Thickness settings persist during the annotation session
  - Visual feedback updates in real-time as thickness changes

### Changed
- 

### Fixed
- Restored selection tool button in the toolbar that was accidentally removed
  - Re-added the hand icon button for selecting annotations
  - Ensured proper button styling and hover effects
  - Maintained proper spacing between toolbar sections
- Fixed PDF rotation issue
  - Added rotation override to prevent PDFs from rendering upside-down
  - Ensures consistent orientation regardless of PDF metadata
  - Improves first-time rendering reliability

## [0.1.26] - 2025-03-17

### Added
- Enhanced zoom controls in the toolbar
  - Reset zoom button (percentage display) now fits PDF to viewport width
  - Improved user experience by making zoom reset match the fitToWidth behavior
  - Maintained backward compatibility with fallback to 1.0 scale

### Changed
- Temporarily commented out PIN annotation feature
  - Disabled PIN annotation creation and handling functions
  - Removed PIN case from annotation type color selection
  - PIN functionality can be re-enabled in a future release if needed
- Improved category selection behavior
  - Now automatically selects the first custom category by default
  - Falls back to the first ENEM category if no custom categories exist
  - No longer restricts the ToolBar to only ENEM categories
  - Fixed an issue with the scrolling panel by removing extra 'p-4' class

### Fixed
-

## [0.1.25] - 2024-07-16

### Fixed
- HIGHLIGHTING mode now works correctly with proper visual feedback
  - Fixed issue where highlight marks weren't being drawn while making free-form highlighting annotations
  - Added proper line caps and joins for a marker-like visual effect
  - Improved real-time preview rendering for marker highlighting
  - Fixed color handling for highlighting annotations

### Changed
- Temporarily commented out PIN annotation feature
  - Disabled PIN annotation creation and handling functions
  - Removed PIN case from annotation type color selection
  - PIN functionality can be re-enabled in a future release if needed
- Improved category selection behavior
  - Now automatically selects the first custom category by default
  - Falls back to the first ENEM category if no custom categories exist
  - No longer restricts the ToolBar to only ENEM categories
  - Fixed an issue with the scrolling panel by removing extra 'p-4' class

## [0.1.24] - 2024-07-16

### Added
- Enhanced tag management in the AnnotationDetails component
  - Added ability to add/remove tags from available tag lists
  - Implemented shadcn-inspired badge UI for tags
  - Added dropdown selector for tag categories
  - Made tags available for all annotation types, not just PIN annotations

### Changed
- Improved tag display with rounded-pill design for better visual distinction
- Tags now respect the selected category color for visual consistency

## [0.1.23] - 2024-07-16

### Added
- Version management scripts to automate release process
  - Added `scripts/increment-version.js` to automatically increment version numbers
  - Added npm scripts for patch, minor, and major version updates
  - Added combined scripts for version increment and publishing in one command
  - Created documentation in `scripts/README.md` with usage instructions

### Changed
- Improved developer workflow with automated versioning
  - Simplified release process with one-command publish scripts
  - Automatic CHANGELOG.md entry creation with templates

### Fixed
- No bug fixes in this release

## [0.1.22] - 2024-07-16

### Added
- New AnnotationMode.HIGHLIGHTING for free-form highlighting with marker-like effect
  - Added a new tool button with a marker icon
  - Highlighting has thicker strokes (10px) with rounded caps and joins for a smoother look
  - Uses translucent yellow color by default for a highlighting pen effect

### Changed
- Doubled the thickness of the drawing tool from 2px to 4px for better visibility

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
- Type issues related to custom categories implementation
  - Added TypeScript type guard to properly handle CategoryType values
  - Updated ToolBar component to work with both ENEMCategory and custom categories
  - Fixed type compatibility issues in component props to ensure type safety

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
