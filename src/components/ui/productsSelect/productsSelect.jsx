import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { listDrinks } from "@/graphql/queries";
import { generateClient } from "aws-amplify/api";

const ProductSelect = ({ value, onChange }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const client = generateClient();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const listAllDrinksResponse = await client.graphql({
          query: listDrinks,
        });

        setProducts(listAllDrinksResponse.data.listDrinks.items);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (productId) => {
    const selectedProduct = products.find(
      (product) => product.id === productId
    );
    if (selectedProduct) {
      onChange(selectedProduct.price.toString());
    } else {
      onChange(null);
    }
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      loading={loading}
      disabled={loading || error}
      placeholder="Select a product"
    >
      {error && <Select.Option disabled>Error loading products</Select.Option>}
      {products.map((product) => (
        <Select.Option key={product.id} value={product.id}>
          {product.name}
        </Select.Option>
      ))}
    </Select>
  );
};

export default ProductSelect;
