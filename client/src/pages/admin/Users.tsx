import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import api from "../../utils/api";

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/users");
            setUsers(Array.isArray(response.data) ? response.data : (response.data?.data || []));
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Do you want to delete this user? This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/users/${userId}`);
                Swal.fire("Deleted!", "User has been removed.", "success");
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire("Error!", "Something went wrong while deleting the user.", "error");
            }
        }
    };

    const columns = [
        {
            name: "User Image",
            selector: (row: any) => (
                <img
                    src={row.profilePicture || "https://res.cloudinary.com/dnrbe1dpn/image/upload/v1745225977/profile_pictures/ej9p210i4urssawnhk6u.jpg"}
                    alt={row.firstName+" "+row.lastName}
                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }}
                />
            ),
            sortable: false
        },
        { name: "User Name", selector: (row: any) => !row.firstName && !row.lastName ? "Firebase User" : row.firstName+" "+row.lastName, sortable: true },
        { name: "Email", selector: (row: any) => row.email, sortable: true },
        { name: "Phone", selector: (row: any) =>  !row.mobile ? "Firebase User" : row.mobile, sortable: true },
        {
            name: "Account Status",
            selector: (row: any) => row.status, 
            sortable: true
        },
        {
            name: "Actions",
            cell: (row: any) => (
                <div className="d-flex gap-1">
                    {/* <Link to={`/admin/user-details/${row._id}`} className="btn btn-info btn-sm">View</Link> */}
                    <Link to={`/admin/update-user/${row._id}`} className="btn btn-warning btn-sm">Edit</Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row._id)}>Delete</button>
                    <Link to={`/admin/cart/${row._id}`} className="btn btn-info btn-sm">Cart</Link>
                </div>
            ),
            width:"250px"
        }
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mt-4 mb-4">
                <div>
                    <h1>User Management</h1>
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                        <li className="breadcrumb-item active">Users</li>
                    </ol>
                </div>
                <Link className="btn btn-primary" to="/admin/add-user">Add User</Link>
            </div>

            <div className="card-body">
                <DataTable
                    columns={columns}
                    data={users}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    responsive
                    striped
                    persistTableHead
                    noDataComponent={
                        <div className="empty-state-container w-100 py-4 my-2">
                            <svg className="empty-state-icon" style={{ width: '48px', height: '48px', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            <h5 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Users Found</h5>
                            <p className="empty-state-text" style={{ fontSize: '0.85rem', maxWidth: '300px', marginBottom: 0 }}>Registered customer and admin accounts will be listed here.</p>
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default Users;
