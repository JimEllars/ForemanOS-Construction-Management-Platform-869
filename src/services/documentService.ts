import { supabase } from '../lib/supabaseClient';
import { Document } from '../types';

const STORAGE_BUCKET = 'project-documents';
const TABLE_NAME = 'documents_fos2025';

export const documentService = {
  /**
   * Upload a file to Supabase Storage and create a document record
   */
  async uploadDocument(
    file: File,
    projectId: string,
    uploadedBy: string
  ): Promise<Document> {
    try {
      console.log('📤 Starting file upload:', file.name, 'Size:', file.size);

      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${projectId}/${fileName}`;

      // Upload file to Supabase Storage
      console.log('🔄 Uploading to storage path:', storagePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ File upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData.path);

      // Get file type category
      const fileType = documentService.getFileType(fileExt);

      // Create document record in database
      const documentData = {
        project_id: projectId,
        name: file.name,
        storage_path: uploadData.path,
        file_type: fileType,
        file_extension: fileExt,
        size_bytes: file.size,
        uploaded_by: uploadedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Creating document record:', documentData);
      const { data: documentRecord, error: dbError } = await supabase
        .from(TABLE_NAME)
        .insert(documentData)
        .select(`
          *,
          projects_fos2025!inner(name, company_id),
          profiles_fos2025!documents_fos2025_uploaded_by_fkey(name)
        `)
        .single();

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        console.error('❌ Database insert error:', dbError);
        await supabase.storage.from(STORAGE_BUCKET).remove([uploadData.path]);
        throw new Error(`Failed to create document record: ${dbError.message}`);
      }

      console.log('✅ Document record created:', documentRecord.id);

      // Transform to frontend format
      return documentService.transformDocumentRecord(documentRecord);

    } catch (error: any) {
      console.error('❌ Document upload failed:', error);
      throw error;
    }
  },

  /**
   * Get all documents for a company's projects
   */
  async getDocumentsByCompany(companyId: string): Promise<Document[]> {
    try {
      console.log('🔍 Fetching documents for company:', companyId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name, company_id),
          profiles_fos2025!documents_fos2025_uploaded_by_fkey(name)
        `)
        .eq('projects_fos2025.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching documents:', error);
        throw error;
      }

      console.log('✅ Documents fetched:', (data || []).length);
      return (data || []).map(documentService.transformDocumentRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch documents:', error);
      throw error;
    }
  },

  /**
   * Get documents for a specific project
   */
  async getDocumentsByProject(projectId: string): Promise<Document[]> {
    try {
      console.log('🔍 Fetching documents for project:', projectId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name),
          profiles_fos2025!documents_fos2025_uploaded_by_fkey(name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching project documents:', error);
        throw error;
      }

      console.log('✅ Project documents fetched:', (data || []).length);
      return (data || []).map(documentService.transformDocumentRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch project documents:', error);
      throw error;
    }
  },

  /**
   * Get download URL for a document
   */
  async getDocumentDownloadUrl(storagePath: string): Promise<string> {
    try {
      console.log('🔗 Getting download URL for:', storagePath);

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        console.error('❌ Error creating signed URL:', error);
        throw new Error(`Failed to get download URL: ${error.message}`);
      }

      console.log('✅ Download URL created');
      return data.signedUrl;

    } catch (error: any) {
      console.error('❌ Failed to get download URL:', error);
      throw error;
    }
  },

  /**
   * Delete a document and its file
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting document:', documentId);

      // First, get the document to find its storage path
      const { data: document, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching document for deletion:', fetchError);
        throw new Error(`Failed to find document: ${fetchError.message}`);
      }

      // Delete the file from storage
      console.log('🗑️ Deleting file from storage:', document.storage_path);
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([document.storage_path]);

      if (storageError) {
        console.warn('⚠️ Failed to delete file from storage:', storageError);
        // Continue with database deletion even if file deletion fails
      }

      // Delete the document record
      const { error: dbError } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('❌ Error deleting document record:', dbError);
        throw new Error(`Failed to delete document: ${dbError.message}`);
      }

      console.log('✅ Document deleted successfully');

    } catch (error: any) {
      console.error('❌ Document deletion failed:', error);
      throw error;
    }
  },

  /**
   * Update document metadata
   */
  async updateDocument(documentId: string, updates: Partial<Document>): Promise<Document> {
    try {
      console.log('📝 Updating document:', documentId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select(`
          *,
          projects_fos2025!inner(name),
          profiles_fos2025!documents_fos2025_uploaded_by_fkey(name)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating document:', error);
        throw error;
      }

      console.log('✅ Document updated successfully');
      return documentService.transformDocumentRecord(data);

    } catch (error: any) {
      console.error('❌ Document update failed:', error);
      throw error;
    }
  },

  /**
   * Get file type category based on extension
   */
  getFileType(extension: string): string {
    const ext = extension.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
      return 'image';
    }
    
    if (['pdf'].includes(ext)) {
      return 'pdf';
    }
    
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
      return 'document';
    }
    
    if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return 'spreadsheet';
    }
    
    if (['dwg', 'dxf', 'step', 'stp'].includes(ext)) {
      return 'cad';
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return 'archive';
    }
    
    return 'other';
  },

  /**
   * Get file category for UI purposes
   */
  getFileCategory(fileName: string, fileType: string): string {
    const name = fileName.toLowerCase();
    
    // Check filename patterns first
    if (name.includes('plan') || name.includes('blueprint') || name.includes('drawing')) {
      return 'plans';
    }
    
    if (name.includes('permit') || name.includes('license') || name.includes('approval')) {
      return 'permits';
    }
    
    if (name.includes('safety') || name.includes('msds') || name.includes('hazard')) {
      return 'safety';
    }
    
    if (name.includes('report') || name.includes('summary') || name.includes('analysis')) {
      return 'reports';
    }
    
    if (name.includes('contract') || name.includes('agreement') || name.includes('legal')) {
      return 'contracts';
    }
    
    // Fall back to file type
    if (fileType === 'image') {
      return 'photos';
    }
    
    if (fileType === 'cad') {
      return 'plans';
    }
    
    return 'other';
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    if (i === 0) {
      return `${bytes} ${sizes[i]}`;
    }

    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Transform database record to frontend Document type
   */
  transformDocumentRecord(record: any): Document {
    return {
      id: record.id,
      project_id: record.project_id,
      project_name: record.projects_fos2025?.name || 'Unknown Project',
      name: record.name,
      storage_path: record.storage_path,
      file_type: record.file_type,
      file_extension: record.file_extension,
      category: documentService.getFileCategory(record.name, record.file_type),
      size_bytes: record.size_bytes,
      size_display: documentService.formatFileSize(record.size_bytes),
      uploaded_by: record.uploaded_by,
      uploaded_by_name: record.profiles_fos2025?.name || 'Unknown User',
      created_at: record.created_at,
      updated_at: record.updated_at
    };
  }
};