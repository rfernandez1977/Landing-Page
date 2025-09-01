import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { PlaceholderImage } from './placeholder-image-indicator';
import { DragDropResult, BulkAction } from '@/lib/image-system/core/types';

interface DragDropImagesProps {
  images: Array<{
    id: string;
    url: string;
    activity: string;
    photographer: string;
    isPlaceholder?: boolean;
  }>;
  onReorder: (result: DragDropResult) => void;
  onDelete: (imageId: string) => void;
  onBulkAction: (action: BulkAction) => void;
  isLoading?: boolean;
  title?: string;
  showBulkActions?: boolean;
}

export const DragDropImages: React.FC<DragDropImagesProps> = ({
  images,
  onReorder,
  onDelete,
  onBulkAction,
  isLoading = false,
  title = "Imágenes Seleccionadas",
  showBulkActions = true
}) => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const dragResult: DragDropResult = {
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
      itemId: result.draggableId,
      context: 'selected-images'
    };

    onReorder(dragResult);
  };

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const selectAllImages = () => {
    setSelectedImages(new Set(images.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const performBulkAction = async (actionType: BulkAction['type']) => {
    if (selectedImages.size === 0 && actionType !== 'clear-all' && actionType !== 'refresh-cache') {
      return;
    }

    setIsPerformingBulkAction(true);

    const action: BulkAction = {
      type: actionType,
      scope: selectedImages.size === images.length ? 'company' : 'selection',
      targetIds: Array.from(selectedImages),
      confirmation: true
    };

    try {
      await onBulkAction(action);
      
      // Limpiar selección después de acciones destructivas
      if (actionType === 'clear-all' || actionType === 'delete-unused') {
        clearSelection();
      }
    } catch (error) {
      console.error('Error en acción masiva:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📷</div>
        <p>No hay imágenes seleccionadas</p>
        <p className="text-sm mt-1">Busca y selecciona imágenes para ver el organizador</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con título y estadísticas */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            {images.length} imagen{images.length !== 1 ? 'es' : ''} • {images.filter(img => img.isPlaceholder).length} placeholder{images.filter(img => img.isPlaceholder).length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Controles de selección */}
        {showBulkActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllImages}
              disabled={selectedImages.size === images.length}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seleccionar todo
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedImages.size === 0}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar selección
            </button>
          </div>
        )}
      </div>

      {/* Acciones masivas */}
      {showBulkActions && selectedImages.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}:
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => performBulkAction('delete-unused')}
              disabled={isPerformingBulkAction}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
            >
              {isPerformingBulkAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Eliminar
            </button>
            
            <button
              onClick={() => performBulkAction('apply-to-all')}
              disabled={isPerformingBulkAction}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
            >
              {isPerformingBulkAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Aplicar configuración
            </button>
          </div>
        </motion.div>
      )}

      {/* Grid drag & drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images-grid" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600' 
                  : 'border-2 border-transparent'
              }`}
            >
              {images.map((image, index) => (
                <Draggable key={image.id} draggableId={image.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImages.has(image.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } ${
                        snapshot.isDragging 
                          ? 'shadow-lg rotate-2 scale-105 z-50' 
                          : 'shadow-sm'
                      }`}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="absolute top-2 left-2 z-10 p-1 bg-black bg-opacity-50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>

                      {/* Checkbox de selección */}
                      {showBulkActions && (
                        <div className="absolute top-2 right-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={() => toggleImageSelection(image.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Imagen */}
                      <div className="aspect-square">
                        <PlaceholderImage
                          src={image.url}
                          alt={`${image.activity} - ${image.photographer}`}
                          className="w-full h-full object-cover"
                          showIndicator={image.isPlaceholder}
                          context="selected"
                          indicatorSize="sm"
                        />
                      </div>

                      {/* Información */}
                      <div className="p-2 bg-white dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {image.activity}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {image.photographer}
                        </p>
                      </div>

                      {/* Botón eliminar individual */}
                      <button
                        onClick={() => onDelete(image.id)}
                        className="absolute bottom-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      {/* Overlay de drag */}
                      {snapshot.isDragging && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-lg" />
                      )}
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Acciones masivas adicionales */}
      {showBulkActions && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => performBulkAction('refresh-cache')}
              disabled={isPerformingBulkAction}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1"
            >
              {isPerformingBulkAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              Refrescar cache
            </button>
          </div>

          <button
            onClick={() => performBulkAction('clear-all')}
            disabled={isPerformingBulkAction}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
          >
            {isPerformingBulkAction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Limpiar todo
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Actualizando...</span>
          </div>
        </div>
      )}
    </div>
  );
};
