import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { 
  Plus, 
  Search, 
  File, 
  Upload, 
  Download, 
  Tag, 
  Eye, 
  FileText, 
  History,
  AlertCircle
} from 'lucide-react';

export default function DocumentRepository() {
  const { token, user } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Preview state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setDocuments(list);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Please choose a file to upload.');

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', tags);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setFile(null);
        setTags('');
        setShowUpload(false);
        fetchDocuments();
      } else {
        const d = await res.json();
        setError(d.message || 'File upload failed.');
      }
    } catch (err) {
      setError('Server connection failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectDoc = async (doc) => {
    setSelectedDoc(doc);
    setPreviewContent('');
    setLoadingPreview(true);

    try {
      // Fetch text contents of the document
      const res = await fetch(`/api/documents/download/${doc.path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const text = await res.text();
        setPreviewContent(text);
      } else {
        setPreviewContent('Failed to fetch preview content.');
      }
    } catch (err) {
      setPreviewContent('Error loading preview from server.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter(d => {
    const term = search.toLowerCase();
    return d.name.toLowerCase().includes(term) || 
           d.tags.some(tag => tag.toLowerCase().includes(term)) ||
           d.extension.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Document Vault</h2>
          <p className="text-xs text-slate-500 font-light mt-1">Classified technical manuals, blueprints, and supplier proposals.</p>
        </div>
        {['Administrator', 'Project Manager', 'Engineer'].includes(user?.role) && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Upload File</span>
          </button>
        )}
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Search and Table List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blueprints by name, extension, tags..."
                className="w-full pl-10 pr-3 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Table display */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-950/20 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3">Uploader</th>
                    <th className="px-5 py-3">Version</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredDocs.length > 0 ? (
                    filteredDocs.map(doc => (
                      <tr 
                        key={doc._id || doc.id}
                        onClick={() => handleSelectDoc(doc)}
                        className={`hover:bg-slate-50/80 cursor-pointer dark:hover:bg-slate-900/40 ${
                          selectedDoc?._id === doc._id ? 'bg-sky-50/15 dark:bg-sky-950/10' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-sky-400 shrink-0" />
                            <span className="font-semibold text-slate-750 dark:text-slate-200 truncate max-w-[200px]">{doc.name}</span>
                          </div>
                          {doc.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {doc.tags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[8px] px-1.5 py-0.2 bg-slate-100 text-slate-450 rounded dark:bg-slate-800 dark:text-slate-400">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-bold dark:bg-slate-800">{doc.extension}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-light">{formatSize(doc.size)}</td>
                        <td className="px-5 py-3.5 text-slate-500 truncate max-w-[100px]">{doc.uploader.split(' ')[0]}</td>
                        <td className="px-5 py-3.5 font-mono text-[10px] text-slate-550">{doc.version}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                        No vault files matching search rules.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Upload Form OR Preview Drawer */}
        <div className="space-y-6">

          {/* Upload panel */}
          {showUpload && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Vault New Document</h3>
                <button 
                  onClick={() => setShowUpload(false)} 
                  className="text-xs font-medium text-slate-400 hover:text-slate-655"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpload} className="space-y-4 text-xs">
                
                {/* File picker */}
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">File Asset</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer relative dark:border-slate-800">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <span className="text-[10px] font-semibold text-slate-500">
                      {file ? file.name : 'Click or Drag blueprint to upload'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. Avionics, LCA, Radar"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  {uploading ? 'Vaulting File...' : 'Deposit Document'}
                </button>
              </form>
            </div>
          )}

          {/* Preview panel */}
          {selectedDoc ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 space-y-4">
              
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Document Specs</span>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white mt-0.5 truncate max-w-[200px]">{selectedDoc.name}</h3>
                </div>
                <a
                  href={`/api/documents/download/${selectedDoc.path}?auth_token=${token}`}
                  download={selectedDoc.name}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/60 dark:bg-slate-900/60 dark:border-slate-800 dark:text-sky-400"
                >
                  <Download className="h-4.5 w-4.5" />
                </a>
              </div>

              {/* Data specifications */}
              <div className="space-y-4 text-xs text-slate-600 dark:text-slate-350">
                
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">Index Tags</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedDoc.tags?.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-650 rounded border border-slate-200/50 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400">
                        <Tag className="h-3 w-3 text-sky-400" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* File Preview block */}
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">Vault File Preview</span>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-[10px] text-sky-300 h-40 overflow-y-auto leading-relaxed whitespace-pre-wrap select-text">
                    {loadingPreview ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"></div>
                      </div>
                    ) : (
                      previewContent
                    )}
                  </div>
                </div>

                {/* Document History timeline */}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-450 uppercase text-[9px] border-b border-slate-100 pb-2 dark:border-slate-800">
                    <History className="h-4 w-4 text-sky-400" />
                    <span>Version Audit Trail</span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {selectedDoc.history?.map((h, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[10px]">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">v{h.version}</span>
                          <p className="text-slate-500 mt-0.5">{h.uploader.split(' ')[0]}</p>
                        </div>
                        <span className="text-slate-400 font-mono">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            !showUpload && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
                <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 leading-normal font-light">Select a blueprint from the repository vault grid to decode parameters, view versions history, or preview text contents.</p>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}
