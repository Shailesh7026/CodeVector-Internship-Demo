import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-hot-toast';
import { deleteProduct } from '../api/productsApi';

const ProductCard = ({ product, onDelete }) => {
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully!');
      onDelete?.(product.id);
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleAddToCart = async () => {
    try {
      // TODO: Implement cart functionality
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message || 'Failed to add item to cart');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="bg-gray-100 h-48 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm">Product Image</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">
          {product.name}
        </h3>

        <div className="text-sm text-gray-500 mb-2">
          Category: {product.category}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm"
          >
            Add to Cart
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
          >
            Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;