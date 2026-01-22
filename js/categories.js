/**
 * Categories Manager
 * Auto-categorizes meditations based on filename keywords
 */

const CategoryManager = {
    // Category definitions with keywords and icons
    categories: {
        'calls-meetings': {
            name: 'Calls & Meetings',
            keywords: ['call', 'cold-call', 'phone', 'demo', 'meeting', 'negotiation', 'pitch', 'sales-call', 'client-call', 'prospect'],
            icon: '📞',
            color: '#3b82f6'
        },
        'public-speaking': {
            name: 'Public Speaking',
            keywords: ['presentation', 'speaking', 'speech', 'conference', 'keynote', 'networking', 'stage', 'audience', 'public'],
            icon: '🎤',
            color: '#8b5cf6'
        },
        'confidence-presence': {
            name: 'Confidence & Presence',
            keywords: ['confidence', 'presence', 'body-language', 'self-image', 'charisma', 'power', 'authority', 'assertive', 'leadership'],
            icon: '⚡',
            color: '#f59e0b'
        },
        'daily-practice': {
            name: 'Daily Practice',
            keywords: ['morning', 'daily', 'routine', 'mindset', 'visualization', 'practice', 'general', 'foundation', 'basics'],
            icon: '🌅',
            color: '#10b981'
        }
    },

    /**
     * Categorize a meditation based on its filename
     */
    categorize(filename) {
        const lowerFilename = filename.toLowerCase();

        // Check each category for keyword matches
        for (const [categoryId, category] of Object.entries(this.categories)) {
            for (const keyword of category.keywords) {
                if (lowerFilename.includes(keyword)) {
                    return {
                        id: categoryId,
                        name: category.name,
                        icon: category.icon,
                        color: category.color
                    };
                }
            }
        }

        // Default category if no match
        return {
            id: 'uncategorized',
            name: 'Uncategorized',
            icon: '🎯',
            color: '#64748b'
        };
    },

    /**
     * Get category display name
     */
    getCategoryName(categoryId) {
        return this.categories[categoryId]?.name || 'Uncategorized';
    },

    /**
     * Get category icon
     */
    getCategoryIcon(categoryId) {
        return this.categories[categoryId]?.icon || '🎯';
    },

    /**
     * Get category color
     */
    getCategoryColor(categoryId) {
        return this.categories[categoryId]?.color || '#64748b';
    },

    /**
     * Get all categories
     */
    getAllCategories() {
        return Object.entries(this.categories).map(([id, category]) => ({
            id,
            name: category.name,
            icon: category.icon,
            color: category.color
        }));
    },

    /**
     * Format filename to readable title
     */
    formatTitle(filename) {
        // Remove extension
        let title = filename.replace(/\.[^/.]+$/, '');

        // Replace hyphens and underscores with spaces
        title = title.replace(/[-_]/g, ' ');

        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, char => char.toUpperCase());

        return title;
    },

    /**
     * Group meditations by category
     */
    groupByCategory(meditations) {
        const grouped = {};

        meditations.forEach(meditation => {
            const categoryId = meditation.category.id;

            if (!grouped[categoryId]) {
                grouped[categoryId] = {
                    category: meditation.category,
                    meditations: []
                };
            }

            grouped[categoryId].meditations.push(meditation);
        });

        // Sort categories by predefined order
        const categoryOrder = ['calls-meetings', 'public-speaking', 'confidence-presence', 'daily-practice', 'uncategorized'];
        const sortedGrouped = {};

        categoryOrder.forEach(categoryId => {
            if (grouped[categoryId]) {
                sortedGrouped[categoryId] = grouped[categoryId];
            }
        });

        // Add any remaining categories not in the predefined order
        Object.keys(grouped).forEach(categoryId => {
            if (!sortedGrouped[categoryId]) {
                sortedGrouped[categoryId] = grouped[categoryId];
            }
        });

        return sortedGrouped;
    }
};

// Make it globally available
window.CategoryManager = CategoryManager;
