'use client';

import { Icon } from '@/components/admin/Icon';
import { useState, useMemo, useRef } from 'react';
import { Template } from '@/lib/types/templates';
import { useTemplates } from '@/hooks/useTemplates';
import { useCategories } from '@/hooks/useCategories';
import { CategoryDropdown } from '@/components/admin/CategoryDropdown';
import { toProxyMediaUrl } from '@/lib/mediaUrl';

export default function TemplateGallery() {
    const { templates, isLoading, error, createTemplate, updateTemplate, deleteTemplate } = useTemplates('preset');
    const { categories, isLoading: categoriesLoading } = useCategories('preset');
    const [filterCategory, setFilterCategory] = useState('Все');
    const [searchQuery, setSearchQuery] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    
    const [formData, setFormData] = useState<Partial<Template>>({});
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(prev => ({ ...prev, image: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(prev => ({ ...prev, video: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesCategory = filterCategory === 'Все' || t.category === filterCategory;
            const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [templates, filterCategory, searchQuery]);

    const handleOpenForm = (template?: Template) => {
        if (template) {
            setEditingTemplate(template);
            setFormData(template);
        } else {
            setEditingTemplate(null);
            setFormData({
                title: '',
                description: '',
                category: categories[0] ?? 'face',
                status: 'active',
                
                prompt: '',
                negativePrompt: '',
                video: undefined
            });
        }
        setIsFormOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(prev => ({ ...prev, image: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTemplate(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            title: formData.title ?? '',
            description: formData.description ?? '',
            prompt: formData.description ?? '',
            category: formData.category ?? categories[0] ?? 'face',
            status: formData.status ?? 'active',
            image: formData.image,
            video: formData.video,
            negativePrompt: formData.negativePrompt ?? '',
        };
        if (editingTemplate) {
            const ok = await updateTemplate(editingTemplate.id, payload);
            if (ok) handleCloseForm();
        } else {
            const created = await createTemplate(payload);
            if (created) handleCloseForm();
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) return;
        await deleteTemplate(id);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'test': return 'bg-amber-500';
            case 'hidden': return 'bg-slate-500';
            default: return 'bg-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Активен';
            case 'test': return 'Тест';
            case 'hidden': return 'Скрыт';
            default: return status;
        }
    };

    if (isFormOpen) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <button onClick={handleCloseForm} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium text-sm">
                    <Icon name="arrow_back" size={14} /> Назад к галерее
                </button>

                <div>
                    <div className="flex items-center gap-3 mb-6 md:mb-8">
                        <div className="w-8 md:w-10 h-1 bg-primary rounded-full"></div>
                        <h3 className="text-xl md:text-2xl font-black">{editingTemplate ? 'Редактирование шаблона' : 'Настройка нового шаблона'}</h3>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6 md:space-y-8 bg-white dark:bg-surface-dark p-5 md:p-10 rounded-2xl border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-5 md:space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Название шаблона</label>
                                    <input
                                        required
                                        value={formData.title || ''}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3"
                                        placeholder="e.g. Premium Welcome"
                                        type="text"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Категория</label>
                                    <CategoryDropdown
                                        value={formData.category ?? ''}
                                        options={categories}
                                        onChange={(val) => setFormData({ ...formData, category: val })}
                                        placeholder="Выберите категорию"
                                        className="w-full"
                                        disabled={categoriesLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Превью</label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-border-dark rounded-xl p-6 md:p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors text-center"
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                                            ) : (
                                                <>
                                                    <Icon name="upload_file" size={40} className="text-slate-400 mb-2" />
                                                    <p className="text-xs md:text-sm text-slate-500">Нажмите для загрузки изображения</p>
                                                </>
                                            )}
                                        </div>
                                        {formData.image && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: undefined })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Видео-превью</label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => videoFileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-border-dark rounded-xl p-4 md:p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-primary/5 cursor-pointer hover:border-primary/50 transition-colors text-center"
                                        >
                                            <input
                                                ref={videoFileInputRef}
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoChange}
                                                className="hidden"
                                            />
                                            {formData.video ? (
                                                <video src={formData.video} className="max-h-32 rounded-lg" controls muted />
                                            ) : (
                                                <>
                                                    <Icon name="videocam" size={32} className="text-slate-400 mb-2" />
                                                    <p className="text-xs md:text-sm text-slate-500">Загрузить видео-превью (необязательно)</p>
                                                </>
                                            )}
                                        </div>
                                        {formData.video && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, video: undefined })); if (videoFileInputRef.current) videoFileInputRef.current.value = ''; }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors shadow-md"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-3 md:mb-4 text-slate-700 dark:text-slate-300">Статус</label>
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                        {['active', 'test', 'hidden'].map(status => (
                                            <label key={status} className="relative flex items-center cursor-pointer">
                                                <input
                                                    checked={formData.status === status}
                                                    onChange={() => setFormData({ ...formData, status: status as Template['status'] })}
                                                    className="sr-only peer"
                                                    name="status"
                                                    type="radio"
                                                    value={status}
                                                />
                                                <div className={`px-3 md:px-4 py-2 bg-slate-100 dark:bg-primary/10 rounded-lg border border-transparent text-xs font-bold transition-all
                                                    ${status === 'active' ? 'peer-checked:bg-emerald-500/10 peer-checked:text-emerald-500 peer-checked:border-emerald-500/50' : ''}
                                                    ${status === 'test' ? 'peer-checked:bg-amber-500/10 peer-checked:text-amber-500 peer-checked:border-amber-500/50' : ''}
                                                    ${status === 'hidden' ? 'peer-checked:bg-slate-500/10 peer-checked:text-slate-500 peer-checked:border-slate-500/50' : ''}
                                                `}>
                                                    {status === 'active' ? 'Active' : status === 'test' ? 'Testing' : 'Hidden'}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-5 md:space-y-6">
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Описание шаблона</label>
                                    <textarea
                                        required
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3 md:p-4 resize-none"
                                        placeholder="Опишите базовый промпт шаблона. Для пользовательского уточнения вставьте {additional_text}."
                                        rows={5}
                                    ></textarea>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const current = formData.description || '';
                                            const hasTag = current.includes('{additional_text}');
                                            if (!hasTag) {
                                                setFormData(prev => ({ ...prev, description: current + (current.endsWith(' ') || !current ? '' : ' ') + '{additional_text}' }));
                                            }
                                        }}
                                        className="mt-2 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        + Вставить {'{additional_text}'}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Негативный промпт</label>
                                    <textarea
                                        value={formData.negativePrompt || ''}
                                        onChange={e => setFormData({ ...formData, negativePrompt: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-border-dark rounded-xl focus:ring-primary focus:border-primary text-sm p-3 md:p-4 resize-none"
                                        placeholder="Avoid mentioning prices, don't use emojis..."
                                        rows={4}
                                    ></textarea>
                                </div>
                                <div className="pt-4 md:pt-6 flex gap-3 md:gap-4">
                                    <button onClick={handleCloseForm} className="flex-1 py-2.5 md:py-3 bg-slate-200 dark:bg-primary/10 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-primary/20 transition-colors text-sm md:text-base" type="button">Отменить</button>
                                    <button className="flex-1 py-2.5 md:py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 text-sm md:text-base" type="submit">Сохранить</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (isLoading && templates.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Icon name="autorenew" size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm">
                    {error}
                </div>
            )}
            {/* Search — visible on all screens */}
            <div className="relative">
                <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    className="w-full md:w-72 lg:w-80 pl-9 pr-4 py-2 bg-slate-100 dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Поиск шаблонов..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Управляйте, организуйте и развертывайте шаблоны ответов.</p>
                <button onClick={() => handleOpenForm()} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 text-sm md:text-base w-full sm:w-auto">
                    <Icon name="add" size={16} /> Новый шаблон
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex overflow-x-auto scrollbar-thin items-center gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:flex-wrap w-full md:w-auto">
                    <button className="shrink-0 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs md:text-sm font-semibold">
                        <Icon name="tune" size={14} /> Фильтр
                    </button>
                    <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-border-dark mx-1"></div>
                    {['Все', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-surface-dark text-slate-600 dark:text-slate-300 hover:bg-primary/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                    <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider">Сортировка:</span>
                    <select className="bg-transparent border-none text-xs md:text-sm font-medium focus:ring-0 text-slate-700 dark:text-slate-200 py-0 pl-0 pr-6">
                        <option>Недавно измененные</option>
                        <option>По алфавиту</option>
                        <option>По статусу</option>
                    </select>
                </div>
            </div>

            {/* Grid Gallery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredTemplates.map(template => (
                    <div key={template.id} className="group bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden hover:border-primary/40 transition-all hover:shadow-xl flex flex-col">
                        <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-primary/20">
                            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-slate-900/60 z-10 transition-opacity group-hover:opacity-100"></div>
                            {template.video ? (
                                <video className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={toProxyMediaUrl(template.video)} muted loop playsInline onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseOut={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                            ) : template.image ? (
                                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={toProxyMediaUrl(template.image)} alt={template.title} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700" />
                            )}
                            <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20">
                                <span className={`${getStatusColor(template.status)} text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
                                    {getStatusLabel(template.status)}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 md:p-5 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-1 md:mb-2">
                                <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-1">{template.title}</h3>
                                <button className="text-slate-400 hover:text-primary -mr-2">
                                    <Icon name="more_vert" size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 md:mb-4 line-clamp-2 flex-1">{template.description}</p>
                            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100 dark:border-border-dark mt-auto">
                                <span className="text-[10px] md:text-xs bg-slate-100 dark:bg-primary/10 px-2 py-1 rounded text-slate-600 dark:text-slate-400 uppercase font-bold tracking-tighter truncate max-w-[50%]">{template.category}</span>
                                <div className="flex gap-1 md:gap-2">
                                    <button onClick={() => handleOpenForm(template)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"><Icon name="edit" size={16} /></button>
                                    <button onClick={(e) => handleDelete(template.id, e)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Icon name="delete" size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card Placeholder */}
                <div onClick={() => handleOpenForm()} className="border-2 border-dashed border-slate-300 dark:border-border-dark rounded-xl flex flex-col items-center justify-center p-6 md:p-8 hover:bg-primary/5 transition-colors cursor-pointer group min-h-[200px]">
                    <div className="size-10 md:size-12 rounded-full bg-slate-100 dark:bg-primary/10 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/20 transition-all mb-3 md:mb-4">
                        <Icon name="add" size={28} />
                    </div>
                    <p className="font-bold text-sm md:text-base text-slate-500 dark:text-slate-400 group-hover:text-primary">Создать шаблон</p>
                </div>
            </div>
        </div>
    );
}
