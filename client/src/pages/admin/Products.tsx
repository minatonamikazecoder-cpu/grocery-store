import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { PLACEHOLDER_IMAGE } from "../../utils/constants";

const ProductList = () => {
    // const customStyles = {
    //     rows: {
    //         style: {
    //             fontSize: '13px', // Increase row font size
    //         },
    //     },
    //     headCells: {
    //         style: {
    //             fontSize: '16px', // Increase header font size
    //             fontWeight: 'bold',
    //         },
    //     },
    //     cells: {
    //         style: {
    //             fontSize: '13px', // Increase cell font size
    //         },
    //     },
    // };
    const [products, setProducts] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await api.get("/products");
                setProducts(Array.isArray(res.data) ? res.data : (res.data?.data || []));
            } catch (err) {
                console.error("Failed to fetch products:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleDelete = (productId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/products/${productId}`);
                    setProducts(products.filter(p => p._id !== productId));
                    Swal.fire("Deleted!", "Product has been deleted.", "success");
                } catch (err) {
                    Swal.fire("Error", "Failed to delete product", "error");
                }
            }
        });
    };

   const columns = [
    {
        name: "Product ID",
        selector: row => row._id,
        sortable: true,
        width: "15%",
    },
    {
        name: "Product",
        selector: row => row.productName,
        cell: row => (
            <div className="d-flex align-items-center">
                <img
                    src={row.productImage || PLACEHOLDER_IMAGE}
                    alt={row.productName}
                    style={{ width: 50, height: 50, objectFit: "cover" }}
                    onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                />
                <span className="ms-2">{row.productName}</span>
            </div>
        ),
        sortable: true,
        width: "25%",
    },
    {
        name: "Price (₹)",
        selector: row => row.salePrice,
        sortable: true,
        width: "10%",
    },
    {
        name: "Discount(%)",
        selector: row => row.discount,
        sortable: true,
        width: "12%",
    },
    {
        name: "Stock",
        selector: row => row.stock,
        width: "8%",
    },
    {
        name: "Category",
        selector: row => row.categoryId?.name || "N/A",
        sortable: true,
        width: "15%",
    },
    {
        name: "Actions",
        cell: row => (
            <div className="d-flex flex-nowrap">
                {/* <Link className="btn btn-info btn-sm me-1" to={`/admin/view-product/${row._id}`}>View</Link> */}
                <Link className="btn btn-success btn-sm me-1" to={`/admin/update-product/${row._id}`}>Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
            </div>
        ),
        width: "15%",
    },
];

    const filteredItems = products.filter(
        item =>
            Object.values(item)
                .join(" ")
                .toLowerCase()
                .includes(filterText.toLowerCase())
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <div>
                    <h1>Products</h1>
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Products</li>
                    </ol>
                </div>
                <Link className="btn btn-primary" to="/admin/add-product">Add Product</Link>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                highlightOnHover
                striped
                responsive
                persistTableHead
                progressPending={loading}
                noDataComponent={
                    <div className="empty-state-container w-100 py-4 my-2">
                        <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Products Found</h5>
                        <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Add some products to stock your inventory.</p>
                    </div>
                }
                // customStyles={customStyles}
            />
        </div>
    );
};

export default ProductList;
