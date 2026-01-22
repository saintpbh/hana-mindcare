'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Star, X } from 'lucide-react';
import { getTemplates, incrementTemplateUsage } from '@/app/actions/templates';
import { cn } from '@/lib/utils';

interface Template {
    id: string;
    type: string;
    name: string;
    category: string | null;
    content: any;
    isFavorite: boolean;
    usageCount: number;
}

interface TemplateSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
    type: 'soap_note' | 'prescription' | 'quick_note';
    userId: string;
}

export function TemplateSelectModal({
    isOpen,
    onClose,
    onSelect,
    type,
    userId
}: TemplateSelectModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [category, setCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen, type, category]);

    const loadTemplates = async () => {
        setIsLoading(true);
        const result = await getTemplates(userId, type, category);
        if (result.success && result.data) {
            setTemplates(result.data as Template[]);
        }
        setIsLoading(false);
    };

    const handleSelect = async (template: Template) => {
        await incrementTemplateUsage(template.id);
    on Select(template);
        onClose();
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 카테고리 목록
    const categories = [
        { value: 'all', label: '전체' },
        { value: 'anxiety', label: '불안' },
        { value: 'depression', label: '우울' },
        { value: 'stress', label: '스트레스' },
        { value: 'trauma', label: '트라우마' },
        { value: 'relationship', label: '대인관계' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">템플릿 선택</DialogTitle>
                </DialogHeader>

                {/* Search and Category Filter */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="템플릿 검색..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category Pills */}
                    <div className="flex gap-2 flex-wrap">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    category === cat.value
                                        ? "bg-[var(--color-midnight-navy)] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="overflow-y-auto max-h-[400px] pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-[var(--color-midnight-navy)] border-t-transparent rounded-full" />
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>템플릿이 없습니다</p>
                            <p className="text-sm mt-2">새 템플릿을 만들어보세요</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {filteredTemplates.map((template) => (
                                <TemplateCard
                                    key={template.id}
                                    template={template}
                                    onSelect={() => handleSelect(template)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TemplateCard({ template, onSelect }: { template: Template; onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className="p-4 border border-gray-200 rounded-xl hover:border-[var(--color-midnight-navy)] hover:shadow-md transition-all text-left group"
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-[var(--color-midnight-navy)] group-hover:text-[var(--color-champagne-gold)] transition-colors">
                    {template.name}
                </h4>
                {template.isFavorite && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
            </div>

            {template.category && (
                <span className="inline-block text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mb-2">
                    {template.category}
                </span>
            )}

            <p className="text-xs text-gray-500">
                사용 {template.usageCount}회
            </p>
        </button>
    );
}
