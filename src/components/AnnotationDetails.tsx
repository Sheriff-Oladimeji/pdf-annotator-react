import React, { useState, useEffect } from 'react';
import { Annotation, AnnotationType, ENEMCategory, TagInterface } from '../types';
import { getCategoryDisplayName } from '../utils';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(annotation.content || '');
  const [selectedCategory, setSelectedCategory] = useState<ENEMCategory | undefined>(
    annotation.category
  );
  const [tags, setTags] = useState<TagInterface[]>(annotation.tags || []);

  // Update local state when annotation prop changes
  useEffect(() => {
    setContent(annotation.content || '');
    setSelectedCategory(annotation.category);
    setTags(annotation.tags || []);
  }, [annotation]);

  const handleSave = () => {
    onUpdate(annotation.id, { 
      content,
      category: selectedCategory,
      tags: tags
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
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
      className="fixed right-5 top-[70px] w-[300px] bg-white shadow-lg rounded-md p-4 z-50"
    >
      <div
        className="flex justify-between items-center mb-2.5"
      >
        <h3
          className="m-0 text-base font-bold"
        >
          Annotation
        </h3>
        <button
          onClick={onClose}
          className="bg-transparent border-0 text-xl cursor-pointer p-0"
        >
          &times;
        </button>
      </div>

      <div
        className="border-b border-gray-200 pb-2.5 mb-2.5"
      >
        <p>
          <strong>Type:</strong> {annotation.type}
        </p>
        {annotation.category && (
          <p>
            <strong>Category:</strong> {getCategoryDisplayName(annotation.category)}
          </p>
        )}
        <p>
          <strong>Created:</strong> {formatDate(annotation.createdAt)}
        </p>
        {annotation.updatedAt && (
          <p>
            <strong>Updated:</strong> {formatDate(annotation.updatedAt)}
          </p>
        )}
        {annotation.author && (
          <p>
            <strong>Author:</strong> {annotation.author}
          </p>
        )}
      </div>

      {isEditing ? (
        <div>
          <div className="mb-2.5">
            <label htmlFor="category-select" className="block mb-1.5">
              <strong>Category:</strong>
            </label>
            <select
              id="category-select"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value as ENEMCategory)}
              className="w-full p-2 border border-gray-300 rounded-md mb-2.5"
            >
              <option value="">No Category</option>
              {Object.values(ENEMCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
          
          <label htmlFor="content-textarea" className="block mb-1.5">
            <strong>Content:</strong>
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
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Show tags for PIN annotations */}
          {annotation.type === AnnotationType.PIN && tags.length > 0 && (
            <div className="mb-4">
              <strong>Issues:</strong>
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
            <strong>Content:</strong>
            <p
              className="mt-1.5 mb-0 whitespace-pre-wrap"
            >
              {annotation.content || '(No content)'}
            </p>
          </div>
          <div
            className="flex justify-end space-x-2"
          >
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 