import { StateCreator } from 'zustand';
import { Document } from '../types';

export interface DocumentSlice {
  documents: Document[];
  documentsLoading: boolean;
  
  // Document actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setDocumentsLoading: (loading: boolean) => void;
}

export const createDocumentSlice: StateCreator<DocumentSlice> = (set) => ({
  documents: [],
  documentsLoading: false,

  // Document actions
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => 
    set((state) => ({ 
      documents: [document, ...state.documents] 
    })),
  
  updateDocument: (id, updates) => 
    set((state) => ({
      documents: state.documents.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    })),
  
  removeDocument: (id) => 
    set((state) => ({
      documents: state.documents.filter(doc => doc.id !== id)
    })),
  
  setDocumentsLoading: (documentsLoading) => set({ documentsLoading }),
});