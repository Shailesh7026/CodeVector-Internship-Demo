import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, getCategories } from '../api/productsApi';
import ProductCard from '../components/ProductCard';
import Filters from '../components/Filters';
import Loader from '../components/Loader';
import AddProductModal from '../components/AddProductModal';
import useResponsive from '../hooks/useResponsive';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const limit = 20;
    const { isMobile } = useResponsive();
    const cursorCacheRef = useRef({});

    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Reset products when filters/search params change
    useEffect(() => {
        setProducts([]);
        setTotalCount(0);
        setCurrentPage(1);
        cursorCacheRef.current = {};
    }, [category, searchParams.toString(), search]);

    // Fetch products for current page
    useEffect(() => {
        let isMounted = true;
        const fetchProductsForPage = async () => {
            try {
                setLoading(true);

                // Build cache key for this filter combination
                const cacheKey = `${category}_${search}_${searchParams.get('minPrice')}_${searchParams.get('maxPrice')}`;
                
                // If we already have this page cached, use it
                if (cursorCacheRef.current[cacheKey]?.[currentPage]) {
                    const cachedData = cursorCacheRef.current[cacheKey][currentPage];
                    if (isMounted) {
                        setProducts(cachedData.products);
                        setTotalCount(cachedData.total);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setLoading(false);
                    }
                    return;
                }

                // Determine cursor for this page
                let cursor = null;
                if (currentPage > 1 && cursorCacheRef.current[cacheKey]?.[currentPage - 1]?.nextCursor) {
                    cursor = cursorCacheRef.current[cacheKey][currentPage - 1].nextCursor;
                }

                const data = await getProducts({
                    cursor,
                    limit,
                    categories: category,
                    minPrice: searchParams.get('minPrice'),
                    maxPrice: searchParams.get('maxPrice'),
                    search: search
                });

                if (!isMounted) return;

                // Cache this page's data
                if (!cursorCacheRef.current[cacheKey]) {
                    cursorCacheRef.current[cacheKey] = {};
                }
                cursorCacheRef.current[cacheKey][currentPage] = {
                    products: data.products || [],
                    total: data.pagination?.total || 0,
                    nextCursor: data.pagination?.nextCursor || null
                };

                setProducts(data.products || []);
                setTotalCount(data.pagination?.total || 0);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProductsForPage();
        
        return () => {
            isMounted = false;
        };
    }, [currentPage, category, searchParams.toString(), search]);

    const filteredProducts = Array.isArray(products) ? products : [];
    const totalPages = Math.ceil(totalCount / limit);

    const handleFilterChange = ({ type, value }) => {
        // Handle filter changes here
        // console.log(type, value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleProductDeleted = (deletedProductId) => {
        // Remove the deleted product from the list
        setProducts(prev => prev.filter(p => p.id !== deletedProductId));
        setTotalCount(prev => Math.max(0, prev - 1));
    };

    const handleAddProductSuccess = () => {
        // Reset to first page to see newly added products
        setCurrentPage(1);
        cursorCacheRef.current = {};
    };

    const renderPaginationButtons = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
        );

        // First page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="gap1" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 rounded-md border ${
                        currentPage === i
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="gap2" className="px-2 py-2 text-gray-500">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    {totalPages}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        );

        return pages;
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
                {/* Filters - Desktop */}
                <div className="hidden md:block w-64">
                    <Filters
                        categories={categories}
                        onFilterChange={handleFilterChange}
                    />
                </div>

                {/* Mobile Filter Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="fixed bottom-4 right-4 z-10 bg-primary text-white p-4 rounded-full shadow-lg"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                    </button>
                </div>

                {/* Products Header */}
                <div className="flex-1">
                    <div className="mb-6 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">{category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}</h1>
                        <button
                            onClick={() => setIsAddProductOpen(true)}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Product
                        </button>
                    </div>

                    {/* Products Info */}
                    <div className="mb-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {totalCount > 0 && (
                                <p>
                                    Showing <span className="font-semibold">{(currentPage - 1) * limit + 1}</span> to{' '}
                                    <span className="font-semibold">{Math.min(currentPage * limit, totalCount)}</span> of{' '}
                                    <span className="font-semibold">{totalCount}</span> products
                                </p>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg text-gray-600">No products found</h3>
                        </div>
                    ) : (
                        <>
                            {/* Products Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ProductCard product={product} onDelete={handleProductDeleted} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center py-8">
                                    <nav className="flex gap-2 flex-wrap justify-center">
                                        {renderPaginationButtons()}
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            {/* Mobile Filters Drawer */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        key="filter-container"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed left-0 top-0 h-full w-full"
                    >
                        <div 
                            className="absolute inset-0 bg-black opacity-50"
                            onClick={() => setIsFilterOpen(false)}
                        />
                        <div className="relative w-80 h-full bg-white z-50 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Filters</h2>
                                <button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <Filters
                                categories={categories}
                                onFilterChange={handleFilterChange}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddProductOpen}
                onClose={() => setIsAddProductOpen(false)}
                onSuccess={handleAddProductSuccess}
                categories={categories}
            />
        </div>
    );
};

export default Products;