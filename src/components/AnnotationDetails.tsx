import React, { useState, useEffect, useMemo } from 'react';
import { Annotation, AnnotationType, ENEMCategory, TagInterface, CategoryItem, CategoryType, TagCompetenciaInterface } from '../types';
import { getCategoryDisplayName, getCategoryColor, DEFAULT_CATEGORY_COLORS } from '../utils';
import { IoClose, IoSave, IoTrash, IoPencil, IoArrowBack, IoAdd, IoRemove, IoCheckmark } from 'react-icons/io5';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number, y: number }; // Optional position for the dialog
  isNew?: boolean; // Flag to indicate if this is a newly created annotation
  customCategories?: CategoryItem[]; // Add customCategories prop
  categoryColors?: Record<string, string>; // Add categoryColors prop
  availableTags?: TagCompetenciaInterface[]; // Add availableTags prop
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
  position,
  isNew = false,
  customCategories = [],
  categoryColors = {},
  availableTags = [],
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>(
    annotation.category
  );
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [selectedCompetencia, setSelectedCompetencia] = useState<number | null>(null);

  // Calculate category color using custom categories
  const categoryColor = useMemo(() => {
    // Use the selected category in edit mode, otherwise use the annotation's category
    const categoryToUse = isEditing ? selectedCategory : annotation.category;
    return getCategoryColor(categoryToUse, categoryColors, customCategories);
  }, [annotation.category, selectedCategory, isEditing, categoryColors, customCategories]);

  // Update local state when annotation prop changes
  useEffect(() => {
    console.log('Annotation updated in details component:', annotation);
    setContent(annotation.content || '');
    setSelectedCategory(annotation.category);
    setTags(annotation.tags || []);
  }, [annotation, annotation.content, annotation.category, annotation.tags]);

  // Get all available categories (combination of default ENEM and custom categories)
  const allCategories = useMemo(() => {
    // Start with the default ENEM categories
    const enemCategories = Object.values(ENEMCategory).map(id => ({ 
      id,
      displayName: getCategoryDisplayName(id, customCategories)
    }));
    
    // Merge with custom categories, avoiding duplicates
    const customCats = customCategories.filter(
      c => !Object.values(ENEMCategory).includes(c.id as ENEMCategory)
    );
    
    return [...enemCategories, ...customCats];
  }, [customCategories]);

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
      color: getCategoryColor(selectedCategory, categoryColors, customCategories),
      category: selectedCategory,
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

  return (
    <div
      className="fixed w-[300px] bg-white shadow-lg rounded-md p-4 z-50"
      style={{
        top: position ? `${position.y}px` : '70px',
        right: position ? 'auto' : '20px',
        left: position ? `${position.x}px` : 'auto',
        transform: position ? 'translate(-50%, 0)' : 'none',
        borderTop: categoryColor ? `4px solid ${categoryColor}` : undefined,
      }}
    >
      <div
        className="flex justify-between items-center mb-2.5"
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

      {/* <div
        className="border-b border-gray-200 pb-2.5 mb-2.5"
      >
        <p>
          <strong>Tipo:</strong> {annotation.type}
        </p>
        {annotation.category && (
          <p>
            <strong>Categoria:</strong> 
            <span 
              className="ml-1 px-2 py-0.5 rounded inline-block"
              style={{ 
                backgroundColor: getCategoryColor(annotation.category, categoryColors, customCategories),
                color: 'white',
                fontSize: '0.9em'
              }}
            >
              {getCategoryDisplayName(annotation.category, customCategories)}
            </span>
          </p>
        )}
        <p>
          <strong>Criado:</strong> {formatDate(annotation.createdAt)}
        </p>
        {annotation.updatedAt && (
          <p>
            <strong>Atualizado:</strong> {formatDate(annotation.updatedAt)}
          </p>
        )}
        {annotation.author && (
          <p>
            <strong>Autor:</strong> {annotation.author}
          </p>
        )}
      </div> */}

      {isEditing ? (
        <div>
          <div className="mb-2.5">
            <label htmlFor="category-select" className="block mb-1.5">
              <strong>Competência:</strong>
            </label>
            <select
              id="category-select"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
              style={{ 
                borderLeftWidth: '4px',
                borderLeftColor: categoryColor || 'transparent'
              }}
            >
              <option value="">Sem Categoria</option>
              {allCategories.map((category) => (
                <option 
                  key={category.id} 
                  value={category.id}
                  style={{
                    backgroundColor: category.id === selectedCategory ? 
                      getCategoryColor(category.id, categoryColors, customCategories) : 
                      'transparent',
                    color: category.id === selectedCategory ? 'white' : 'inherit'
                  }}
                >
                  {category.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Selection UI */}
          {availableTags.length > 0 && selectedCategory && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-gray-700">
                  <strong>Tags:</strong>
                </label>
                <button 
                  type="button"
                  onClick={() => {
                    setShowTagSelector(!showTagSelector);
                    // Try to convert the selected category to a number if it's a competency
                    const categoryNum = parseInt(String(selectedCategory).replace(/\D/g, ''));
                    if (!isNaN(categoryNum)) {
                      setSelectedCompetencia(categoryNum);
                    }
                  }}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
                >
                  {showTagSelector ? (
                    <>
                      <IoRemove size={14} className="mr-1" />
                      Ocultar Tags
                    </>
                  ) : (
                    <>
                      <IoAdd size={14} className="mr-1" />
                      Adicionar Tags
                    </>
                  )}
                </button>
              </div>
              
              {/* Selected Tags Display - Always visible when tags exist */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2 bg-gray-50 p-2 rounded-md">
                  {tags.map((tag) => (
                    <div 
                      key={tag._id || `${tag.tipo}-${tag.tag}`}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      style={{
                        backgroundColor: `${categoryColor}15` || 'rgba(219, 234, 254, 1)',
                        color: categoryColor || 'rgb(30, 64, 175)'
                      }}
                    >
                      <span>{tag.tag}</span>
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-red-200 hover:text-red-500 focus:outline-none focus:text-red-500"
                      >
                        <IoClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Tag Selector - Only visible when showTagSelector is true */}
              {showTagSelector && (
                <div className="bg-gray-50 rounded-md p-2 mb-3 border border-gray-200 max-h-[200px] overflow-y-auto">
                  <div className="mb-2">
                    <select
                      value={selectedCompetencia || ''}
                      onChange={(e) => setSelectedCompetencia(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-1.5 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="">Selecione uma competência</option>
                      {/* Filter availableTags based on the selected category if possible */}
                      {availableTags
                        .filter(comp => {
                          // If selectedCategory is a competency (like "competencia1"), extract the number
                          if (typeof selectedCategory === 'string' && selectedCategory.startsWith('competencia')) {
                            const categoryNum = parseInt(selectedCategory.replace(/\D/g, ''));
                            // Only show tags for this competency
                            return !isNaN(categoryNum) && comp.competencia === categoryNum;
                          }
                          // For custom categories or non-numeric categories, show all tags
                          return true;
                        })
                        .map((comp) => (
                          <option key={comp.competencia} value={comp.competencia}>
                            Competência {comp.competencia}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  {selectedCompetencia !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center py-1 mb-1 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-500">Disponíveis</span>
                      </div>
                      {availableTags
                        .find(c => c.competencia === selectedCompetencia)
                        ?.tagsCompetencia.map((tag) => (
                          <div 
                            key={tag._id || `${tag.tipo}-${tag.tag}`}
                            className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-sm ${
                              isTagSelected(tag) 
                                ? 'bg-blue-100 border border-blue-300' 
                                : 'hover:bg-gray-100 border border-transparent'
                            }`}
                            onClick={() => toggleTag(tag)}
                            style={{
                              backgroundColor: isTagSelected(tag) 
                                ? `${categoryColor}15` || 'rgba(219, 234, 254, 1)'
                                : undefined,
                              borderColor: isTagSelected(tag) 
                                ? `${categoryColor}30` || 'rgba(147, 197, 253, 1)'
                                : 'transparent'
                            }}
                          >
                            <span>{tag.tag}</span>
                            {isTagSelected(tag) && (
                              <IoCheckmark 
                                size={16} 
                                className="text-blue-600"
                                style={{ color: categoryColor || 'rgb(37, 99, 235)' }}
                              />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <label htmlFor="content-textarea" className="block mb-1.5">
            <strong>Comentário:</strong>
          </label>
          <textarea
            id="content-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md min-h-[80px] mb-2.5 resize-y"
            style={{ 
              borderColor: categoryColor ? `${categoryColor}40` : 'rgb(209, 213, 219)',
              boxShadow: categoryColor ? `0 0 0 1px ${categoryColor}20` : 'none'
            }}
          />
          <div
            className="flex justify-end space-x-2"
          >
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <IoArrowBack className="mr-1" size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-colors flex items-center"
              style={{ backgroundColor: categoryColor || '#3b82f6' }}
            >
              <IoSave className="mr-1" size={16} />
              Salvar
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Show tags for annotations */}
          {tags.length > 0 && (
            <div className="mb-4">
              <strong>Tags:</strong>
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span 
                    key={tag._id || `${tag.tipo}-${tag.tag}`} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${categoryColor}15` || 'rgba(219, 234, 254, 1)',
                      color: categoryColor || 'rgb(30, 64, 175)'
                    }}
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div
            className="mb-4"
          >
            <strong>Conteúdo:</strong>
            <p
              className="mt-1.5 mb-0 whitespace-pre-wrap"
            >
              {annotation.content || '(Sem conteúdo)'}
            </p>
          </div>
          <div
            className="flex justify-end space-x-2"
          >
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
            >
              <IoTrash className="mr-1" size={16} />
              Apagar
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-white rounded-md hover:opacity-90 transition-colors flex items-center"
              style={{ backgroundColor: categoryColor || '#3b82f6' }}
            >
              <IoPencil className="mr-1" size={16} />
              Editar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 