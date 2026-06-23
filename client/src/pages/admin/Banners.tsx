import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../utils/api";
import DataTable from "react-data-table-component";

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await api.get("/banners");
                setBanners(response.data);
            } catch (error) {
                console.error("Error fetching banners:", error);
                Swal.fire("Error", "Failed to fetch banners. Please try again later.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    const handleDelete = async (banner) => {
        Swal.fire({
            title: "Confirm Deletion",
            text: "Are you sure you want to delete this banner? This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Delete",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/banners/${banner._id}`);
                    setBanners(prev => prev.filter(b => b._id !== banner._id));
                    Swal.fire("Deleted!", "Banner deleted successfully.", "success");
                } catch (error) {
                    Swal.fire("Error", "Failed to delete the banner. Please try again.", "error");
                }
            }
        });
    };
    
    

    if (loading) {
        return (
            <div className="container mt-5 text-center py-5">
                <div className="spinner-border text-success" role="status" style={{ color: "#3bb77e" }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const freeDeliveryBanners = banners.filter(b => b.type === "freeDelivery");
    const firstOrderBanners = banners.filter(b => b.type === "firstOrder");
    const sliderBanners = banners.filter(b => b.type === "slider");

    const sliderColumns = [
        {
            name: "Image",
            cell: row => <img src={row.bannerImage} alt="banner" width="150" />,
        },
        {
            name: "View Order",
            selector: row => row.viewOrder,
            sortable: true,
        },
        {
            name: "Actions",
            cell: row => (
                <>
                    <Link to={`/admin/update-banner/${row._id}`} className="btn btn-secondary btn-sm ms-2">Edit</Link>
                    <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(row)}>
                        Delete
                    </button>
                </>
            ),
        },
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <div>
                    <h1 className="mt-4">Banner Management</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Banners</li>
                    </ol>
                </div>
                <Link to="/admin/add-banner" className="btn btn-primary text-nowrap">Add Banner</Link>
            </div>

            {/* Free Delivery Banners */}
            <div className="row">
                <div className="col-md-6 col-12">
                <h5>Free Delivery Banners</h5>
                {freeDeliveryBanners.length > 0 ? freeDeliveryBanners.map((banner: any) => (
                    <div className="col-12" key={banner._id}>
                        <h5>{banner.label}</h5>
                        <table className="table border text-nowrap">
                            <thead className="table-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <img src={banner.bannerImage} alt={banner.label} width="200" />
                                    </td>
                                    <td>
                                        <Link className="btn btn-secondary btn-sm ms-2" to={`/admin/update-banner/${banner._id}`}>Edit</Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )) : (
                    <div className="empty-state-container py-3 my-2" style={{ padding: '1.5rem' }}>
                        <h6 className="empty-state-title" style={{ fontSize: '1rem', marginBottom: 0 }}>No Free Delivery Banners</h6>
                    </div>
                )}
                </div>
                <div className="col-md-6 col-12">
                <h5>First Order Banners</h5>
                {firstOrderBanners.length > 0 ? firstOrderBanners.map((banner: any) => (
                    <div className="col-12" key={banner._id}>
                        <h5>{banner.label}</h5>
                        <table className="table border text-nowrap">
                            <thead className="table-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <img src={banner.bannerImage} alt={banner.label} width="200" />
                                    </td>
                                    <td>
                                        <Link className="btn btn-secondary btn-sm ms-2" to={`/admin/update-banner/${banner._id}`}>Edit</Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )) : (
                    <div className="empty-state-container py-3 my-2" style={{ padding: '1.5rem' }}>
                        <h6 className="empty-state-title" style={{ fontSize: '1rem', marginBottom: 0 }}>No First Order Banners</h6>
                    </div>
                )}
                </div>
            </div>

           
            {/* Slider Banners with DataTable */}
            <div className="mt-5">
                <h5>Banners for Slider</h5>
                <DataTable
                    columns={sliderColumns}
                    data={sliderBanners}
                    pagination
                    highlightOnHover
                    responsive
                    striped
                    noDataComponent={
                        <div className="empty-state-container w-100 py-4 my-2">
                            <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Slider Banners</h5>
                            <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Banners configured for the homepage slideshow will appear here.</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default Banners;
