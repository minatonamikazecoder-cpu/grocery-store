import React, { useEffect, useState } from 'react';
import api from "../../../utils/api";
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path as needed

interface UpdateProfileFormProps {
    userData: any;
    onUpdate?: () => void;
}

const UpdateProfileForm = ({ userData, onUpdate }: UpdateProfileFormProps) => {
    const { setUserData } = useAuth(); // Use context
    const user = userData;
    const [formData, setFormData] = useState<any>({
        firstName: '',
        lastName: '',
        mobile: '',
        profilePicture: null,
    });
    const [errors, setErrors] = useState<any>({});
    const [previewImage, setPreviewImage] = useState('/img/users/default-img.png');
    const [loading, setLoading] = useState(false); // Loading state

    // Set initial form data from props
    useEffect(() => {
        if (user) {
            const { firstName, lastName, mobile, profilePicture } = user;
            setFormData({ firstName, lastName, mobile, profilePicture: null });
            if (profilePicture) setPreviewImage(profilePicture);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));

        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const error = validateField('profilePicture', file);
            setErrors(prev => ({ ...prev, profilePicture: error }));

            if (!error) {
                setFormData(prev => ({ ...prev, profilePicture: file }));
                setPreviewImage(URL.createObjectURL(file));
            }
        }
    };

    const validateField = (name, value) => {
        let error = null;
        const nameRegex = /^[A-Za-z\s]+$/;
        const mobileRegex = /^[0-9]{10}$/;
        const maxSize = 1 * 1024 * 1024;

        switch (name) {
            case 'firstName':
            case 'lastName':
                if (!value.trim()) error = `${name === 'firstName' ? "First" : "Last"} name is required`;
                else if (!nameRegex.test(value)) error = "Only letters are allowed";
                else if (value.length < 2 || value.length > 30) error = "Must be between 2 and 30 characters";
                break;
            case 'mobile':
                if (!value.trim()) error = "mobile number is required";
                else if (!mobileRegex.test(value)) error = "mobile number must be exactly 10 digits";
                break;
            case 'profilePicture':
                if (value) {
                    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(value.type))
                        error = "Only JPG, JPEG, and PNG files are allowed";
                    else if (value.size > maxSize)
                        error = "File size must be less than 1MB";
                }
                break;
            default:
                break;
        }

        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formErrors = {};
        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) formErrors[field] = error;
        });
    
        if (Object.values(formErrors).some(err => err)) {
            setErrors(formErrors);
            return;
        }
    
        const submitData = new FormData();
        submitData.append('firstName', formData.firstName);
        submitData.append('lastName', formData.lastName);
        submitData.append('mobile', formData.mobile);
        submitData.append('status', 'active');
    
        if (formData.profilePicture) {
            submitData.append('profilePicture', formData.profilePicture);
        }
    
        setLoading(true);
    
        try {
            const response = await api.put(`/users/${user._id}`, submitData);
            if (response.data) {
                toast.success("Profile updated successfully!");
    
                // ✅ Update context
                setUserData(response.data);
    
                // ✅ Optional callback to refresh parent data
                onUpdate && onUpdate();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div>
            <form className="edit-profile form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row g-2">
                    <div className="col-12 col-sm-6 mb-1">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            className="w-100"
                            name="firstName"
                            placeholder="Your Name*"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        {errors.firstName && <p className="error">{errors.firstName}</p>}
                    </div>

                    <div className="col-12 col-sm-6">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="w-100"
                            name="lastName"
                            placeholder="Your Last name*"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                        {errors.lastName && <p className="error">{errors.lastName}</p>}
                    </div>

                    <div className="col-12 col-sm-6 mb-1">
                        <label className="form-label">Mobile</label>
                        <input
                            type="number"
                            className="w-100"
                            name="mobile"
                            placeholder="Your mobile*"
                            value={formData.mobile}
                            onChange={handleChange}
                        />
                        {errors.mobile && <p className="error">{errors.mobile}</p>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">User Image</label>
                        <input
                            type="file"
                            className="form-control"
                            name="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {errors.profilePicture && <p className="error">{errors.profilePicture}</p>}
                    </div>

                    <div className="col-md-6 text-center">
                        <img src={previewImage} alt="Profile" height="100" />
                    </div>
                </div>

                <div className="d-flex justify-content-end">
                    <input type="submit" value={loading ? "Loading..." : "Update Profile"} className="btn btn-primary w-100 mt-3" disabled={loading} />
                </div>
            </form>
        </div>
    );
};

export default UpdateProfileForm;
