import React, { useState, useEffect, useMemo } from 'react';
import { Annotation, AnnotationType, ENEMCategory, TagInterface, CategoryItem, CategoryType } from '../types';
import { getCategoryDisplayName, getCategoryColor, DEFAULT_CATEGORY_COLORS } from '../utils';
import { IoClose, IoSave, IoTrash, IoPencil, IoArrowBack } from 'react-icons/io5';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number, y: number }; // Optional position for the dialog
  isNew?: boolean; // Flag to indicate if this is a newly created annotation
  customCategories?: CategoryItem[]; // Add customCategories prop
  categoryColors?: Record<string, string>; // Add categoryColors prop
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
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | undefined>(
    annotation.category
  );
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);

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

      <div
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
      </div>

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
          
          <label htmlFor="content-textarea" className="block mb-1.5">
            <strong>Conteúdo:</strong>
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
          {/* Show tags for PIN annotations */}
          {annotation.type === AnnotationType.PIN && tags.length > 0 && (
            <div className="mb-4">
              <strong>Problemas:</strong>
              <div className="mt-2 space-y-2">
                {Object.entries(groupedTags).map(([tipo, typeTags]) => (
                  <div key={tipo} className="bg-gray-50 p-2 rounded-md">
                    <div className="text-sm font-medium text-gray-700 mb-1">{tipo}:</div>
                    <div className="flex flex-wrap gap-1">
                      {typeTags.map((tag) => (
                        <span 
                          key={tag._id || `${tag.tipo}-${tag.tag}`} 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                          style={{ 
                            backgroundColor: `${categoryColor}20` || 'rgba(219, 234, 254, 1)',
                            color: categoryColor || 'rgb(30, 64, 175)'
                          }}
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