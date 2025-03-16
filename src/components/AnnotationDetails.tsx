import React, { useState, useEffect } from 'react';
import { Annotation, AnnotationType, ENEMCategory, TagInterface } from '../types';
import { getCategoryDisplayName, getCategoryColor, DEFAULT_CATEGORY_COLORS } from '../utils';
import { IoClose, IoSave, IoTrash, IoPencil, IoArrowBack } from 'react-icons/io5';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  position?: { x: number, y: number }; // Optional position for the dialog
  isNew?: boolean; // Flag to indicate if this is a newly created annotation
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
  position,
  isNew = false,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<ENEMCategory | undefined>(
    annotation.category
  );
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);

  // Update local state when annotation prop changes
  useEffect(() => {
    console.log('Annotation updated in details component:', annotation);
    setContent(annotation.content || '');
    setSelectedCategory(annotation.category);
    setTags(annotation.tags || []);
  }, [annotation, annotation.content, annotation.category, annotation.tags]);

  // Log when component updates with isNew flag
  useEffect(() => {
    console.log('AnnotationDetails rendered:', { 
      id: annotation.id, 
      isNew, 
      position, 
      isEditing 
    });
  }, [annotation.id, isNew, position, isEditing]);

  const handleSave = () => {
    console.log('Saving annotation changes:', {
      id: annotation.id,
      color: getCategoryColor(selectedCategory),
      content,
      category: selectedCategory,
      tags
    });
    
    onUpdate(annotation.id, { 
      content,
      color: getCategoryColor(selectedCategory),
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
      }}
    >
      <div
        className="flex justify-between items-center mb-2.5"
      >
        <h3
          className="m-0 text-base font-bold"
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
            <strong>Categoria:</strong> {getCategoryDisplayName(annotation.category)}
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
              onChange={(e) => setSelectedCategory(e.target.value as ENEMCategory)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
            >
              <option value="">Sem Categoria</option>
              {Object.values(ENEMCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
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
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
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
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
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
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
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