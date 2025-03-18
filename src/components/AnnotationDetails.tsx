import React, { useState, useEffect, useMemo } from 'react';
import { Annotation, AnnotationType, TagInterface, CategoryItem, CustomCategory } from '../types';
import { getCategoryDisplayName, getCategoryColor } from '../utils';
import { IoClose, IoSave, IoTrash, IoPencil, IoArrowBack, IoAdd, IoRemove, IoCheckmark } from 'react-icons/io5';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number, y: number }; // Optional position for the dialog
  isNew?: boolean; // Flag to indicate if this is a newly created annotation
  customCategories?: CustomCategory[]; // Use CustomCategory for categories with tags
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
  position,
  isNew = false,
  customCategories = [],
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | undefined>(annotation.category);
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<number | null>(null);

  // Category color comes directly from the selected category
  const categoryColor = useMemo(() => {
    // Use the selected category in edit mode, otherwise use the annotation's category
    const categoryToUse = isEditing ? selectedCategory : annotation.category;
    return categoryToUse?.color || '';
  }, [annotation.category, selectedCategory, isEditing]);

  // Update local state when annotation prop changes
  useEffect(() => {
    console.log('Annotation updated in details component:', annotation);
    setContent(annotation.content || '');
    setSelectedCategory(annotation.category);
    setTags(annotation.tags || []);
  }, [annotation, annotation.content, annotation.category, annotation.tags]);

  // Get all available categories from customCategories
  const allCategories = useMemo(() => {
    return customCategories.map(cat => cat.competencia);
  }, [customCategories]);

  // Get available tags for the selected category
  const availableTagsForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    
    const selectedCustomCategory = customCategories.find(
      cc => cc.competencia.category === selectedCategory.category
    );
    
    if (selectedCustomCategory) {
      return selectedCustomCategory.tagsCompetencia;
    }
    
    return [];
  }, [selectedCategory, customCategories]);

  // Function to check if a tag is already selected
  const isTagSelected = (tag: TagInterface) => {
    return tags.some(t => 
      (t._id && tag._id && t._id === tag._id) || 
      (t.tag === tag.tag && t.tipo === tag.tipo)
    );
  };

  // Function to toggle a tag in the selection
  const toggleTag = (tag: TagInterface) => {
    if (isTagSelected(tag)) {
      // Remove tag
      setTags(tags.filter(t => 
        !((t._id && tag._id && t._id === tag._id) || 
        (t.tag === tag.tag && t.tipo === tag.tipo))
      ));
    } else {
      // Add tag
      setTags([...tags, tag]);
    }
  };

  const handleSave = () => {
    onUpdate(annotation.id, { 
      content,
      category: selectedCategory,
      color: selectedCategory?.color || annotation.color,
      tags
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
      onDelete(annotation.id);
    }
  };

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString();
  };

  // Group tags by type for display
  const groupedTags = tags.reduce<Record<string, TagInterface[]>>((acc, tag) => {
    if (!acc[tag.tipo]) {
      acc[tag.tipo] = [];
    }
    acc[tag.tipo].push(tag);
    return acc;
  }, {});

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value, 10);
    const category = allCategories.find(c => c.category === categoryId);
    setSelectedCategory(category);
    
    // If we have a new category, reset the selected tags
    if (category && (!selectedCategory || category.category !== selectedCategory.category)) {
      setTags([]);
    }
  };

  return (
    <div
      className="fixed w-[300px] bg-white shadow-lg rounded-md p-4 z-50 max-h-[90vh] overflow-auto"
      style={{
        top: position ? `${position.y}px` : '70px',
        right: position ? 'auto' : '20px',
        left: position ? `${position.x}px` : 'auto',
        transform: position ? 'translate(-50%, 0)' : 'none',
        borderTop: categoryColor ? `4px solid ${categoryColor}` : undefined,
      }}
    >
      <div
        className="flex justify-between items-center mb-2.5 sticky top-0 bg-white z-10"
      >
        <h3
          className="m-0 text-base font-bold"
          style={{ color: categoryColor || 'inherit' }}
        >
          Anotação
        </h3>
        <button
          onClick={onClose}
          className="bg-transparent border-0 text-xl cursor-pointer p-0 flex items-center justify-center"
        >
          <IoClose size={22} />
        </button>
      </div>

      
      {isEditing ? (
        <div>
          {availableTagsForCategory.length > 0 && selectedCategory && showTagSelector ? (
            // Two-column layout when tag selector is visible
            <div className="flex flex-row space-x-3">
              {/* Left column: Competência and Anotações */}
              <div className="flex-1">
                <div className="mb-2.5">
                  <label htmlFor="category-select" className="block mb-1.5">
                    <strong>Competência:</strong>
                  </label>
                  <select
                    id="category-select"
                    value={selectedCategory?.category.toString() || ''}
                    onChange={handleCategoryChange}
                    className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
                    style={{ 
                      borderLeftWidth: '4px',
                      borderLeftColor: categoryColor || 'transparent'
                    }}
                  >
                    <option value="">Sem Categoria</option>
                    {allCategories.map((category) => (
                      <option 
                        key={category.category} 
                        value={category.category}
                      >
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="annotation-content" className="block mb-1.5">
                    <strong>Anotações:</strong>
                  </label>
                  <textarea
                    id="annotation-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md min-h-[150px]"
                    placeholder="Adicione um comentário..."
                  />
                </div>
              </div>
              
              {/* Right column: Tag selector */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-gray-700">
                      <strong>Tags:</strong>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowTagSelector(false)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
                    >
                      <IoRemove size={14} className="mr-1" />
                      Ocultar Tags
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-[250px] overflow-y-auto">
                    <p className="text-xs text-gray-500 mb-2">Disponíveis:</p>
                    {availableTagsForCategory.map(tag => (
                      <div key={tag._id || tag.tag} className="mb-1 last:mb-0">
                        <button
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`w-full text-left px-2 py-1 rounded-md text-sm ${
                            isTagSelected(tag) 
                              ? 'bg-blue-100 border border-blue-300' 
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                              isTagSelected(tag) ? 'bg-blue-500 text-white' : 'border border-gray-400'
                            }`}>
                              {isTagSelected(tag) && <IoCheckmark size={12} />}
                            </div>
                            {tag.tag}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Display selected tags */}
                  {tags.length > 0 && (
                    <div className="mt-3">
                      <strong className="block mb-1.5">Tags Selecionadas:</strong>
                      <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-1">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center mb-1 mr-1"
                          >
                            {tag.tag}
                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="ml-1 text-gray-600 hover:text-red-500"
                            >
                              <IoClose size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Single column layout when tag selector is not visible
            <>
              <div className="mb-2.5">
                <label htmlFor="category-select" className="block mb-1.5">
                  <strong>Competência:</strong>
                </label>
                <select
                  id="category-select"
                  value={selectedCategory?.category.toString() || ''}
                  onChange={handleCategoryChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
                  style={{ 
                    borderLeftWidth: '4px',
                    borderLeftColor: categoryColor || 'transparent'
                  }}
                >
                  <option value="">Sem Categoria</option>
                  {allCategories.map((category) => (
                    <option 
                      key={category.category} 
                      value={category.category}
                    >
                      {category.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Selection UI Button */}
              {availableTagsForCategory.length > 0 && selectedCategory && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-gray-700">
                      <strong>Tags:</strong>
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowTagSelector(true)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
                    >
                      <IoAdd size={14} className="mr-1" />
                      Adicionar Tags
                    </button>
                  </div>
                  
                  {/* Display selected tags */}
                  {tags.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-1">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded-md text-xs flex items-center mb-1 mr-1"
                          >
                            {tag.tag}
                            <button
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="ml-1 text-gray-600 hover:text-red-500"
                            >
                              <IoClose size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="annotation-content" className="block mb-1.5">
                  <strong>Anotações:</strong>
                </label>
                <textarea
                  id="annotation-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                  placeholder="Adicione um comentário..."
                />
              </div>
            </>
          )}

          <div className="flex space-x-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md flex items-center"
            >
              <IoArrowBack size={16} className="mr-1" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center"
            >
              <IoSave size={16} className="mr-1" />
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Display mode */}
          <div className="mb-3">
            {annotation.category && (
              <div className="mb-2">
                <strong>Categoria:</strong> 
                <span 
                  className="ml-1 px-2 py-0.5 rounded inline-block"
                  style={{ 
                    backgroundColor: annotation.category.color,
                    color: 'white',
                    fontSize: '0.9em'
                  }}
                >
                  {annotation.category.displayName}
                </span>
              </div>
            )}

            {/* Display tags by type */}
            {Object.entries(groupedTags).length > 0 && (
              <div className="mb-2">
                <strong>Tags:</strong>
                <div className="max-h-[150px] overflow-y-auto mt-1">
                  {Object.entries(groupedTags).map(([tipo, tagsOfType]) => (
                    <div key={tipo} className="mt-1">
                      <div className="flex flex-wrap gap-1">
                        {tagsOfType.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-2 py-0.5 rounded-md text-xs mb-1 mr-1"
                          >
                            {tag.tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display content */}
           {content && <div className="mt-3">
              <strong>Anotações:</strong>
              <div className="mt-1 p-2 bg-gray-50 rounded-md min-h-[40px] whitespace-pre-wrap">
                {content || <em className="text-gray-400">Sem conteúdo</em>}
              </div>
            </div>}
          </div>

          <div className="flex space-x-2 justify-end">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md flex items-center"
            >
              <IoTrash size={16} className="mr-1" />
              Excluir
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md flex items-center"
            >
              <IoPencil size={16} className="mr-1" />
              Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 