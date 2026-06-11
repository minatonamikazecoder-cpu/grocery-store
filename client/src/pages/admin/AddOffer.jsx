import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const AddOffer = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        offerDescription: "",
        offerCode: "",
        discount: "",
        maxDiscount: "",
        minOrder: "",
        startDate: "",
        endDate: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        const error = validateField(name, value);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    };

    const validateField = (name, value) => {
        let error = null;

        if (name === "offerDescription") {
            if (!value.trim()) error = "Offer description is required.";
            else if (value.length < 5) error = "Must be at least 5 characters.";
            else if (value.length > 100) error = "Cannot exceed 100 characters.";
        }

        if (name === "offerCode") {
            if (!value.trim()) error = "Offer code is required.";
            else if (!/^[A-Z0-9]+$/.test(value)) error = "Only uppercase letters and numbers allowed.";
            else if (value.length < 3 || value.length > 10) error = "Must be 3-10 characters.";
        }

        if (name === "discount") {
            if (!value.trim()) error = "Discount is required.";
            else if (!/^\d+(\.\d{1,2})?$/.test(value) || value < 1 || value > 100) error = "Discount must be 1-100%.";
        }

        if (name === "maxDiscount" || name === "minOrder") {
            if (!value.trim()) error = `${name === "maxDiscount" ? "Max discount" : "Min order"} is required.`;
            else if (!/^\d+(\.\d{1,2})?$/.test(value) || parseFloat(value) <= 0)
                error = `${name === "maxDiscount" ? "Max discount" : "Min order"} must be > 0.`;
        }

        if (name === "startDate") {
            if (!value.trim()) error = "Start date is required.";
        }

        if (name === "endDate") {
            if (!value.trim()) error = "End date is required.";
            else if (formData.startDate && new Date(value) <= new Date(formData.startDate))
                error = "End date must be after start date.";
        }

        return error;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) formErrors[field] = error;
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        try {
            const payload = {
                offerDescription: formData.offerDescription,
                offerCode: formData.offerCode,
                discount: parseFloat(formData.discount),
                maxDiscount: parseFloat(formData.maxDiscount),
                minimumOrder: parseFloat(formData.minOrder),
                startDate: formData.startDate,
                endDate: formData.endDate,
            };

            await api.post("/offers", payload);

            toast.success("Offer added successfully!");
            setFormData({
                offerDescription: "",
                offerCode: "",
                discount: "",
                maxDiscount: "",
                minOrder: "",
                startDate: "",
                endDate: "",
            });

            setTimeout(() => {
                navigate("/admin/offers");
            }, 1000);
        } catch (err) {
            toast.error("Failed to add offer. Please try again.");
        }
    };

    return (
        <div>
            <h1 className="mt-4">Add New Offer</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link to="/admin/offers">Offers</Link></li>
                <li className="breadcrumb-item active">Add Offer</li>
            </ol>

            <div className="card mb-4">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Offer Description</label>
                            <input
                                type="text"
                                className="form-control"
                                name="offerDescription"
                                value={formData.offerDescription}
                                onChange={handleChange}
                            />
                            {errors.offerDescription && <p className="text-danger">{errors.offerDescription}</p>}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Offer Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="offerCode"
                                    value={formData.offerCode}
                                    onChange={handleChange}
                                />
                                {errors.offerCode && <p className="text-danger">{errors.offerCode}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Discount (%)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleChange}
                                />
                                {errors.discount && <p className="text-danger">{errors.discount}</p>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Max Discount</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="maxDiscount"
                                    value={formData.maxDiscount}
                                    onChange={handleChange}
                                />
                                {errors.maxDiscount && <p className="text-danger">{errors.maxDiscount}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Min Order</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="minOrder"
                                    value={formData.minOrder}
                                    onChange={handleChange}
                                />
                                {errors.minOrder && <p className="text-danger">{errors.minOrder}</p>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                                {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                                {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">Add Offer</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddOffer;
