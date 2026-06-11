import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import { toast } from "react-toastify";
import DataTable from "react-data-table-component";

const Cart = () => {
  const { userId } = useParams();
  const [user, setUser] = useState({ firstName: "", lastName: "" });
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/cart/${userId}`);
      const cartItems = data.items.map(item => ({
        id: item.productId._id,
        name: item.productId.productName,
        quantity: item.quantity,
        price: item.productId.salePrice,
        image: item.productId.productImage,
        itemId: item._id,
      }));
      setCart(cartItems);
      calculateTotal(cartItems);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalAmount(total);
  };

  const handleRemove = (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this product from the cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        api
          .delete(`/cart/${userId}`, {
            data: { productId },
          })
          .then(() => {
            const updated = cart.filter((item) => item.id !== productId);
            setCart(updated);
            calculateTotal(updated);
            toast.success("Product removed from cart!", {
              position: "top-right",
            });
          })
          .catch(() => {
            toast.error("Failed to remove product!");
          });
      }
    });
  };

  const updateQuantity = (id, amount) => {
    const updatedItem = cart.find((item) => item.id === id);
    if (!updatedItem) return;

    const newQuantity = updatedItem.quantity + amount;
    if (newQuantity < 1) return;

    api
      .put(`/cart/${userId}`, {
        productId: id,
        quantity: newQuantity,
      })
      .then(() => {
        const updatedCart = cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);
        calculateTotal(updatedCart);
        toast.success("Cart updated successfully");
      })
      .catch(() => {
        toast.error("Failed to update cart");
      });
  };

  const columns = [
    {
      name: "Product",
      selector: (row) => (
        <div className="d-flex align-items-center">
          <img
            src={row.image}
            alt={row.name}
            style={{ width: 50, height: 50, objectFit: "cover" }}
            className="me-2"
          />
          <Link to="/admin/view-product">{row.name}</Link>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Quantity",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => updateQuantity(row.id, -1)}
          >
            -
          </button>
          {row.quantity}
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => updateQuantity(row.id, 1)}
          >
            +
          </button>
        </div>
      ),
    },
    {
      name: "Price",
      selector: (row) => `₹${row.price}`,
    },
    {
      name: "Total",
      selector: (row) => `₹${row.price * row.quantity}`,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          className="btn btn-danger"
          onClick={() => handleRemove(row.id)}
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
        <div>
          <h1>Cart of {user.firstName} {user.lastName}</h1>
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/users">Users</Link></li>
            <li className="breadcrumb-item active">Cart</li>
          </ol>
        </div>
        <Link className="btn btn-primary text-nowrap" to={`/admin/add-to-cart/${userId}`}>Add Items</Link>
      </div>

      <div className="card-body">
        <DataTable
          columns={columns}
          data={cart}
          progressPending={loading}
          persistTableHead
          responsive
          striped
          highlightOnHover
          noDataComponent="No items in the cart."
        />
        {cart.length > 0 && (
          <div className="d-flex justify-content-end mt-3">
            <h5>Total Amount: ₹{totalAmount}</h5>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
