'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import toast from 'react-hot-toast';
import {
  FolderOpen, FileText, Film, Image, File, Table2, Search, Plus, Trash2,
  X, Upload, Download, Globe, Lock, Tag, Folder, Grid3X3, List, ExternalLink
} from 'lucide-react';

const FILE_TYPES = [
  { value: 'pdf',         label: 'PDF',        icon: FileText, color: 'bg-red-500',    iconColor: 'text-red-500' },
  { value: 'video',       label: 'Video',      icon: Film,     color: 'bg-purple-500', iconColor: 'text-purple-500' },
  { value: 'image',       label: 'Ảnh',        icon: Image,    color: 'bg-blue-500',   iconColor: 'text-blue-500' },
  { value: 'doc',         label: 'Tài liệu',   icon: File,     color: 'bg-indigo-500', iconColor: 'text-indigo-500' },
  { value: 'spreadsheet', label: 'Bảng tính',  icon: Table2,   color: 'bg-green-500',  iconColor: 'text-green-500' },
  { value: 'other',       label: 'Khác',       icon: File,     color: 'bg-gray-500',   iconColor: 'text-gray-500' },
] as const;
type FileTypeValue = typeof FILE_TYPES[number]['value'];

interface Document {
  id: string; title: string; description?: string; fileName: string;
  fileUrl: string; fileType: string; fileSize?: number; folder?: string;
  tags: string[]; isPublic: boolean; createdAt: string;
}

const fmtSize = (bytes?: number) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function FileIcon({ type, size = 'md' }: { type: string; size?: 'sm' | 'md' | 'lg' }) {
  const ft = FILE_TYPES.find(f => f.value === type) ?? FILE_TYPES[FILE_TYPES.length - 1];
  const Icon = ft.icon;
  const s = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5';
  return <Icon className={`${s} ${ft.iconColor}`} />;
}

function DocCard({ doc, onDelete }: { doc: Document; onDelete: (id: string) => void }) {
  const ft = FILE_TYPES.find(f => f.value === doc.fileType);
  const Icon = ft?.icon ?? File;
  return (
    <div className="card p-4 hover:shadow-md transition-all duration-200 group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${ft?.color ?? 'bg-gray-500'} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => onDelete(doc.id)}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug flex-1 mb-2">
        {doc.title}
      </h3>
      {doc.description && (
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{doc.description}</p>
      )}

      <div className="mt-auto space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {doc.folder && (
            <span className="flex items-center gap-1">
              <Folder className="w-3 h-3" />{doc.folder}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            {fmtSize(doc.fileSize)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {doc.tags.slice(0, 2).map(t => (
              <span key={t} className="inline-flex items-center gap-0.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                <Tag className="w-2.5 h-2.5" />{t}
              </span>
            ))}
          </div>
          <span title={doc.isPublic ? 'Công khai' : 'Riêng tư'}>
            {doc.isPublic
              ? <Globe className="w-3.5 h-3.5 text-green-500" aria-label="Công khai" />
              : <Lock className="w-3.5 h-3.5 text-gray-400" aria-label="Riêng tư" />}
          </span>
        </div>
      </div>
    </div>
  );
}

function AddDocModal({ onClose, folders }: { onClose: () => void; folders: string[] }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', fileName: '', fileUrl: '',
    fileType: 'pdf' as FileTypeValue, fileSize: '',
    folder: '', newFolder: '', tags: '', isPublic: false,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/documents', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Đã thêm tài liệu');
      onClose();
    },
    onError: () => toast.error('Thêm thất bại'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.fileUrl.trim() || !form.fileName.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    mutation.mutate({
      title: form.title,
      description: form.description || undefined,
      fileName: form.fileName,
      fileUrl: form.fileUrl,
      fileType: form.fileType,
      fileSize: form.fileSize ? parseInt(form.fileSize) : undefined,
      folder: (form.newFolder || form.folder) || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      isPublic: form.isPublic,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="card w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-700">
          <h2 className="font-bold flex items-center gap-2"><Upload className="w-4 h-4 text-blue-500" /> Thêm tài liệu</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Tiêu đề *</label>
            <input className="input" placeholder="Tên tài liệu" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tên file *</label>
              <input className="input" placeholder="document.pdf" value={form.fileName}
                onChange={e => setForm(f => ({ ...f, fileName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Loại file</label>
              <select className="input" value={form.fileType}
                onChange={e => setForm(f => ({ ...f, fileType: e.target.value as FileTypeValue }))}>
                {FILE_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">URL file *</label>
            <input className="input" placeholder="https://..." value={form.fileUrl}
              onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Thư mục</label>
              <select className="input" value={form.folder} onChange={e => setForm(f => ({ ...f, folder: e.target.value, newFolder: '' }))}>
                <option value="">-- Chọn thư mục --</option>
                {folders.map(f => <option key={f}>{f}</option>)}
                <option value="__new__">+ Tạo thư mục mới</option>
              </select>
              {form.folder === '__new__' && (
                <input className="input mt-2" placeholder="Tên thư mục mới" value={form.newFolder}
                  onChange={e => setForm(f => ({ ...f, newFolder: e.target.value }))} />
              )}
            </div>
            <div>
              <label className="label">Kích thước (bytes)</label>
              <input type="number" className="input" placeholder="1024000" value={form.fileSize}
                onChange={e => setForm(f => ({ ...f, fileSize: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Mô tả</label>
            <textarea className="input resize-none h-16" placeholder="Mô tả tài liệu..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="label">Tags (phân cách bằng dấu phẩy)</label>
            <input className="input" placeholder="ccna, networking, ospf" value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" checked={form.isPublic}
              onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
            <span className="text-sm text-gray-600 dark:text-gray-400">Công khai (ai cũng có thể xem)</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Hủy</button>
            <button type="submit" disabled={mutation.isPending} className="btn btn-primary flex-1">
              {mutation.isPending ? 'Đang lưu...' : 'Thêm tài liệu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string>('');
  const [activeFolder, setActiveFolder] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { if (!user) router.push('/auth/login'); }, [user, router]);

  const { data: docs = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', activeType, activeFolder, search],
    queryFn: () => api.get('/documents', {
      params: {
        ...(activeType   ? { type: activeType }     : {}),
        ...(activeFolder ? { folder: activeFolder } : {}),
        ...(search       ? { q: search }            : {}),
      }
    }).then(r => r.data),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['documents'] }); toast.success('Đã xóa'); },
    onError: () => toast.error('Xóa thất bại'),
  });

  if (!user) return null;

  // Derive folders from all docs (use separate query without filters)
  const allDocs = docs;
  const folders = Array.from(new Set(allDocs.map(d => d.folder).filter(Boolean))) as string[];

  const typeCounts = FILE_TYPES.map(ft => ({
    ...ft, count: allDocs.filter(d => d.fileType === ft.value).length,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">

          {/* Left sidebar */}
          <aside className="w-52 shrink-0 border-r bg-white dark:bg-gray-800 flex flex-col overflow-y-auto">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Thư mục</h2>
              <button
                onClick={() => setActiveFolder('')}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                  !activeFolder ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                <FolderOpen className="w-4 h-4" />
                Tất cả
              </button>
              {folders.map(f => (
                <button key={f}
                  onClick={() => setActiveFolder(f === activeFolder ? '' : f)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                    activeFolder === f ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{f}</span>
                </button>
              ))}
            </div>

            <div className="p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Loại file</h2>
              <button
                onClick={() => setActiveType('')}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                  !activeType ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                <File className="w-4 h-4" />
                Tất cả loại
              </button>
              {typeCounts.filter(t => t.count > 0 || !activeType).map(ft => (
                <button key={ft.value}
                  onClick={() => setActiveType(ft.value === activeType ? '' : ft.value)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition ${
                    activeType === ft.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}>
                  <ft.icon className={`w-4 h-4 ${ft.iconColor}`} />
                  <span className="flex-1 text-left">{ft.label}</span>
                  {ft.count > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-full">{ft.count}</span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-3 flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="input pl-9 h-9 text-sm"
                  placeholder="Tìm kiếm tài liệu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button onClick={() => setShowAdd(true)} className="btn btn-primary gap-2 text-sm h-9">
                <Plus className="w-4 h-4" /> Thêm tài liệu
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                <FolderOpen className="w-4 h-4" />
                <span>Tài liệu</span>
                {activeFolder && <><span>/</span><span className="text-gray-800 dark:text-gray-200 font-medium">{activeFolder}</span></>}
                {activeType && <><span>·</span><span className="text-blue-600">{FILE_TYPES.find(f => f.value === activeType)?.label}</span></>}
                <span className="ml-auto text-xs text-gray-400">{docs.length} tài liệu</span>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="card h-44 animate-pulse bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <FolderOpen className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium">Chưa có tài liệu nào</p>
                  <p className="text-sm mt-1">Nhấn nút "Thêm tài liệu" để bắt đầu</p>
                  <button onClick={() => setShowAdd(true)} className="btn btn-primary gap-2 mt-4 text-sm">
                    <Plus className="w-4 h-4" /> Thêm ngay
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {docs.map(d => <DocCard key={d.id} doc={d} onDelete={id => deleteMutation.mutate(id)} />)}
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Tên</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Thư mục</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Kích thước</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider hidden lg:table-cell">Ngày thêm</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {docs.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <FileIcon type={d.fileType} />
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{d.title}</p>
                                <p className="text-xs text-gray-400">{d.fileName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                            {d.folder ?? <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{fmtSize(d.fileSize)}</td>
                          <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                            {new Date(d.createdAt).toLocaleDateString('vi')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition">
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button onClick={() => deleteMutation.mutate(d.id)}
                                className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showAdd && <AddDocModal onClose={() => setShowAdd(false)} folders={folders} />}
    </div>
  );
}
