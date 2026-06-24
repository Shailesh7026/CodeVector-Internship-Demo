import axiosClient from './axiosClient';

export const getProducts = async ({
  limit = 8,
  categories,
  minPrice,
  maxPrice,
  search,
  cursor = null
} = {}) => {
  try {
    const params = {
      limit,
      ...(cursor && { cursor }),
      ...(categories && { categories: Array.isArray(categories) ? categories.join(',') : categories }),
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice }),
      ...(search && { search })
    };

    const response = await axiosClient.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
};

export const getCategories = async () => {
  try {
    // Don't have api for categories yet send static data
    const categories = [
  "Electronics",
  "Books",
  "Clothing",
  "Sports",
  "Home"
];
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch categories');
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await axiosClient.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Failed to add product:', error);
    throw new Error(error.response?.data?.message || 'Failed to add product');
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete product with id ${id}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};