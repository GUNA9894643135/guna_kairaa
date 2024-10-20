import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Link } from 'react-router-dom';
import { toast } from "react-hot-toast";
import './dashboard.css';


export default function Dashboard() {
  const [productResponse, setProductResponse] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedRatings, setSelectedRatings] = useState({
    fourStars: false,
    fiveStars: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://fakestoreapi.com/products");
        setProductResponse(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const uniqueCategories = [...new Set(productResponse.map(product => product.category))];
    setCategories(uniqueCategories);
  }, [productResponse]);

  useEffect(() => {
    filterProducts(selectedCategory, maxPrice, selectedRatings);
  }, [searchTerm]);

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
    filterProducts(category, maxPrice, selectedRatings);
  };

  const handlePriceChange = (event) => {
    const price = Number(event.target.value);
    setMaxPrice(price);
    filterProducts(selectedCategory, price, selectedRatings);
  };

  const handleRatingChange = (event) => {
    const { name, checked } = event.target;
    setSelectedRatings((prev) => ({
      ...prev,
      [name]: checked,
    }));
    filterProducts(selectedCategory, maxPrice, { ...selectedRatings, [name]: checked });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filterProducts = (category, maxPrice, ratings) => {
    const filtered = productResponse.filter(product => {
      const inCategory = category ? product.category === category : true;
      const inPriceRange = product.price <= maxPrice;
      const inRatingRange = (ratings.fourStars && product.rating.rate >= 4) || 
                            (ratings.fiveStars && product.rating.rate === 5) || 
                            (!ratings.fourStars && !ratings.fiveStars);
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());

      return inCategory && inPriceRange && inRatingRange && matchesSearch;
    });
    setFilteredProducts(filtered);
    setCurrentPage(1); 
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  const addToCart = (product) => {
    setCart((prevCart) => [...prevCart, product]);
    toast.success(`${product.title} has been added to your cart!`);
  };

  return (
    <div className="container">
    <div className="row">
      <nav className="col-md-3">
        <h4 className="text-primary">Filters</h4>
        <h5>Category</h5>
        <select 
          className="form-select mb-3" 
          value={selectedCategory} 
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <hr />
        <h5>Price Range</h5>
        <input 
          type="range" 
          min="0" 
          max="1000" 
          step="10" 
          value={maxPrice} 
          onChange={handlePriceChange} 
          className="form-range mb-3"
        />
        <div>
          <span>Selected Max Price: ${maxPrice}</span>
        </div>
        <hr />
        <div><b>Search Products</b></div>
        <input 
          type="text" 
          placeholder="Search Products..." 
          value={searchTerm} 
          onChange={handleSearchChange} 
          className="form-control mb-3" 
        />
        <hr />
        <h5>Ratings</h5>
        <div>
          <input 
            type="checkbox" 
            name="fourStars" 
            checked={selectedRatings.fourStars} 
            onChange={handleRatingChange} 
          />
          <label> 4 Stars & above</label>
        </div>
        <div>
          <input 
            type="checkbox" 
            name="fiveStars" 
            checked={selectedRatings.fiveStars} 
            onChange={handleRatingChange} 
          />
          <label> 3 Stars & above</label>
        </div>
      </nav>

      <main className="col-md-9">
        <h2 className="my-4">Product Dashboard</h2>
        <div className="product-list">
          {currentProducts.map(product => (
            <div key={product.id} className="product-row d-flex align-items-center mb-4">
              <img 
                src={product.image} 
                alt={product.title} 
                style={{ width: '200px', height: '200px', objectFit: 'contain', marginRight: '20px' }} 
              />
              <div className="product-details flex-grow-1">
                <h5 className="product-title">{product.title}</h5>
                <ul className="list-unstyled">
                  <li><strong>Rating:</strong> {product.rating.rate} ({product.rating.count} reviews)</li>
                  <br />
                  <li><strong>Brand:</strong> {product.category || 'Unknown Brand'}</li>
                  <li>{product.description}</li>
                </ul>
                <hr />
              </div>
              <div className="product-actions text-right">
                <span className="h3">${product.price}</span>
                <div>
                  <Link to={`/product/${product.id}`} className="btn btn-info btn-sm">View</Link>
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
          <hr />
        </div>

        
          <ul className="pagination justify-content-center">
            {pageNumbers.map(number => (
              <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                <button onClick={() => paginate(number)} className="page-link">
                  {number}
                </button>
              </li>
            ))}
          </ul>
      
      </main>
    </div>
  </div>
  );
}
