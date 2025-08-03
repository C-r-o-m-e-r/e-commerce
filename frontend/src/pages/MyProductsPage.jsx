// frontend/src/pages/MyProductsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import './MyProductsPage.css'; // Створимо цей файл для стилів

const MyProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'SELLER') {
      navigate('/'); // Якщо не продавець, перенаправляємо на головну
      return;
    }

    const fetchMyProducts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/products/seller/my-products', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [token, user, navigate]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:3000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Оновлюємо список товарів, видаливши видалений
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading your products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="my-products-container">
      <h2>My Products</h2>
      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="product-card-manage">
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="product-price">${product.price}</p>
              </div>
              <div className="product-actions">
                <Link to={`/products/edit/${product.id}`} className="btn btn-edit">Edit</Link>
                <button onClick={() => handleDelete(product.id)} className="btn btn-delete">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p>You haven't added any products yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyProductsPage;