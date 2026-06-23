import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from "../../../utils/api";

const BillingAddressForm = ({ userId ,fetchAddresses}) => {
    const [formData, setFormData] = useState({
        billingFirstName: '',
        billingLastName: '',
        billingAddress: '',
        billingApartment: '',
        billingCity: '',
        billingState: '',
        billingPinCode: '',
        billingPhone: ''
    });

    const [errors, setErrors] = useState<any>({});

    const getFieldLabel = (fieldName: string) => {
        const fieldLabels = {
            billingFirstName: "First Name",
            billingLastName: "Last Name",
            billingCity: "City",
            billingState: "State",
            billingAddress: "Street Address",
            billingPinCode: "Pin Code",
            billingPhone: "Phone Number",
        };
        return fieldLabels[fieldName] || "This field";
    };

    const validateField = (name, value) => {
        if (!value.trim()) return `${getFieldLabel(name)} is required`;

        if (["billingFirstName", "billingLastName", "billingCity", "billingState"].includes(name)) {
            if (!/^[A-Za-z\s]+$/.test(value)) return `${getFieldLabel(name)} should contain only letters`;
            if (value.length < 3 || value.length > 50) return `${getFieldLabel(name)} must be between 3 and 50 characters`;
        }

        if (name === "billingAddress" && (value.length < 5 || value.length > 100)) {
            return "Street Address must be between 5 and 100 characters";
        }

        if (name === "billingPinCode" && !/^\d{6}$/.test(value)) {
            return "Pin Code must be exactly 6 digits";
        }

        if (name === "billingPhone" && !/^\d{10}$/.test(value)) {
            return "Phone number must be exactly 10 digits";
        }

        return null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        Object.keys(formData).forEach(field => {
            const error = validateField(field, formData[field]);
            if (error) newErrors[field] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please correct the highlighted fields.");
            return;
        }

        // Construct address object for API
        const payload = {
            userId, // passed as prop
            fullName: `${formData.billingFirstName} ${formData.billingLastName}`,
            address: formData.billingAddress + (formData.billingApartment ? `, ${formData.billingApartment}` : ''),
            city: formData.billingCity,
            state: formData.billingState,
            pincode: Number(formData.billingPinCode),
            phone: formData.billingPhone
        };

        try {
            const res = await api.post('/addresses/', payload);
            toast.success('Billing address saved successfully!');
            setFormData({
                billingFirstName: '',
                billingLastName: '',
                billingAddress: '',
                billingApartment: '',
                billingCity: '',
                billingState: '',
                billingPinCode: '',
                billingPhone: ''
            });
            fetchAddresses(userId);
        } catch (err) {
            console.error(err);
            toast.error('Failed to save address. Please try again.');
        }
    };

    return (
        <>
            <form id="billingForm" className="billing-details form" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <h2 className="mt-2">Billing Details</h2>
                    <div className="row gx-2 gy-3">
                        {['billingFirstName', 'billingLastName', 'billingCity', 'billingState', 'billingPinCode', 'billingPhone'].map((field, index) => (
                            <div className="col-12 col-sm-6" key={index}>
                                <label className="form-label d-block">{getFieldLabel(field)}<span className="required">*</span></label>
                                <input
                                    name={field}
                                    type="text"
                                    className="w-100"
                                    placeholder={getFieldLabel(field)}
                                    value={formData[field]}
                                    onChange={handleChange}
                                />
                                {errors[field] && <p className="error text-danger">{errors[field]}</p>}
                            </div>
                        ))}
                        <div className="col-12">
                            <label className="form-label d-block">Street Address<span className="required">*</span></label>
                            <textarea
                                name="billingAddress"
                                className="w-100"
                                rows={2}
                                placeholder="Street Address"
                                value={formData.billingAddress}
                                onChange={handleChange}
                            />
                            {errors.billingAddress && <p className="error text-danger">{errors.billingAddress}</p>}
                        </div>
                        <div className="col-12">
                            <label className="form-label d-block">Apartment, Floor, etc.<span className="required">*</span></label>
                            <textarea
                                name="billingApartment"
                                className="w-100"
                                rows={2}
                                placeholder="Apartment, Floor, etc."
                                value={formData.billingApartment}
                                onChange={handleChange}
                            />
                              {errors.billingApartment && <p className="error text-danger">{errors.billingApartment}</p>}
                        </div>
                    </div>
                </div>
                <div className="d-flex justify-content-end">
                    <input type="submit" value="Save Address" className="btn btn-primary js-filter-btn mt-2" />
                </div>
            </form>
        </>
    );
};

export default BillingAddressForm;
