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
                setUsers(response.data || []);
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
                selector: row => (
                    <img
                        src={row.profilePicture || "https://res.cloudinary.com/dnrbe1dpn/image/upload/v1745225977/profile_pictures/ej9p210i4urssawnhk6u.jpg"}
                        alt={row.firstName+" "+row.lastName}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }}
                    />
                ),
                sortable: false
            },
            { name: "User Name", selector: row => !row.firstName && !row.lastName ? "Firebase User" : row.firstName+" "+row.lastName, sortable: true },
            { name: "Email", selector: row => row.email, sortable: true },
            { name: "Phone", selector: row =>  !row.mobile ? "Firebase User" : row.mobile, sortable: true },
            {
                name: "Account Status",
                selector: row => row.status, 
                sortable: true
            },
            {
                name: "Actions",
                cell: row => (
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
                        noDataComponent="No users found."
                    />
                </div>
            </div>
        );
    };

    export default Users;
