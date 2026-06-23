import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    profilePicture: null,
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrors((prev) => ({ ...prev, profilePicture: "Profile image is required." }));
      return;
    }

    const allowed = ["jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
      setErrors((prev) => ({ ...prev, profilePicture: "Image must be JPG, JPEG, or PNG." }));
      return;
    }

    setErrors((prev) => ({ ...prev, profilePicture: null }));
    setFormData((prev) => ({ ...prev, profilePicture: file }));
  };

  const validateField = (name, value) => {
    if (!value.trim()) return `${name[0].toUpperCase() + name.slice(1)} is required.`;

    switch (name) {
      case "firstName":
      case "lastName":
        if (value.length < 2) return `${name} must be at least 2 characters.`;
        if (!/^[A-Za-z\s]+$/.test(value)) return `${name} must contain only letters.`;
        break;
      case "email":
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format.";
        break;
      case "mobile":
        if (!/^\d{10}$/.test(value)) return "Mobile number must be 10 digits.";
        break;
      case "password":
        if (value.length < 6) return "Password must be at least 6 characters.";
        break;
      default:
        return null;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors: any = {};
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== "profilePicture") {
        const error = validateField(key, val);
        if (error) newErrors[key] = error;
      }
    });

    if (!formData.profilePicture) {
      newErrors.profilePicture = "Profile image is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const submission = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        submission.append(key, val);
      });

      submission.append("authType", "Email"); // hardcoded
      submission.append("status", "Active"); // hardcoded

      await api.post("/users", submission, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("User added successfully!");
      navigate("/admin/users");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mt-4">Add User</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/admin/">Dashboard</Link></li>
        <li className="breadcrumb-item"><Link to="/admin/users">Users</Link></li>
        <li className="breadcrumb-item active">Add User</li>
      </ol>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Mobile</label>
                <input type="tel" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} />
                {errors.mobile && <small className="text-danger">{errors.mobile}</small>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} />
                {errors.password && <small className="text-danger">{errors.password}</small>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Profile Picture</label>
                <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
                {errors.profilePicture && <small className="text-danger">{errors.profilePicture}</small>}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
