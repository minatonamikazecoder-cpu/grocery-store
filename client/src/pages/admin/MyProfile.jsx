import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const MyProfile = () => {
  const { user,setUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    profilePicture: null,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (message) toast.success(message);

    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${user._id}`);
        setProfileForm({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          mobile: response.data.mobile || "",
          profilePicture: null,
        });
      } catch (error) {
        toast.error("Failed to load profile data");
      }
    };

    fetchUserData();
  }, [message, user._id]);

  const handleProfileChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === "file" ? files[0] : value;
    setProfileForm({ ...profileForm, [name]: newValue });

    const error = validateField(name, newValue);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });

    const error = validateField(name, value);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateField = (name, value) => {
    let error = null;

    if (name === "firstName" && !value) {
      error = "First name is required.";
    }

    if (name === "lastName" && !value) {
      error = "Last name is required.";
    }

    if (name === "mobile") {
      if (!value) {
        error = "Phone number is required.";
      } else if (!/^\d{10}$/.test(value)) {
        error = "Invalid mobile number format (10 digits required).";
      }
    }

    if (name === "profilePicture") {
      if (value && !["image/jpeg", "image/png", "image/jpg"].includes(value.type)) {
        error = "Only JPG, JPEG, and PNG images are allowed.";
      }
    }

    if (name === "currentPassword" && value.length < 6) {
      error = "Current password must be at least 6 characters.";
    }

    if (name === "newPassword" && value.length < 6) {
      error = "New password must be at least 6 characters.";
    }

    if (name === "confirmPassword" && value !== passwordForm.newPassword) {
      error = "Passwords do not match.";
    }

    return error;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {};
    Object.keys(profileForm).forEach((field) => {
      const error = validateField(field, profileForm[field]);
      if (error) formErrors[field] = error;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(profileForm).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await api.put(`/users/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data) {
        setUserData(response.data);
        toast.success("Profile updated successfully!");
      }
    } catch (err) {
      toast.error("Profile update failed!");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {};
    Object.keys(passwordForm).forEach((field) => {
      const error = validateField(field, passwordForm[field]);
      if (error) formErrors[field] = error;
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await api.put("/users/update-password", {
        email: user.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (response.data) {
        toast.success("Password updated successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response.data);
    }
  };

  return (
    <div>
      <h1 className="mt-4">My Profile</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
        <li className="breadcrumb-item active">My Profile</li>
      </ol>

      {/* Profile Update */}
      <div className="card mb-4">
        <div className="card-header"><h4>Update Profile</h4></div>
        <div className="card-body">
          <form onSubmit={handleProfileSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control" name="firstName" value={profileForm.firstName} onChange={handleProfileChange} />
              {errors.firstName && <p className="text-danger">{errors.firstName}</p>}
            </div>
            <div className="mb-3">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control" name="lastName" value={profileForm.lastName} onChange={handleProfileChange} />
              {errors.lastName && <p className="text-danger">{errors.lastName}</p>}
            </div>
            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" name="mobile" value={profileForm.mobile} onChange={handleProfileChange} />
              {errors.mobile && <p className="text-danger">{errors.mobile}</p>}
            </div>
            <div className="mb-3">
              <label className="form-label">Profile Picture</label>
              <input type="file" className="form-control" name="profilePicture" accept="image/png, image/jpeg, image/jpg" onChange={handleProfileChange} />
              {errors.profilePicture && <p className="text-danger">{errors.profilePicture}</p>}
              <img src={user.profilePicture ? user.profilePicture : "/img/users/default-img.png"} alt="User" height="150px" className="mt-2" />
            </div>
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        </div>
      </div>

      {/* Password Update */}
      <div className="card mb-4">
        <div className="card-header"><h4>Update Password</h4></div>
        <div className="card-body">
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
              {errors.currentPassword && <p className="text-danger">{errors.currentPassword}</p>}
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} />
              {errors.newPassword && <p className="text-danger">{errors.newPassword}</p>}
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-control" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
              {errors.confirmPassword && <p className="text-danger">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" className="btn btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
